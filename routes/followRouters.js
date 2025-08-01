const express = require("express");
const {
  getAllFollower,
  getAllFollowing,
  followUser,
  unFollowUser,
} = require("../controllers/followController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/allFollower", authMiddleware, getAllFollower);
router.get("/allFollowing", authMiddleware, getAllFollowing);
router.post("/:followId", authMiddleware, followUser);
router.delete("/:followId", authMiddleware, unFollowUser);

module.exports = router;
