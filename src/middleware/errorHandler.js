function errorHandler(err, req, res, next) {
  console.error(err);

  // Errores de validación de Sequelize
  if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({
      error: "Error de validación",
      details: err.errors.map((e) => e.message),
    });
  }

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Error interno del servidor",
  });
}

module.exports = errorHandler;
