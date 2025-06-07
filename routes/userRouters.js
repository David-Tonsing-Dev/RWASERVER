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
  addUserFavCoin,
  deleteUserFavCoin,
} = require("../controllers/userController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/verify/:token", verifyEmail);
router.get("/:userId", findUser);
router.get("/", getUsers);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/fav/coin/:coinId", authMiddleware, addUserFavCoin);
router.delete("/fav/coin/:coinId", authMiddleware, deleteUserFavCoin);

module.exports = router;
