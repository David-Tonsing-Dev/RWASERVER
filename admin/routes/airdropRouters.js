const express = require("express");
const router = express.Router();
const upload = require("../../multer/multer");
const {
  getAllAirdrops,
  createAirdrop,
  updateAirdrop,
  deleteAirdrop,
} = require("../controllers/airdropController");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");

router.get("/get/allAirdrop", getAllAirdrops);
router.post(
  "/create",
  adminAuthMiddleware,
  upload.single("image"),
  createAirdrop
);

router.put(
  "/update/:id",
  adminAuthMiddleware,
  upload.single("image"),
  updateAirdrop
);
router.delete("/delete/:id", adminAuthMiddleware, deleteAirdrop);

module.exports = router;
