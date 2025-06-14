const express = require("express");
const router = express.Router();

const {
  addReview,
  deleteReview,
  getReview,
  updateReview,
} = require("../controllers/reviewController");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");

router.get("/", adminAuthMiddleware, getReview);
router.post("/add/:tokenId", adminAuthMiddleware, addReview);
router.put("/update/:tokenId", adminAuthMiddleware, updateReview);
router.delete("/delete/:tokenId", adminAuthMiddleware, deleteReview);

module.exports = router;
