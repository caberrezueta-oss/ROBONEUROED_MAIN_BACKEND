const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const QuestionAttempt = sequelize.define("QuestionAttempt", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  studentId: { type: DataTypes.INTEGER, allowNull: true },
  studentName: { type: DataTypes.STRING, allowNull: false },
  questionId: { type: DataTypes.INTEGER, allowNull: true }, // referencia al banco, si aplica
  questionText: { type: DataTypes.STRING, allowNull: false },
  options: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false, defaultValue: [] },
  correctAnswer: { type: DataTypes.STRING, allowNull: false },
  studentAnswer: { type: DataTypes.STRING, allowNull: true },
  correct: { type: DataTypes.BOOLEAN, allowNull: true },
  status: {
    type: DataTypes.ENUM("pending", "answered"),
    allowNull: false,
    defaultValue: "pending",
  },
  sentAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  answeredAt: { type: DataTypes.DATE, allowNull: true },
});

module.exports = QuestionAttempt;
