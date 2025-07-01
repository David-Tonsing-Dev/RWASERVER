const express = require("express");
const router = express.Router();

const {
  addForumCategory,
  getForumCategory,
} = require("../controllers/forumCategoryController");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");

router.post("/create", adminAuthMiddleware, addForumCategory);
router.get("/", adminAuthMiddleware, getForumCategory);

module.exports = router;
