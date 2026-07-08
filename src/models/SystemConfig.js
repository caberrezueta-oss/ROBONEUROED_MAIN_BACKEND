const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Tabla de una sola fila: guarda los parámetros globales del sistema.
const SystemConfig = sequelize.define("SystemConfig", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  dbHost: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "postgresql://localhost:5432/roboneuro_db",
  },
  samplingRate: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "250Hz",
  },
  minAttentionThreshold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60,
  },
  hardwarePort: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "COM3",
  },
});

module.exports = SystemConfig;
