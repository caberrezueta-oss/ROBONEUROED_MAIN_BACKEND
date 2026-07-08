const express = require("express");
const {
  getQuestions,
  createQuestion,
  deleteQuestion,
  updateQuestion,
  getDesafioConfig,
  updateDesafioConfig,
} = require("../controllers/questions.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", getQuestions);
router.post("/", createQuestion);
router.put("/:id", updateQuestion);
router.delete("/:id", deleteQuestion);
router.get("/desafio/config", getDesafioConfig);
router.put("/desafio/config", updateDesafioConfig);

module.exports = router;
