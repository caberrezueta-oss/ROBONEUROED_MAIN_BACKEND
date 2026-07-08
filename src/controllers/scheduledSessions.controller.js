const { ScheduledSession } = require("../models");
const asyncHandler = require("../utils/asyncHandler");

const getScheduledSessions = asyncHandler(async (req, res) => {
  const sessions = await ScheduledSession.findAll({ order: [["scheduledAt", "ASC"]] });
  res.json(sessions);
});

const createScheduledSession = asyncHandler(async (req, res) => {
  const { studentId, studentName, scheduledAt, notes } = req.body;
  if (!studentName || !scheduledAt) {
    return res.status(400).json({ error: "studentName y scheduledAt son obligatorios." });
  }

  const session = await ScheduledSession.create({ studentId, studentName, scheduledAt, notes });
  res.status(201).json(session);
});

const updateScheduledSession = asyncHandler(async (req, res) => {
  const session = await ScheduledSession.findByPk(req.params.id);
  if (!session) return res.status(404).json({ error: "Sesión programada no encontrada." });

  await session.update(req.body);
  res.json(session);
});

const deleteScheduledSession = asyncHandler(async (req, res) => {
  const session = await ScheduledSession.findByPk(req.params.id);
  if (!session) return res.status(404).json({ error: "Sesión programada no encontrada." });

  await session.destroy();
  res.status(204).send();
});

module.exports = {
  getScheduledSessions,
  createScheduledSession,
  updateScheduledSession,
  deleteScheduledSession,
};
