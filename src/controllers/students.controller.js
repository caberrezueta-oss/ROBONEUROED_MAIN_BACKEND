const { Student, Session } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { capitalizeWords } = require("../utils/textFormat");

const NAME_REGEX = /^[A-Za-zÀ-ÿñÑ\s]+$/;
const AGE_REGEX = /^[0-9]{1,2}$/;

function validateStudentFields({ name, age, condition }) {
  if (name !== undefined && name !== null && name !== "" && !NAME_REGEX.test(name)) {
    return "El nombre solo puede contener letras y espacios.";
  }
  if (age !== undefined && age !== null && age !== "" && !AGE_REGEX.test(String(age))) {
    return "La edad solo puede contener números (0 a 99).";
  }
  if (condition !== undefined && condition.length > 80) {
    return "La condición no puede superar los 80 caracteres.";
  }
  return null;
}

const getStudents = asyncHandler(async (req, res) => {
  const students = await Student.findAll({ order: [["createdAt", "DESC"]] });
  res.json(students);
});

const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findByPk(req.params.id);
  if (!student) return res.status(404).json({ error: "Estudiante no encontrado." });
  res.json(student);
});

// Historial de sesiones de un estudiante, listo para graficar su progreso.
const getStudentProgress = asyncHandler(async (req, res) => {
  const student = await Student.findByPk(req.params.id);
  if (!student) return res.status(404).json({ error: "Estudiante no encontrado." });

  const sessions = await Session.findAll({
    where: { studentId: student.id },
    order: [["date", "ASC"]],
  });

  const progress = sessions.map((s) => ({
    date: s.date,
    focusScore: s.focusScore,
    duration: s.durationMinutes,
  }));

  res.json({ student, progress });
});

const createStudent = asyncHandler(async (req, res) => {
  const { name, age, condition, attentionLevel } = req.body;
  if (!name) return res.status(400).json({ error: "El nombre es obligatorio." });

  const validationError = validateStudentFields({ name, age, condition });
  if (validationError) return res.status(400).json({ error: validationError });

  const student = await Student.create({
    name: capitalizeWords(name),
    age,
    condition: capitalizeWords(condition),
    ...(attentionLevel !== undefined && { attentionLevel }),
  });
  res.status(201).json(student);
});

const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByPk(req.params.id);
  if (!student) return res.status(404).json({ error: "Estudiante no encontrado." });

  const validationError = validateStudentFields(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  const updates = { ...req.body };
  if (updates.name !== undefined) updates.name = capitalizeWords(updates.name);
  if (updates.condition !== undefined) updates.condition = capitalizeWords(updates.condition);

  await student.update(updates);
  res.json(student);
});

const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByPk(req.params.id);
  if (!student) return res.status(404).json({ error: "Estudiante no encontrado." });

  await student.destroy();
  res.status(204).send();
});

module.exports = {
  getStudents,
  getStudentById,
  getStudentProgress,
  createStudent,
  updateStudent,
  deleteStudent,
};
