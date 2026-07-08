const express = require("express");
const {
  getScheduledSessions,
  createScheduledSession,
  updateScheduledSession,
  deleteScheduledSession,
} = require("../controllers/scheduledSessions.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", getScheduledSessions);
router.post("/", createScheduledSession);
router.put("/:id", updateScheduledSession);
router.delete("/:id", deleteScheduledSession);

module.exports = router;
