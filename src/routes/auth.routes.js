const express = require("express");
const { login, me, getUsers, resetPassword } = require("../controllers/auth.controller");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.post("/login", login);
router.get("/me", requireAuth, me);
router.get("/users", requireAuth, requireAdmin, getUsers);
router.put("/users/:id/reset-password", requireAuth, requireAdmin, resetPassword);

module.exports = router;
