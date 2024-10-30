const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const AdminUser = require("../models/userModel");

const adminSignUp = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ status: false, message: "All field are required" });

    const checkEmail = await AdminUser.findOne({ email });

    if (checkEmail)
      return res
        .status(200)
        .json({ status: false, message: "Email already exist" });

    const user = new AdminUser({ email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    return res
      .status(200)
      .json({ status: true, message: "Admin register successfully" });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Oops! something went wrong",
      error: err.message,
    });
  }
};

const adminSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ status: false, message: "All field are required" });

    const checkEmail = await AdminUser.findOne({ email });

    if (!checkEmail)
      return res
        .status(401)
        .json({ status: false, message: "Invalid email or password" });

    const checkPassword = await bcrypt.compare(password, checkEmail.password);

    if (!checkPassword)
      return res
        .status(401)
        .json({ status: false, message: "Invalid email or password" });

    const token = jwt.sign(
      { id: checkEmail._id, role: "admin" },
      process.env.JWT_SECRET_KEY_ADMIN
    );

    return res.status(200).json({
      status: true,
      message: "Admin login successfully!",
      email,
      token,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Oops! something went wrong",
      error: err.message,
    });
  }
};

module.exports = {
  adminSignIn,
  adminSignUp,
};
