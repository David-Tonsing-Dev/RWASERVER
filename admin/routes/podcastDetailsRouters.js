const express = require("express");
const {
  getPodcastDetails,
  addPodcast,
  updatePodcast,
  deletePostcast,
} = require("../controllers/podcastDetailsController");
const upload = require("../../multer/multer");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");
const router = express.Router();

router.get("/get/allPodcasts", adminAuthMiddleware, getPodcastDetails);
router.post(
  "/add",
  adminAuthMiddleware,
  upload.single("thumbnail"),
  addPodcast
);
router.put(
  "/update/:id",
  adminAuthMiddleware,
  upload.single("thumbnail"),
  updatePodcast
);
router.delete("/delete/:id", adminAuthMiddleware, deletePostcast);

module.exports = router;
