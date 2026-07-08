const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Question = sequelize.define("Question", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  options: {
    // Lista de opciones de respuesta (2 a 4). La respuesta correcta se
    // guarda en "answer" y debe coincidir con uno de estos textos.
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: [],
  },
  answer: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  level: {
    type: DataTypes.ENUM("Fácil", "Medio", "Difícil"),
    allowNull: false,
    defaultValue: "Fácil",
  },
  isDesafio: {
    // Marca si esta pregunta fue creada específicamente como override de Modo Desafío
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = Question;
