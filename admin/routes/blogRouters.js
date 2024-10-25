const express = require("express");
const router = express.Router();

const {
  getBlogs,
  addBlogs,
  updateBlogs,
  deleteBlogs,
} = require("../controllers/blogController");

router.get("/", getBlogs);
router.post("/add", addBlogs);
router.patch("/update/:slug", updateBlogs);
router.delete("/delete/:slug", deleteBlogs);

module.exports = router;
