const express = require("express");
const { getConfig, updateConfig } = require("../controllers/config.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", getConfig);
router.put("/", updateConfig);

module.exports = router;
