const express = require("express");
const router = express.Router();
const upload = require("../../multer/multer");

const {
  addNews,
  getNews,
  deleteNews,
  updateNews,
} = require("../controllers/newsController");

router.get("/", getNews);
router.post("/add", upload.single("thumbnail"), addNews);
router.delete("/delete/:slug", deleteNews);
router.patch("/update/:slug", upload.single("thumbnail"), updateNews);

module.exports = router;
