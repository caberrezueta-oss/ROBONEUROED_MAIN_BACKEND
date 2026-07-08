const { SystemConfig } = require("../models");
const asyncHandler = require("../utils/asyncHandler");

// Al ser una fila única, siempre trabajamos con la primera (id=1)
const getConfig = asyncHandler(async (req, res) => {
  const config = await SystemConfig.findOne();
  res.json(config);
});

const updateConfig = asyncHandler(async (req, res) => {
  const config = await SystemConfig.findOne();
  if (!config) return res.status(404).json({ error: "Configuración no encontrada." });

  const { dbHost, samplingRate, minAttentionThreshold, hardwarePort } = req.body;

  await config.update({
    ...(dbHost !== undefined && { dbHost }),
    ...(samplingRate !== undefined && { samplingRate }),
    ...(minAttentionThreshold !== undefined && { minAttentionThreshold }),
    ...(hardwarePort !== undefined && { hardwarePort }),
  });

  res.json(config);
});

module.exports = { getConfig, updateConfig };
