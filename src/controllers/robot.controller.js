const { RobotHeartbeat, LiveSession, Student, SystemConfig, Session } = require("../models");
const { resolveActiveDesafio } = require("./questions.controller");
const asyncHandler = require("../utils/asyncHandler");
const { capitalizeWords } = require("../utils/textFormat");

function checkDeviceKey(req) {
  const deviceKey = req.headers["x-device-key"];
  return !!process.env.ROBOT_DEVICE_KEY && deviceKey === process.env.ROBOT_DEVICE_KEY;
}

// Margen de tolerancia: si el ESP32 manda heartbeat cada 3-5s, 10s de
// tolerancia evita que un parpadeo de Wi-Fi haga que el Dashboard
// oscile entre "Activo" e "Inactivo" como árbol de Navidad.
const HEARTBEAT_TIMEOUT_MS = 10 * 1000;

// Llamado por el ESP32 cada pocos segundos mientras está encendido y conectado.
// No requiere JWT (el robot no "inicia sesión"), pero sí una clave compartida
// simple para que no cualquiera pueda spamear este endpoint.
const receiveHeartbeat = asyncHandler(async (req, res) => {
  const deviceKey = req.headers["x-device-key"];

  if (!process.env.ROBOT_DEVICE_KEY || deviceKey !== process.env.ROBOT_DEVICE_KEY) {
    return res.status(401).json({ error: "Clave de dispositivo inválida." });
  }

  const { deviceInfo } = req.body || {};

  let heartbeat = await RobotHeartbeat.findOne();
  if (!heartbeat) {
    heartbeat = await RobotHeartbeat.create({});
  }

  await heartbeat.update({
    lastHeartbeatAt: new Date(),
    ...(deviceInfo && { deviceInfo }),
  });

  res.json({ ok: true });
});

// Consultado por el frontend (Dashboard, RobotControl) para saber si el
// robot está conectado en este momento.
const getRobotStatus = asyncHandler(async (req, res) => {
  const heartbeat = await RobotHeartbeat.findOne();

  if (!heartbeat || !heartbeat.lastHeartbeatAt) {
    return res.json({ status: "Desconectado", lastSeen: null });
  }

  const msSinceLastBeat = Date.now() - new Date(heartbeat.lastHeartbeatAt).getTime();
  const status = msSinceLastBeat <= HEARTBEAT_TIMEOUT_MS ? "Activo" : "Inactivo";

  res.json({
    status,
    lastSeen: heartbeat.lastHeartbeatAt,
    deviceInfo: heartbeat.deviceInfo || null,
  });
});

// Consultado por el ESP32 cuando el estudiante falla la pregunta regular,
// para saber qué mostrar en pantalla como Modo Desafío.
async function getActiveDesafioForRobotHandler(req, res) {
  const deviceKey = req.headers["x-device-key"];
  if (!process.env.ROBOT_DEVICE_KEY || deviceKey !== process.env.ROBOT_DEVICE_KEY) {
    return res.status(401).json({ error: "Clave de dispositivo inválida." });
  }

  const active = await resolveActiveDesafio();
  if (!active) {
    return res.status(404).json({ error: "No hay pregunta de desafío configurada todavía." });
  }

  res.json(active);
}

const getActiveDesafioForRobot = asyncHandler(getActiveDesafioForRobotHandler);

// --- SESIÓN EN VIVO -----------------------------------------------------

// El ESP32 llama esto cuando arranca una sesión con un estudiante.
const startLiveSession = asyncHandler(async (req, res) => {
  if (!checkDeviceKey(req)) return res.status(401).json({ error: "Clave de dispositivo inválida." });

  const { studentName, studentId } = req.body || {};
  if (!studentName) return res.status(400).json({ error: "studentName es obligatorio." });

  let live = await LiveSession.findOne();
  if (!live) live = await LiveSession.create({});

  await live.update({
    status: "running",
    studentName: capitalizeWords(studentName),
    studentId: studentId || null,
    startedAt: new Date(),
    currentFocus: null,
    currentAlpha: null,
    currentBeta: null,
    belowThreshold: false,
    pauseRequested: false,
  });

  res.json({ ok: true });
});

// El ESP32 llama esto periódicamente MIENTRAS dura la sesión (telemetría en vivo).
const updateLiveSession = asyncHandler(async (req, res) => {
  if (!checkDeviceKey(req)) return res.status(401).json({ error: "Clave de dispositivo inválida." });

  const { focusScore, alphaWave, betaWave } = req.body || {};

  const live = await LiveSession.findOne();
  if (!live || live.status !== "running") {
    return res.status(409).json({ error: "No hay ninguna sesión en curso." });
  }

  const config = await SystemConfig.findOne();
  const threshold = config?.minAttentionThreshold ?? 60;
  const belowThreshold = focusScore !== undefined ? focusScore < threshold : live.belowThreshold;

  await live.update({
    ...(focusScore !== undefined && { currentFocus: focusScore }),
    ...(alphaWave !== undefined && { currentAlpha: alphaWave }),
    ...(betaWave !== undefined && { currentBeta: betaWave }),
    belowThreshold,
  });

  res.json({ ok: true, pauseRequested: live.pauseRequested });
});

// El ESP32 llama esto al terminar la sesión: guarda el registro final y
// calcula la racha de refuerzo positivo del estudiante.
const endLiveSession = asyncHandler(async (req, res) => {
  if (!checkDeviceKey(req)) return res.status(401).json({ error: "Clave de dispositivo inválida." });

  const live = await LiveSession.findOne();
  if (!live || live.status === "idle") {
    return res.status(409).json({ error: "No hay ninguna sesión en curso para terminar." });
  }

  const { durationMinutes, focusScore, alphaWave, betaWave } = req.body || {};
  const finalFocus = focusScore !== undefined ? focusScore : live.currentFocus || 0;

  const config = await SystemConfig.findOne();
  const threshold = config?.minAttentionThreshold ?? 60;
  const belowThreshold = finalFocus < threshold;

  const code = `NEURO-${Date.now()}`;
  await Session.create({
    code,
    studentName: live.studentName,
    studentId: live.studentId,
    durationMinutes: durationMinutes || 0,
    focusScore: finalFocus,
    alphaWave: alphaWave ?? live.currentAlpha,
    betaWave: betaWave ?? live.currentBeta,
    belowThreshold,
    date: new Date(),
  });

  let streakInfo = null;
  if (live.studentId) {
    const student = await Student.findByPk(live.studentId);
    if (student) {
      const newStreak = belowThreshold ? 0 : student.streak + 1;
      const newBestStreak = Math.max(newStreak, student.bestStreak);
      await student.update({
        streak: newStreak,
        bestStreak: newBestStreak,
        lastConnection: new Date().toISOString().slice(0, 10),
      });
      streakInfo = { streak: newStreak, bestStreak: newBestStreak, isNewRecord: newStreak > 0 && newStreak === newBestStreak };
    }
  }

  await live.update({
    status: "idle",
    studentName: null,
    studentId: null,
    startedAt: null,
    currentFocus: null,
    currentAlpha: null,
    currentBeta: null,
    belowThreshold: false,
    pauseRequested: false,
  });

  res.json({ ok: true, streakInfo });
});

// Consultado por el ESP32 para saber si el profesor pidió pausar.
const getPauseFlag = asyncHandler(async (req, res) => {
  if (!checkDeviceKey(req)) return res.status(401).json({ error: "Clave de dispositivo inválida." });
  const live = await LiveSession.findOne();
  res.json({ paused: live?.pauseRequested || false });
});

// El profesor pide pausar/reanudar desde la web (Control del Robot).
const setPauseFlag = asyncHandler(async (req, res) => {
  const { paused } = req.body;
  let live = await LiveSession.findOne();
  if (!live) live = await LiveSession.create({});

  await live.update({
    pauseRequested: !!paused,
    status: live.status === "idle" ? "idle" : paused ? "paused" : "running",
  });

  res.json({ ok: true, paused: !!paused });
});

// Consultado por el frontend (polling) para mostrar telemetría en vivo.
const getLiveSession = asyncHandler(async (req, res) => {
  const live = await LiveSession.findOne();
  res.json(live);
});

module.exports = {
  receiveHeartbeat,
  getRobotStatus,
  getActiveDesafioForRobot,
  startLiveSession,
  updateLiveSession,
  endLiveSession,
  getPauseFlag,
  setPauseFlag,
  getLiveSession,
};
