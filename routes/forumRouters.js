const express = require("express");
const router = express.Router();
const {
  createForum,
  getAllForums,
  getForumById,
  updateForum,
  deleteForum,
  getForumByUser,
  reactToForum,
  reactToForumDislike,
} = require("../controllers/forumController");
const {
  nonAuthMiddleware,
  authMiddleware,
} = require("../middlewares/authMiddleware");

router.get("/", nonAuthMiddleware, getAllForums);
router.post("/create", authMiddleware, createForum);
router.get("/:id", nonAuthMiddleware, getForumById);
router.put("/:id", nonAuthMiddleware, updateForum);
router.delete("/:id", authMiddleware, deleteForum);
router.get("/user/:userId", nonAuthMiddleware, getForumByUser);
router.post("/react", authMiddleware, reactToForum);
router.post("/react/dislike", authMiddleware, reactToForumDislike);

module.exports = router;
