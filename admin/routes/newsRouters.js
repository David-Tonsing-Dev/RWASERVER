const express = require("express");
const router = express.Router();

const {
  addNews,
  getNews,
  deleteNews,
  updateNews,
} = require("../controllers/newsController");

router.get("/", getNews);
router.post("/add", addNews);
router.delete("/delete/:slug", deleteNews);
router.patch("/update/:slug", updateNews);

module.exports = router;
