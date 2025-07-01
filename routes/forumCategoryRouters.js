const express = require("express");
const router = express.Router();

const {
  getForumCategory,
} = require("../admin/controllers/forumCategoryController");

router.get("/", getForumCategory);

module.exports = router;
