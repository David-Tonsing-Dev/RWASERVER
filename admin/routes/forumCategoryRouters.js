const express = require("express");
const router = express.Router();

const {
  addForumCategory,
  getForumCategory,
  updateForumCategory,
  deleteForumCategory,
} = require("../controllers/forumCategoryController");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");
const upload = require("../../multer/multer");

router.post(
  "/create",
  upload.single("categoryImage"),
  adminAuthMiddleware,
  addForumCategory
);
router.get("/", getForumCategory);
router.put(
  "/:categoryId",
  upload.single("categoryImage"),
  adminAuthMiddleware,
  updateForumCategory
);
router.delete("/:categoryId", deleteForumCategory);

module.exports = router;
