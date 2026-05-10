const express = require("express");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/role");
const {
  getProjects,
  createProject,
  addProjectMember
  ,getProjectMembers
} = require("../controllers/projectController");
const { getProjectTasks } = require("../controllers/taskController");

const router = express.Router();

router.get("/", auth, getProjects);
router.post("/", auth, checkRole("Admin"), createProject);
router.post("/:projectId/members", auth, checkRole("Admin"), addProjectMember);
router.get("/:projectId/members", auth, getProjectMembers);
router.get("/:projectId/tasks", auth, getProjectTasks);

module.exports = router;
