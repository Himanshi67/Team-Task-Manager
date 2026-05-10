const express = require("express");
const auth = require("../middleware/auth");
const {
	createTask,
	updateTaskStatus,
	getTaskDetails,
	addSubtask,
	toggleSubtask,
	addComment,
	deleteComment,
	getTaskSummary,
	getDashboardStats
} = require("../controllers/taskController");

const router = express.Router();

router.get("/summary", auth, getTaskSummary);
router.get("/dashboard", auth, getDashboardStats);
router.post("/", auth, createTask);
router.get("/:id/details", auth, getTaskDetails);
router.post("/:id/subtasks", auth, addSubtask);
router.patch("/:id/subtasks/:subtaskId", auth, toggleSubtask);
router.post("/:id/comments", auth, addComment);
router.delete("/:id/comments/:commentId", auth, deleteComment);
router.patch("/:id/status", auth, updateTaskStatus);
router.patch("/:id", auth, updateTaskStatus);

module.exports = router;
