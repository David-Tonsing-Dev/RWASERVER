const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  getAllLecture,
  updateProgressVideo,
} = require("../controllers/lectureController");

router.get("/", authMiddleware, getAllLecture);
router.post("/video/progress/:id", authMiddleware, updateProgressVideo);

module.exports = router;
