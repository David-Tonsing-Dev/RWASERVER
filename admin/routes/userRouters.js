const express = require("express");
const router = express.Router();

const {
  adminSignIn,
  adminSignUp,
  adminSignUpBySuperAdmin,
} = require("../controllers/userController");

const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");

router.post("/signin", adminSignIn);
router.post("/signup", adminSignUp);
router.post("/add", adminAuthMiddleware, adminSignUpBySuperAdmin);

module.exports = router;
