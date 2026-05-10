function checkRole(...allowedRoles) {
  return (req, res, next) => {
    const role = (req.user?.role || "").toLowerCase();

    if (!allowedRoles.map((r) => r.toLowerCase()).includes(role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions." });
    }

    return next();
  };
}

module.exports = checkRole;
