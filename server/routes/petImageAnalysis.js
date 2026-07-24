const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const petImageAnalysisController = require("../controllers/petImageAnalysis");

router.post("/", auth, petImageAnalysisController.analyzePetImage);

module.exports = router;
