const express = require("express");
const router = express.Router();
const getTreasuryChart = require("../controllers/treasuryChartController");

router.get("/historical/chart", getTreasuryChart);

module.exports = router;
