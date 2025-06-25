const express = require("express");
const router = express.Router();
const upload = require("../../multer/multer");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");
const {
  userProfile,
  getUserProfile,
} = require("../controllers/userProfileController");

router.put(
  "/create",
  adminAuthMiddleware,
  upload.single("profileImg"),
  userProfile
);

router.get("/", adminAuthMiddleware, getUserProfile);

module.exports = router;
