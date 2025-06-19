const express = require("express");
const {
  getRoleCounts,
  getAdminLists,
  getUsersLists,
  getReviewerLists,
} = require("../controllers/analystController");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");
const router = express.Router();

router.get("/roles/counts", adminAuthMiddleware, getRoleCounts);

router.get("/roles/admin", adminAuthMiddleware, getAdminLists);
router.get("/roles/reviewer", adminAuthMiddleware, getReviewerLists);
router.get("/roles/user", adminAuthMiddleware, getUsersLists);

module.exports = router;
