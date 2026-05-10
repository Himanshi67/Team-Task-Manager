const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// Validation helpers
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  return {
    isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar,
    minLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar
  };
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

async function register(req, res) {
  const { name, email, password, department } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email, and password are required." });
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  // Validate email format
  if (!validateEmail(normalizedEmail)) {
    return res.status(400).json({ message: "Please provide a valid email address." });
  }

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    const missing = [];
    if (!passwordValidation.minLength) missing.push("at least 8 characters");
    if (!passwordValidation.hasUppercase) missing.push("an uppercase letter");
    if (!passwordValidation.hasLowercase) missing.push("a lowercase letter");
    if (!passwordValidation.hasNumber) missing.push("a number");
    if (!passwordValidation.hasSpecialChar) missing.push("a special character (!@#$%^&*)");
    
    return res.status(400).json({ 
      message: `Password must contain ${missing.join(", ")}.` 
    });
  }

  const selectedRole = "Member";
  const selectedDepartment = String(department || "General").trim() || "General";

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, department)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, department, created_at`,
      [name.trim(), normalizedEmail, passwordHash, selectedRole, selectedDepartment]
    );

    const user = result.rows[0];
    const token = signToken(user);

    return res.status(201).json({ token, user });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register user.", error: error.message });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required." });
  }

  try {
    const result = await pool.query(
      "SELECT id, name, email, role, department, password_hash FROM users WHERE email = $1",
      [String(email).toLowerCase().trim()]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    };

    const token = signToken(safeUser);

    return res.json({ token, user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: "Failed to login.", error: error.message });
  }
}

async function registerAdmin(req, res) {
  const { name, email, password, department, inviteCode } = req.body;

  if (!name || !email || !password || !inviteCode) {
    return res.status(400).json({ message: "name, email, password, and inviteCode are required." });
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  // Validate email format
  if (!validateEmail(normalizedEmail)) {
    return res.status(400).json({ message: "Please provide a valid email address." });
  }

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    const missing = [];
    if (!passwordValidation.minLength) missing.push("at least 8 characters");
    if (!passwordValidation.hasUppercase) missing.push("an uppercase letter");
    if (!passwordValidation.hasLowercase) missing.push("a lowercase letter");
    if (!passwordValidation.hasNumber) missing.push("a number");
    if (!passwordValidation.hasSpecialChar) missing.push("a special character (!@#$%^&*)");
    
    return res.status(400).json({ 
      message: `Password must contain ${missing.join(", ")}.` 
    });
  }

  // Validate invite code (can be configured via environment variable)
  const validInviteCodes = (process.env.ADMIN_INVITE_CODES || "ADMIN-2024,ADMIN-SECRET").split(",").map(s => s.trim());
  if (!validInviteCodes.includes(inviteCode)) {
    return res.status(403).json({ message: "Invalid invite code." });
  }

  const selectedDepartment = String(department || "General").trim() || "General";

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, department)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, department, created_at`,
      [name.trim(), normalizedEmail, passwordHash, "Admin", selectedDepartment]
    );

    const user = result.rows[0];
    const token = signToken(user);

    return res.status(201).json({ token, user });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register admin user.", error: error.message });
  }
}

module.exports = {
  register,
  login,
  registerAdmin
};
