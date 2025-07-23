const express = require("express");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");
const {
  getAllGAData,
  getMobileAppAllGAData,
} = require("../controllers/googleAnalyticsDataController");
const router = express.Router();

router.get("/get/allGAData", adminAuthMiddleware, getAllGAData);
router.get("/get/mobileAppGAData", getMobileAppAllGAData);

module.exports = router;
