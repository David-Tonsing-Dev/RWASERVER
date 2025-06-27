const express = require("express");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");
const {
  assignTokenToCategories,

  removeCategoryFromToken,
  getAllTokensWithCategories,
} = require("../controllers/categoryController");
const router = express.Router();

router.post("/create", adminAuthMiddleware, assignTokenToCategories);
router.get("/get/token", getAllTokensWithCategories);
router.delete(
  "/token/:tokenId/category/:categoryId",
  adminAuthMiddleware,
  removeCategoryFromToken
);

module.exports = router;
