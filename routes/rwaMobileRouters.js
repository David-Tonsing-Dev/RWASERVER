const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");

const {
  getAllToken,
  getCategories,
  getCoinDetail,
  getHighLightData,
  getCoinGraphData,
  coinTrending,
  getTopGainer,
  getFavoriteCoin,
} = require("../controllers/mobileTokenController");

router.get("/", getAllToken);
router.get("/topGainer", getTopGainer);
router.get("/watchlist", authMiddleware, getFavoriteCoin);
router.get("/rwa/categories", getCategories);
router.get("/rwa/coin/:coinId", getCoinDetail);
router.get("/rwa/highlight", getHighLightData);
router.get("/rwa/graph/coinOHLC/:coinId", getCoinGraphData);
router.get("/rwa/trending", coinTrending);

module.exports = router;
