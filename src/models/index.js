const sequelize = require("../config/db");
const bcrypt = require("bcryptjs");

const User = require("./User");
const Student = require("./Student");
const Session = require("./Session");
const Question = require("./Question");
const SystemConfig = require("./SystemConfig");
const RobotHeartbeat = require("./RobotHeartbeat");
const DesafioConfig = require("./DesafioConfig");
const LiveSession = require("./LiveSession");
const ScheduledSession = require("./ScheduledSession");
const QuestionAttempt = require("./QuestionAttempt");

// Relaciones
Student.hasMany(Session, { foreignKey: "studentId" });
Session.belongsTo(Student, { foreignKey: "studentId" });

async function initModels() {
  await sequelize.authenticate();
  console.log("✅ Conexión a PostgreSQL establecida.");

  // En producción real usarías migraciones (sequelize-cli).
  // Para desarrollo, sync() crea las tablas si no existen.
  await sequelize.sync();
  console.log("✅ Modelos sincronizados con la base de datos.");

  // Crea el usuario administrador por defecto si no existe
  const adminEmail = process.env.ADMIN_EMAIL || "admin@neuroed.com";
  const existingAdmin = await User.findOne({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "123456", 10);
    await User.create({
      name: "Operador Root",
      email: adminEmail,
      passwordHash,
      role: "admin",
    });
    console.log(`✅ Usuario admin creado: ${adminEmail}`);
  }

  // Crea el usuario docente por defecto si no existe
  const docenteEmail = process.env.DOCENTE_EMAIL;
  if (docenteEmail) {
    const existingDocente = await User.findOne({ where: { email: docenteEmail } });
    if (!existingDocente) {
      const passwordHash = await bcrypt.hash(process.env.DOCENTE_PASSWORD || "123456", 10);
      await User.create({
        name: "Docente",
        email: docenteEmail,
        passwordHash,
        role: "docente",
      });
      console.log(`✅ Usuario docente creado: ${docenteEmail}`);
    }
  }

  // Crea la fila única de configuración si no existe
  const configCount = await SystemConfig.count();
  if (configCount === 0) {
    await SystemConfig.create({});
    console.log("✅ Configuración por defecto creada.");
  }

  // Semilla del banco de preguntas si está vacío
  const questionCount = await Question.count();
  if (questionCount === 0) {
    await Question.bulkCreate([
      { text: "¿Cuánto es 4 + 4?", answer: "8", options: ["6", "7", "8", "9"], level: "Fácil" },
      { text: "¿Cuánto es 7 - 2?", answer: "5", options: ["4", "5", "6"], level: "Fácil" },
      { text: "¿Cuántos lados tiene un triángulo?", answer: "3", options: ["3", "4", "5"], level: "Medio" },
    ]);
    console.log("✅ Banco de preguntas inicial creado.");
  }

  // Crea la fila única de heartbeat si no existe (arranca sin señal = Desconectado)
  const heartbeatCount = await RobotHeartbeat.count();
  if (heartbeatCount === 0) {
    await RobotHeartbeat.create({});
    console.log("✅ Registro de heartbeat del robot inicializado.");
  }

  // Crea la fila única de configuración de Modo Desafío si no existe
  const desafioConfigCount = await DesafioConfig.count();
  if (desafioConfigCount === 0) {
    const firstQuestion = await Question.findOne({ order: [["id", "ASC"]] });
    await DesafioConfig.create({
      sourceMode: "banco",
      questionId: firstQuestion ? firstQuestion.id : null,
    });
    console.log("✅ Configuración de Modo Desafío inicializada.");
  }

  // Crea la fila única de sesión en vivo si no existe (arranca en "idle")
  const liveSessionCount = await LiveSession.count();
  if (liveSessionCount === 0) {
    await LiveSession.create({});
    console.log("✅ Estado de sesión en vivo inicializado.");
  }
}

module.exports = {
  sequelize,
  User,
  Student,
  Session,
  Question,
  SystemConfig,
  RobotHeartbeat,
  DesafioConfig,
  LiveSession,
  ScheduledSession,
  QuestionAttempt,
  initModels,
};
