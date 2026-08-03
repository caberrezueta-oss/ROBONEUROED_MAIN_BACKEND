const { Op, fn, col } = require("sequelize");
const { Session, Student, SystemConfig } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { capitalizeWords } = require("../utils/textFormat");

function classifyFocus(score) {
  if (score >= 85) return { label: `Excelente (${score}%)`, type: "success" };
  if (score >= 70) return { label: `Regular (${score}%)`, type: "warning" };
  return { label: `Bajo (${score}%)`, type: "warning" };
}

const getSessions = asyncHandler(async (req, res) => {
  const { student } = req.query;

  const where = {};
  if (student) {
    where.studentName = { [Op.iLike]: `%${student}%` };
  }

  const sessions = await Session.findAll({
    where,
    order: [["date", "DESC"], ["createdAt", "DESC"]],
  });

  // Mapea al formato que ya consume Sessions.jsx en el frontend
  const formatted = sessions.map((s) => {
    const focus = classifyFocus(s.focusScore);
    return {
      id: s.code,
      student: s.studentName,
      date: s.date,
      duration: `${s.durationMinutes} min`,
      focus: focus.label,
      type: focus.type,
    };
  });

  res.json(formatted);
});

const createSession = asyncHandler(async (req, res) => {
  const { studentName, durationMinutes, focusScore, alphaWave, betaWave, studentId, date } = req.body;

  if (!studentName || focusScore === undefined) {
    return res.status(400).json({ error: "studentName y focusScore son obligatorios." });
  }

  const code = `NEURO-${Date.now()}`;

  const config = await SystemConfig.findOne();
  const threshold = config?.minAttentionThreshold ?? 60;
  const belowThreshold = focusScore < threshold;

  const session = await Session.create({
    code,
    studentName: capitalizeWords(studentName),
    durationMinutes: durationMinutes || 0,
    focusScore,
    alphaWave,
    betaWave,
    studentId,
    date: date || new Date(),
    belowThreshold,
  });

  // Refuerzo positivo: sesión "buena" es aquella que NO quedó bajo el umbral.
  // Se lleva una racha por estudiante para mostrarla como logro.
  let streakInfo = null;
  if (studentId) {
    const student = await Student.findByPk(studentId);
    if (student) {
      const newStreak = belowThreshold ? 0 : student.streak + 1;
      const newBestStreak = Math.max(newStreak, student.bestStreak);
      await student.update({
        streak: newStreak,
        bestStreak: newBestStreak,
        lastConnection: date || new Date().toISOString().slice(0, 10),
      });
      streakInfo = { streak: newStreak, bestStreak: newBestStreak, isNewRecord: newStreak > 0 && newStreak === newBestStreak };
    }
  }

  res.status(201).json({ session, streakInfo });
});

// Alimenta las tarjetas del Dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const sessionsCount = await Session.count();

  const avgResult = await Session.findOne({
    attributes: [[fn("AVG", col("focus_score")), "avgFocus"]],
    raw: true,
  });

  const avgAttention = avgResult?.avgFocus ? Math.round(avgResult.avgFocus) : 0;

  res.json({
    sessionsCount,
    avgAttention,
    hardwareStatus: "Activo",
  });
});

// Alimenta la gráfica "Progreso Atencional Semanal" del Dashboard.
// Devuelve el foco atencional agrupado por día Y por estudiante, para que
// el frontend pueda dibujar una línea por cada estudiante en vez de un
// promedio general que mezcla a todos.
const getWeeklyAttention = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const sessions = await Session.findAll({
    where: { date: { [Op.gte]: sevenDaysAgo } },
    order: [["date", "ASC"]],
  });

  const dayLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // grouped[dia][estudiante] = [scores...]
  const grouped = {};
  const studentNames = new Set();

  sessions.forEach((s) => {
    const dayIndex = new Date(s.date).getDay();
    const label = dayLabels[dayIndex];
    const name = s.studentName || "Sin nombre";
    studentNames.add(name);

    if (!grouped[label]) grouped[label] = {};
    if (!grouped[label][name]) grouped[label][name] = [];
    grouped[label][name].push(s.focusScore);
  });

  const avg = (arr) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null);

  // Un renglón por día, con una columna por estudiante (promedio de ese
  // día). Si un estudiante no tuvo sesión ese día, su valor queda null
  // para que el gráfico no dibuje un punto falso en 0.
  const data = Object.entries(grouped).map(([day, byStudent]) => {
    const row = { day };
    Object.entries(byStudent).forEach(([name, scores]) => {
      row[name] = avg(scores);
    });
    return row;
  });

  res.json({
    data,
    students: Array.from(studentNames),
  });
});

module.exports = {
  getSessions,
  createSession,
  getDashboardStats,
  getWeeklyAttention,
};
