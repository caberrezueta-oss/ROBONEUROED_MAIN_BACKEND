const express = require("express");
const {
  getStudents,
  getStudentById,
  getStudentProgress,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/students.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", getStudents);
router.get("/:id", getStudentById);
router.get("/:id/progress", getStudentProgress);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

module.exports = router;
