const express = require("express");
const router = express.Router();

const {
  adminSignIn,
  adminSignUp,
  adminSignUpBySuperAdmin,
  reviewerSignUpBySuperAdmin,
  adminForgotPassword,
  adminResetPassword,
} = require("../controllers/userController");

const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");

router.post("/signin", adminSignIn);
router.post("/signup", adminSignUp);
router.post("/add", adminAuthMiddleware, adminSignUpBySuperAdmin);
router.post("/add/reviewer", adminAuthMiddleware, reviewerSignUpBySuperAdmin);
router.post("/forgot-password", adminForgotPassword);
router.post("/reset-password/:token", adminResetPassword);

module.exports = router;
