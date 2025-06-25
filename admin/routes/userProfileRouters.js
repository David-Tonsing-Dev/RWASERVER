const express = require("express");
const router = express.Router();
const upload = require("../../multer/multer");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");
const {
  userProfile,
  getUserProfile,
  getMobileUserProfile,
} = require("../controllers/userProfileController");

router.put(
  "/create",
  adminAuthMiddleware,
  upload.single("profileImg"),
  userProfile
);

router.get("/", adminAuthMiddleware, getUserProfile);
router.get("/:id", getMobileUserProfile);

module.exports = router;
