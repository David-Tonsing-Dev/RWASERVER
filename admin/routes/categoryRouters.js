const express = require("express");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");
const {
  assignTokensToNewCategory,
  assignCategoriesToToken,
  getAllCategories,
} = require("../controllers/categoryController");
const router = express.Router();

router.post("/assign-tokens", adminAuthMiddleware, assignTokensToNewCategory);
router.post(
  "/token/assign-categories",
  adminAuthMiddleware,
  assignCategoriesToToken
);
router.get("/", getAllCategories);

module.exports = router;
