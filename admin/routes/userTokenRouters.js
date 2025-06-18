const express = require("express");
const { adminAuthMiddleware } = require("../../middlewares/authMiddleware");
const { userTokenVerified, getNewToken } = require("../controllers/userToken");
const router = express.Router();

router.get("/get", getNewToken);
router.post("/verify/:id", adminAuthMiddleware, userTokenVerified);

module.exports = router;
