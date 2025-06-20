const express = require("express");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");
const {
  getAllGAData,
} = require("../controllers/googleAnalyticsDataController");
const router = express.Router();

router.get("/get/allGAData", adminAuthMiddleware, getAllGAData);

module.exports = router;
