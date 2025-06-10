const express = require("express");
const router = express.Router();

const { addReview } = require("../controllers/reviewController");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");

// router.get("/", adminAuthMiddleware, addReview);
router.post("/add/:tokenId", adminAuthMiddleware, addReview);
// router.patch(
//   "/update/:id",
//   adminAuthMiddleware,
//   upload.single("thumbnail"),
//   updateBlogs
// );
// router.delete("/delete/:id", adminAuthMiddleware, deleteBlogs);

module.exports = router;
