const express = require("express");
const router = express.Router();

const {
  addForumCategory,
  getForumCategory,
  updateForumCategory,
  deleteForumCategory,
  updateCategoryPriority,
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

router.put("/reorder", adminAuthMiddleware, updateCategoryPriority);

router.put(
  "/:categoryId",
  upload.single("categoryImage"),
  adminAuthMiddleware,
  updateForumCategory
);
router.delete("/:categoryId", adminAuthMiddleware, deleteForumCategory);

module.exports = router;
