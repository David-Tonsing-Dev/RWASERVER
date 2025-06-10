const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const AdminUser = require("../models/userModel");

const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  },
};

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
      { id: checkEmail._id, role: checkEmail.role },
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

const adminSignUpBySuperAdmin = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const role = req.role;

    if (role !== "SUPERADMIN")
      return res
        .status(401)
        .json({ status: false, message: "Only Super_admin can add an admin" });

    if (!email || !password || !username)
      return res
        .status(400)
        .json({ status: false, message: "All fields are required" });

    const checkEmail = await AdminUser.findOne({ email });

    if (checkEmail)
      return res
        .status(400)
        .json({ status: false, message: "Email already exist" });

    const checkUsername = await AdminUser.findOne({ username });

    if (checkUsername)
      return res
        .status(400)
        .json({ status: false, message: "Username already exist" });

    const addAdmin = new AdminUser({ username, email, password });

    const salt = await bcrypt.genSalt(10);
    addAdmin.password = await bcrypt.hash(addAdmin.password, salt);
    await addAdmin.save();

    const nodemailerMailgun = nodemailer.createTransport(mg(auth));

    nodemailerMailgun.sendMail(
      {
        from: "super_admin@rwacamp.com",
        to: [email],
        subject: "Welcome your admin credential!",
        html: `<p>Dear ${username},</p>
    <p style="margin: 0; text-align: center; padding-bottom:20px">Below are your credential as an Admin.</p>
    
    <p style="margin:auto;text-align:center">Do not shared with anyone else.</p>
    <p style="margin:auto;text-align:center">Email: ${email}</p>
    <p style="margin:auto;text-align:center">Password: ${password}</p>
    <p style="border-radius: 6px;" align="center">&nbsp;</p>
    <p>&nbsp;</p>
    `,
      },
      function (err, info) {
        if (err) {
          console.log("Error: " + err);
        } else {
          console.log("Response: " + JSON.stringify(info));
        }
      }
    );

    return res
      .status(200)
      .json({ status: true, message: "Admin added successfully" });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports = {
  adminSignIn,
  adminSignUp,
  adminSignUpBySuperAdmin,
};
