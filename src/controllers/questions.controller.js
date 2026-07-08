const { Question, DesafioConfig } = require("../models");
const asyncHandler = require("../utils/asyncHandler");

const getQuestions = asyncHandler(async (req, res) => {
  const questions = await Question.findAll({ order: [["createdAt", "ASC"]] });
  res.json(questions);
});

const createQuestion = asyncHandler(async (req, res) => {
  const { text, answer, level, options } = req.body;
  if (!text || !answer) {
    return res.status(400).json({ error: "text y answer son obligatorios." });
  }
  const cleanOptions = Array.isArray(options) ? options.filter((o) => o && o.trim()) : [];
  if (cleanOptions.length < 2) {
    return res.status(400).json({ error: "Se necesitan al menos 2 opciones de respuesta." });
  }
  if (!cleanOptions.includes(answer)) {
    return res.status(400).json({ error: "La respuesta correcta debe ser una de las opciones." });
  }

  const question = await Question.create({
    text,
    answer,
    options: cleanOptions,
    level: level || "Fácil",
    isDesafio: !!req.body.isDesafio,
  });

  res.status(201).json(question);
});

const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findByPk(req.params.id);
  if (!question) return res.status(404).json({ error: "Pregunta no encontrada." });

  await question.destroy();
  res.status(204).send();
});

const updateQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findByPk(req.params.id);
  if (!question) return res.status(404).json({ error: "Pregunta no encontrada." });

  const { text, answer, level, options } = req.body;
  const updates = {
    ...(text !== undefined && { text }),
    ...(level !== undefined && { level }),
  };

  if (options !== undefined) {
    const cleanOptions = Array.isArray(options) ? options.filter((o) => o && o.trim()) : [];
    if (cleanOptions.length < 2) {
      return res.status(400).json({ error: "Se necesitan al menos 2 opciones de respuesta." });
    }
    updates.options = cleanOptions;
  }

  if (answer !== undefined) {
    const finalOptions = updates.options || question.options;
    if (!finalOptions.includes(answer)) {
      return res.status(400).json({ error: "La respuesta correcta debe ser una de las opciones." });
    }
    updates.answer = answer;
  }

  await question.update(updates);
  res.json(question);
});

// Resuelve la pregunta activa de Modo Desafío según el modo configurado.
async function resolveActiveDesafio() {
  const config = await DesafioConfig.findOne();
  if (!config) return null;

  if (config.sourceMode === "custom") {
    return { text: config.customText, answer: config.customAnswer, source: "custom" };
  }

  if (config.questionId) {
    const question = await Question.findByPk(config.questionId);
    if (question) {
      return { text: question.text, answer: question.answer, source: "banco", questionId: question.id };
    }
  }

  return null;
}

// Usado por Students.jsx (la pantalla del profesor) para saber qué hay configurado ahora.
const getDesafioConfig = asyncHandler(async (req, res) => {
  const config = await DesafioConfig.findOne();
  const active = await resolveActiveDesafio();
  res.json({ config, active });
});

// Usado por Students.jsx cuando el profesor elige/edita la pregunta de desafío.
const updateDesafioConfig = asyncHandler(async (req, res) => {
  const { sourceMode, questionId, customText, customAnswer } = req.body;

  let config = await DesafioConfig.findOne();
  if (!config) config = await DesafioConfig.create({});

  await config.update({
    ...(sourceMode && { sourceMode }),
    ...(questionId !== undefined && { questionId }),
    ...(customText !== undefined && { customText }),
    ...(customAnswer !== undefined && { customAnswer }),
  });

  const active = await resolveActiveDesafio();
  res.json({ config, active });
});

module.exports = {
  getQuestions,
  createQuestion,
  deleteQuestion,
  updateQuestion,
  getDesafioConfig,
  updateDesafioConfig,
  resolveActiveDesafio,
};
