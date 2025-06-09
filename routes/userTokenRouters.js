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
  removeTokenPortfolio,
  mobileAddTokenPortfolio,
  addRating,
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
router.get(
  "/mobile/add/portfolio/:id",
  authMiddleware,
  mobileAddTokenPortfolio
);
router.delete("/remove/portfolio/:id", authMiddleware, removeTokenPortfolio);
router.post("/add/rating/:id", authMiddleware, addRating);

module.exports = router;
