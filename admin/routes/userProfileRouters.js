const express = require("express");
const router = express.Router();
const upload = require("../../multer/multer");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");
const userProfile = require("../controllers/userProfileController");

router.put(
  "/create",
  adminAuthMiddleware,
  upload.single("profileImg"),
  userProfile
);

module.exports = router;
