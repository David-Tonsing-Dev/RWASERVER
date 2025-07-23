const express = require("express");
const {
  getUserAirdrops,
  getUserAirdropsById,
} = require("../controllers/userAirdropController");
const router = express.Router();

router.get("/", getUserAirdrops);
router.get("/:id", getUserAirdropsById);

module.exports = router;
