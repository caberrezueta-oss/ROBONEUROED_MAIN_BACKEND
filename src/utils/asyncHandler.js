// Envuelve un controlador async y pasa cualquier error a errorHandler
// en vez de tener que escribir try/catch en cada función.
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
