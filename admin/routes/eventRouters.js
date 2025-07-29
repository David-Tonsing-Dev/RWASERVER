const express = require("express");
const router = express.Router();
const upload = require("../../multer/multer");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");

const {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvents,
  getEventById,
} = require("../controllers/eventController");

router.post(
  "/create",
  adminAuthMiddleware,
  upload.single("image"),
  createEvent
);
router.put(
  "/update/:id",
  adminAuthMiddleware,
  upload.single("image"),
  updateEvent
);
router.delete("/delete/:id", adminAuthMiddleware, deleteEvent);
router.get("/", getEvents);
router.get("/:id", getEventById);

module.exports = router;
