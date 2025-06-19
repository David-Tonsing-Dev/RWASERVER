const express = require("express");
const {
  getRoleCounts,
  getRoleUserLists,
} = require("../controllers/analystController");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");
const router = express.Router();

router.get("/roles/counts", adminAuthMiddleware, getRoleCounts);

router.get("/roles/users", adminAuthMiddleware, getRoleUserLists);

module.exports = router;
