const express = require("express");
const { register, login, registerAdmin } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/register-admin", registerAdmin);

module.exports = router;
