const express = require("express");
const { getPodcastDetails } = require("../controllers/podcastController");
const router = express.Router();

router.get("/", getPodcastDetails);

module.exports = router;
