const express = require("express");
const router = express.Router();
const passport = require("passport");
const upload = require("../multer/multer");
const {
  signup,
  signin,
  getUsers,
  findUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updateUser,
  getUserDetailById,
  addUserFavCoin,
  deleteUserFavCoin,
  googleSignIn,
  googleData,
  fcmToken,
  getUserBadges,
} = require("../controllers/userController");
const {
  authMiddleware,
  nonAuthMiddleware,
} = require("../middlewares/authMiddleware");

router.post("/signup", signup);
router.post("/signin", signin);
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleSignIn
);
router.post("/auth/google", googleData);
router.get("/verify/:token", verifyEmail);
router.get("/:userId", findUser);
router.get("/", getUsers);
router.put(
  "/update",
  authMiddleware,
  upload.fields([
    { name: "profileImg", maxCount: 1 },
    { name: "bannerImg", maxCount: 1 },
  ]),
  updateUser
);
router.get("/detail/:userId", getUserDetailById);
router.get("/badges/:userId", getUserBadges);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/fav/coin/:coinId", authMiddleware, addUserFavCoin);
router.delete("/fav/coin/:coinId", authMiddleware, deleteUserFavCoin);
router.post("/fcmtoken", nonAuthMiddleware, fcmToken);

module.exports = router;
