const express = require("express");
const router = express.Router();
const upload = require("../../multer/multer");

const { updateToken } = require("../controllers/tokenController");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");
const { getAllToken } = require("../../controllers/tokenController");

router.get("/", getAllToken);
router.patch(
  "/update/:tokenId",
  adminAuthMiddleware,
  upload.single("tokenImage"),
  updateToken
);

module.exports = router;
