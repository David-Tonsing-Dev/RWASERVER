const express = require("express");
const router = express.Router();
const upload = require("../../multer/multer");

const {
  updateToken,
  tokenEnableToggle,
  getAllTokenAdmin,
} = require("../controllers/tokenController");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");

router.get("/", getAllTokenAdmin);
router.patch(
  "/update/:tokenId",
  adminAuthMiddleware,
  upload.single("tokenImage"),
  updateToken
);

router.patch("/toggle/:tokenId", adminAuthMiddleware, tokenEnableToggle);

module.exports = router;
