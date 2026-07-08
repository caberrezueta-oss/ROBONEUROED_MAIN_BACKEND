const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Guarda qué pregunta debe mostrar el ESP32 cuando el estudiante falla.
// sourceMode = "banco" -> usa questionId (una pregunta ya guardada)
// sourceMode = "custom" -> usa customText/customAnswer (escrita al vuelo)
const DesafioConfig = sequelize.define("DesafioConfig", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sourceMode: {
    type: DataTypes.ENUM("banco", "custom"),
    allowNull: false,
    defaultValue: "banco",
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  customText: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  customAnswer: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = DesafioConfig;
