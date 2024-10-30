const express = require("express");
const router = express.Router();
const upload = require("../../multer/multer");

const {
  getBlogs,
  addBlogs,
  updateBlogs,
  deleteBlogs,
} = require("../controllers/blogController");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");

router.get("/", adminAuthMiddleware, getBlogs);
router.post("/add", adminAuthMiddleware, upload.single("thumbnail"), addBlogs);
router.patch(
  "/update/:id",
  adminAuthMiddleware,
  upload.single("thumbnail"),
  updateBlogs
);
router.delete("/delete/:id", adminAuthMiddleware, deleteBlogs);

module.exports = router;
