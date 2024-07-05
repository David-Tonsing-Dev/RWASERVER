const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  getUsers,
  findUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/verify/:token", verifyEmail);
router.get("/:userId", findUser);
router.get("/", getUsers);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
