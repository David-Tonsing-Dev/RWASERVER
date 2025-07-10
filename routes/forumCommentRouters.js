const express = require("express");
const router = express.Router();

const {
  addComment,
  editComment,
  deleteComment,
  reactToComment,
  getCommentsByForumId,
  reactToCommentDislike,
} = require("../controllers/forumCommentController");
const {
  authMiddleware,
  nonAuthMiddleware,
} = require("../middlewares/authMiddleware");

router.post("/add", authMiddleware, addComment);
router.put("/:id", authMiddleware, editComment);
router.delete("/:id", authMiddleware, deleteComment);
router.post("/react", authMiddleware, reactToComment);
router.post("/react/dislike", authMiddleware, reactToCommentDislike);
router.get("/forum/:forumId", nonAuthMiddleware, getCommentsByForumId);

module.exports = router;
