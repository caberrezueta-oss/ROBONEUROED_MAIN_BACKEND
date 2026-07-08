const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Tabla de una sola fila: guarda la última vez que el ESP32 avisó que está vivo.
const RobotHeartbeat = sequelize.define("RobotHeartbeat", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  lastHeartbeatAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deviceInfo: {
    // Cualquier dato extra que el ESP32 quiera mandar (IP local, versión de firmware, etc.)
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = RobotHeartbeat;
