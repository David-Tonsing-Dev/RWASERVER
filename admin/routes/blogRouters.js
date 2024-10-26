const express = require("express");
const router = express.Router();
const upload = require("../../multer/multer");

const {
  getBlogs,
  addBlogs,
  updateBlogs,
  deleteBlogs,
} = require("../controllers/blogController");

router.get("/", getBlogs);
router.post("/add", upload.single("thumbnail"), addBlogs);
router.patch("/update/:slug", upload.single("thumbnail"), updateBlogs);
router.delete("/delete/:slug", deleteBlogs);

module.exports = router;
