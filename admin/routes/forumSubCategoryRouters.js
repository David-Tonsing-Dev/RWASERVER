const express = require("express");
const router = express.Router();

const {
  addForumSubCategory,
  getForumSubCategory,
  updateForumSubCategory,
  deleteForumSubCategory,
} = require("../controllers/forumSubCategoryController");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");
const upload = require("../../multer/multer");

router.post(
  "/create",
  upload.single("subCategoryImage"),
  adminAuthMiddleware,
  addForumSubCategory
);
router.get("/", getForumSubCategory);
router.put(
  "/:subCategoryId",
  upload.single("subCategoryImage"),
  adminAuthMiddleware,
  updateForumSubCategory
);
router.delete("/:subCategoryId", adminAuthMiddleware, deleteForumSubCategory);

module.exports = router;
