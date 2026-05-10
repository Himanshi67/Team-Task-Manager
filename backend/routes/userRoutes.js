const express = require("express");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/role");
const { listUsers } = require("../controllers/userController");

const router = express.Router();

router.get("/", auth, checkRole("Admin"), listUsers);

module.exports = router;
