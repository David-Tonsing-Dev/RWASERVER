const express = require("express");
const router = express.Router();
const upload = require("../../multer/multer");

const {
  addNews,
  getNews,
  deleteNews,
  updateNews,
} = require("../controllers/newsController");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");

router.get("/", adminAuthMiddleware, getNews);
router.post("/add", adminAuthMiddleware, upload.single("thumbnail"), addNews);
router.delete("/delete/:id", adminAuthMiddleware, deleteNews);
router.patch(
  "/update/:id",
  adminAuthMiddleware,
  upload.single("thumbnail"),
  updateNews
);

module.exports = router;
