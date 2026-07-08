const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Fila única: representa lo que está ocurriendo en tiempo real con el robot.
// El ESP32 la actualiza mientras dura una sesión; el frontend la consulta
// (polling) para mostrar telemetría en vivo en "Control del Robot".
const LiveSession = sequelize.define("LiveSession", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: DataTypes.ENUM("idle", "running", "paused"),
    allowNull: false,
    defaultValue: "idle",
  },
  studentName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  currentFocus: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  currentAlpha: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  currentBeta: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  belowThreshold: {
    // true si currentFocus cayó debajo del umbral configurado en Configuración
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  pauseRequested: {
    // El profesor puede pedir pausa desde la web; el ESP32 lo consulta
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = LiveSession;
