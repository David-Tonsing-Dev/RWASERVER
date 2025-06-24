const express = require("express");
const router = express.Router();

const {
  getDisclamerTerm,
  getPrivacyTerm,
  getServiceTerm,
} = require("../controllers/termController");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");

router.get("/disclaimer", getDisclamerTerm);
router.get("/privacy", getPrivacyTerm);
router.get("/service", getServiceTerm);

module.exports = router;
