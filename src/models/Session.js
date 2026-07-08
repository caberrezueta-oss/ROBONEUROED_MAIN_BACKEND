const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Session = sequelize.define("Session", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    // Ej: NEURO-101 (visible al docente en la bitácora)
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  studentName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  focusScore: {
    // Porcentaje de foco atencional promedio de la sesión
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  alphaWave: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  betaWave: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  belowThreshold: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = Session;
