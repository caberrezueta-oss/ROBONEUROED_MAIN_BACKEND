require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const studentsRoutes = require("./routes/students.routes");
const sessionsRoutes = require("./routes/sessions.routes");
const questionsRoutes = require("./routes/questions.routes");
const configRoutes = require("./routes/config.routes");
const robotRoutes = require("./routes/robot.routes");
const scheduledSessionsRoutes = require("./routes/scheduledSessions.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));

// Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "RoboNeuroED Backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/config", configRoutes);
app.use("/api/robot", robotRoutes);
app.use("/api/scheduled-sessions", scheduledSessionsRoutes);

// 404 para rutas no definidas
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada." });
});

app.use(errorHandler);

module.exports = app;
