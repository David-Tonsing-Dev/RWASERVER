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
  getNewsDetail,
  getBlogDetail,
  getTopGainer,
  getCategoryTokens,
} = require("../controllers/tokenController");
const { getFeaturedNews } = require("../admin/controllers/newsController");
const { nonAuthMiddleware } = require("../middlewares/authMiddleware");

router.get("/", nonAuthMiddleware, getAllToken);
router.get("/rwa/category/:categoryId", getCategoryTokens);
router.get("/rwa/categories", getCategories);
router.get("/rwa/coin/:coinId", getCoinDetail);
router.get("/rwa/highlight", getHighLightData);
router.get("/rwa/graph/coinOHLC/:coinId", getCoinGraphData);
router.get("/rwa/trend", getTrends);
router.get("/rwa/blog", getBlog);
router.get("/rwa/blog/:slug", nonAuthMiddleware, getBlogDetail);
router.get("/rwa/news", getNews);
router.get("/rwa/news/featured", getFeaturedNews);
router.get("/rwa/news/:slug", nonAuthMiddleware, getNewsDetail);
router.get("/rwa/topGainer", getTopGainer);

module.exports = router;
