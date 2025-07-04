const express = require("express");
const router = express.Router();

const {
  addForumCategory,
  getForumCategory,
  updateForumCategory,
} = require("../controllers/forumCategoryController");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");

router.post("/create", adminAuthMiddleware, addForumCategory);
router.get("/", getForumCategory);
router.put("/:categoryId", adminAuthMiddleware, updateForumCategory);

module.exports = router;
