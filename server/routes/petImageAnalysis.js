const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const petImageAnalysisController = require("../controllers/petImageAnalysis");

router.post(
  "/",
  auth,
  petImageAnalysisController.uploadAnalyzeImage,
  petImageAnalysisController.analyzePetImage
);
router.post("/punctuate", auth, petImageAnalysisController.punctuateText);

module.exports = router;
