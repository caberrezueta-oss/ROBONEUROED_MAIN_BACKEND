require("dotenv").config();
const app = require("./app");
const { initModels } = require("./models");

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await initModels();
    app.listen(PORT, () => {
      console.log(`🚀 RoboNeuroED Backend corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ No se pudo iniciar el servidor:", err.message);
    process.exit(1);
  }
}

start();
