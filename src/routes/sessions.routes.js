const express = require("express");
const {
  getSessions,
  createSession,
  getDashboardStats,
  getWeeklyAttention,
} = require("../controllers/sessions.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", getSessions);
router.post("/", createSession);
router.get("/stats/dashboard", getDashboardStats);
router.get("/stats/weekly-attention", getWeeklyAttention);

module.exports = router;
