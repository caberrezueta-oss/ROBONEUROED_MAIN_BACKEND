const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Student = sequelize.define("Student", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  age: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  condition: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  attentionLevel: {
    // 0-100, lo decide el profesor manualmente con una barra deslizante
    // (no se puede medir estado emocional automaticamente, asi que es
    // una evaluacion subjetiva del profesor, no un dato del sensor).
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50,
  },
  lastConnection: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  globalScore: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  streak: {
    // Sesiones consecutivas con buen foco atencional (refuerzo positivo)
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  bestStreak: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
});

module.exports = Student;
