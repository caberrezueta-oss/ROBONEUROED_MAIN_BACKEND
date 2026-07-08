const express = require("express");
const {
  receiveHeartbeat,
  getRobotStatus,
  getActiveDesafioForRobot,
  startLiveSession,
  updateLiveSession,
  endLiveSession,
  getPauseFlag,
  setPauseFlag,
  getLiveSession,
} = require("../controllers/robot.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// --- ESP32 (sin JWT, validado con x-device-key en el controlador) ---
router.post("/heartbeat", receiveHeartbeat);
router.get("/desafio-activo", getActiveDesafioForRobot);
router.post("/session/start", startLiveSession);
router.post("/session/update", updateLiveSession);
router.post("/session/end", endLiveSession);
router.get("/session/pause-flag", getPauseFlag);

// --- Frontend (requiere login) ---
router.get("/status", requireAuth, getRobotStatus);
router.get("/session/live", requireAuth, getLiveSession);
router.put("/session/pause", requireAuth, setPauseFlag);

module.exports = router;
