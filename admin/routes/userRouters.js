const express = require("express");
const router = express.Router();

const {
  adminSignIn,
  adminSignUp,
  adminSignUpBySuperAdmin,
  reviewerSignUpBySuperAdmin,
} = require("../controllers/userController");

const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");

router.post("/signin", adminSignIn);
router.post("/signup", adminSignUp);
router.post("/add", adminAuthMiddleware, adminSignUpBySuperAdmin);
router.post("/add/reviewer", adminAuthMiddleware, reviewerSignUpBySuperAdmin);

module.exports = router;
