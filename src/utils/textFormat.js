// Capitaliza cada palabra de un texto: "matias" -> "Matias", "impulso" -> "Impulso"
// Se usa para que nombres y condiciones queden bien formateados en la base de
// datos desde el origen (no solo visualmente con CSS), para que reportes reales
// como el PDF salgan correctos sin depender de trucos de estilo.
function capitalizeWords(text) {
  if (!text || typeof text !== "string") return text;
  return text
    .trim()
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

module.exports = { capitalizeWords };
