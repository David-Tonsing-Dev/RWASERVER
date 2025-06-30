const express = require("express");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");
const {
  assignTokensToNewCategory,
  assignCategoriesToToken,
  getAllCategories,
  categoryUpdate,
  deleteCategoryAndUnlinkTokens,
  deleteCategoryFromSpecificToken,
  assignMultipleCategories,
} = require("../controllers/categoryController");
const router = express.Router();

router.post("/assign-tokens", adminAuthMiddleware, assignTokensToNewCategory);
router.post(
  "/token/assign-categories",
  adminAuthMiddleware,
  assignCategoriesToToken
);

router.post("/assign-to-tokens", adminAuthMiddleware, assignMultipleCategories);

router.get("/", getAllCategories);

router.put("/update/:id", adminAuthMiddleware, categoryUpdate);
router.delete(
  "/delete/:id",
  adminAuthMiddleware,
  deleteCategoryAndUnlinkTokens
);
router.delete(
  "/:categoryId/token/:tokenId",
  adminAuthMiddleware,
  deleteCategoryFromSpecificToken
);

module.exports = router;
