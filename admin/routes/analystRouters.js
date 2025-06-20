const express = require("express");
const {
  getRoleCounts,
  getAdminLists,
  getUsersLists,
  getReviewerLists,
} = require("../controllers/analystController");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");
const router = express.Router();

router.get("/get/userCount", adminAuthMiddleware, getRoleCounts);

router.get("/get/allAdmin", adminAuthMiddleware, getAdminLists);
router.get("/get/allReviewer", adminAuthMiddleware, getReviewerLists);
router.get("/get/allUser", adminAuthMiddleware, getUsersLists);

module.exports = router;
