const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ScheduledSession = sequelize.define("ScheduledSession", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  studentName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  scheduledAt: {
    // Fecha y hora completa de la sesión programada
    type: DataTypes.DATE,
    allowNull: false,
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("pendiente", "completada", "cancelada"),
    allowNull: false,
    defaultValue: "pendiente",
  },
});

module.exports = ScheduledSession;
