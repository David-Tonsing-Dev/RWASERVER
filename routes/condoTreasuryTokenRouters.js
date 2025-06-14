const express = require("express");
const {
  getAllTreasuryToken,
} = require("../controllers/treasuryToken.Controller");
const router = express.Router();

router.get("/get/allTokens", getAllTreasuryToken);

module.exports = router;
