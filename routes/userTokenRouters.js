const express = require("express");
const router = express.Router();

const upload = require("../multer/multer");
const { nonAuthMiddleware } = require("../middlewares/authMiddleware");
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  addNewToken,
  getPortfolioToken,
  checkPortfolio,
  addTokenPortfolio,
} = require("../controllers/userTokenController");

router.post(
  "/add/new",
  upload.single("tokenImage"),
  authMiddleware,
  addNewToken
);
router.get("/portfolio", authMiddleware, getPortfolioToken);
router.post("/portfolio/:id", authMiddleware, checkPortfolio);
router.get("/add/portfolio/:id", authMiddleware, addTokenPortfolio);

module.exports = router;
