const express = require("express");
const router = express.Router();

const {
  addReview,
  deleteReview,
  getReview,
} = require("../controllers/reviewController");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");

router.get("/", adminAuthMiddleware, getReview);
router.post("/add/:tokenId", adminAuthMiddleware, addReview);
router.delete("/delete/:tokenId", adminAuthMiddleware, deleteReview);

module.exports = router;
