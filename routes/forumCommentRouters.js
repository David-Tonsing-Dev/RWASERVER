const express = require("express");
const router = express.Router();

const {
  addComment,
  editComment,
  deleteComment,
  reactToComment,
  getCommentsByForumId,
} = require("../controllers/forumCommentController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/add", authMiddleware, addComment);
router.put("/:id", authMiddleware, editComment);
router.delete("/:id", authMiddleware, deleteComment);
router.post("/react", authMiddleware, reactToComment);
router.get("/forum/:forumId", getCommentsByForumId);

module.exports = router;
