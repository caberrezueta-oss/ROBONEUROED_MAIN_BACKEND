const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const asyncHandler = require("../utils/asyncHandler");

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Correo y contraseña son obligatorios." });
  }

  const user = await User.findOne({ where: { email } });

  // Mensaje genérico a propósito: no revela si fue el correo o la
  // contraseña lo que falló, para no dar pistas a un atacante.
  const genericError = { error: "Correo o contraseña incorrectos." };

  if (!user) {
    return res.status(401).json(genericError);
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json(genericError);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ["id", "name", "email", "role"],
  });
  res.json(user);
});

// Solo admin: lista de usuarios para poder gestionarlos (resetear contraseña)
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({ attributes: ["id", "name", "email", "role"] });
  res.json(users);
});

// Solo admin: resetea la contraseña de cualquier usuario sin necesitar email.
const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres." });
  }

  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await user.update({ passwordHash });

  res.json({ ok: true, message: `Contraseña actualizada para ${user.email}.` });
});

module.exports = { login, me, getUsers, resetPassword };
