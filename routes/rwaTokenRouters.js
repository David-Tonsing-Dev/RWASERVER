const express = require("express");
const router = express.Router();

const {
  getAllToken,
  getCategories,
  getCoinDetail,
  getHighLightData,
  getCoinGraphData,
  getTrends,
  getBlog,
  getNews,
  getNewsDetails,
} = require("../controllers/tokenController");
const { nonAuthMiddleware } = require("../middlewares/authMiddleware");

router.get("/", nonAuthMiddleware, getAllToken);
router.get("/rwa/categories", getCategories);
router.get("/rwa/coin/:coinId", getCoinDetail);
router.get("/rwa/highlight", getHighLightData);
router.get("/rwa/graph/coinOHLC/:coinId", getCoinGraphData);
router.get("/rwa/trend", getTrends);
router.get("/rwa/blog", getBlog);
router.get("/rwa/news", getNews);
router.get("/rwa/news/:id", getNewsDetails);

module.exports = router;
