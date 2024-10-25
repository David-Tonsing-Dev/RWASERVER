const express = require("express");
const router = express.Router();

const { adminSignIn, adminSignUp } = require("../controllers/userController");

router.post("/signin", adminSignIn);
router.post("/signup", adminSignUp);

module.exports = router;
