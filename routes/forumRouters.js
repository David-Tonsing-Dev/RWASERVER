const express = require("express");
const router = express.Router();
const {
  createForum,
  createForumForMobile,
  getAllForums,
  getHotTopic,
  getForumById,
  updateForum,
  updateForumForMobile,
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
router.get("/hot-topics", getHotTopic);
router.post("/create", authMiddleware, createForum);
router.post("/mobile/create", authMiddleware, createForumForMobile);
router.get("/:id", nonAuthMiddleware, getForumById);
router.put("/:id", nonAuthMiddleware, updateForum);
router.put("/mobile/:id", nonAuthMiddleware, updateForumForMobile);
router.delete("/:id", authMiddleware, deleteForum);
router.get("/user/:userId", nonAuthMiddleware, getForumByUser);
router.post("/react", authMiddleware, reactToForum);
router.post("/react/dislike", authMiddleware, reactToForumDislike);

module.exports = router;
