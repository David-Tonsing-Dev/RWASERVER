const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const UserModel = require("../models/userModel");
const { capitalizeAfterSpace } = require("../helper/capitalize");

const createToken = (_id) => {
  const jwtkey = process.env.JWT_SECRET_KEY;
  return jwt.sign({ _id }, jwtkey, { expiresIn: "3d" });
};

const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  },
};

const signup = async (req, res) => {
  let { userName, email, password, confirmPassword, subscribe } = req.body;

  try {
    if (!userName || !email || !password || !confirmPassword)
      return res
        .status(400)
        .json({ status: false, message: "All fields are required!" });

    if (password !== confirmPassword)
      return res.status(400).json({
        status: false,
        message: "Confirm password and password must be match!",
      });

    const checkEmail = await UserModel.findOne({ email });

    // if (checkEmail)
    //   return res
    //     .status(400)
    //     .json({ status: false, message: "Email already exist!" });

    userName = capitalizeAfterSpace(userName);

    const user = new UserModel({ userName, email, password, subscribe });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const verificationToken = jwt.sign(
      { email: email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    const verificationLink = `${process.env.CLIENT_URL}/verify/${verificationToken}`;

    const nodemailerMailgun = nodemailer.createTransport(mg(auth));

    nodemailerMailgun.sendMail(
      {
        from: "admin@rwacamp.com",
        to: [email],
        subject: "Hey you, awesome!",
        html: `<p>Dear ${userName}  </p>
<p style="margin: 0; text-align: center; padding-bottom:20px">Tap the button below to confirm your email address.</p>

<p style="margin:auto;text-align:center">
 

<a href="${verificationLink}">
 <button style="padding:5px 10px;" >
   Confirm
  </button>
  </a></p>
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

    return res.status(200).json({
      status: true,
      message: "Check your email for verification!",
    });
  } catch (err) {
    console.log("Err to register user: ", err.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later!",
      error: err.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  const token = req.params.token;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await UserModel.findOneAndUpdate(
      { email: decoded.email },
      { confirmEmail: true }
    );

    if (!user) {
      return res.status(404).json({ success: true, message: "Invalid token!" });
    }

    return res.status(200).json({
      success: true,
      message: "Email verification done successfully!!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password)
      return res
        .status(400)
        .json({ status: false, message: "All fields are required!" });

    let user = await UserModel.findOne({ email });

    if (!user) return res.status(400).json("Invalid email or password!");

    if (!user.confirmEmail)
      return res
        .status(400)
        .json({ success: false, message: "Email verification not confirm!" });

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword)
      return res
        .status(400)
        .json({ status: false, message: "Invalid email or password!" });

    const token = createToken(user._id);

    return res.status(200).json({
      status: true,
      message: "Login successfully!",
      _id: user._id,
      name: user.userName,
      token,
      email,
    });
  } catch (err) {
    console.log("err", err);
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later!",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await UserModel.find();

    return res
      .status(200)
      .json({ status: true, message: "Fetch all users", data: users });
  } catch (err) {
    console.log("err", err);
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later!",
    });
  }
};

const findUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await UserModel.findById(userId);

    if (!user)
      return res
        .status(400)
        .json({ status: false, message: "User not found!" });

    res.status(200).json({
      status: true,
      message: "User fetched successfully!",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later!",
    });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  console.log("email", email);
  try {
    const verificationToken = jwt.sign(
      { email: email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${verificationToken}`;

    const nodemailerMailgun = nodemailer.createTransport(mg(auth));

    nodemailerMailgun.sendMail(
      {
        from: "service@rwacamp.com",
        to: [email],
        subject: "Reset password",
        html: `<p>Hey there,</p>
  <p>Click on the button below to reset your password </p>
  <a href="${resetLink}"><button>Reset Password</button></a>
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

    return res.status(200).json({
      success: true,
      message: "Check your email for reset password link!",
    });
  } catch (err) {
    console.log("ERROR::", err.message);
    return res.status(500).json("Something went wrong!");
  }
};

const resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const { token } = req.params;

  try {
    if (!password || !confirmPassword)
      return res.status(400).json("All fields required!");

    if (password !== confirmPassword)
      return res.status(400).json("Confirm password not match!");

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(password, salt);

    const user = await UserModel.findOneAndUpdate(
      { email: decoded.email },
      { password: newPassword }
    );

    if (!user) {
      return res.status(404).json("Invalid token!");
    }

    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully!" });
  } catch (err) {
    return res.status(500).json("Something went wrong, try again later!");
  }
};

module.exports = {
  signup,
  signin,
  getUsers,
  findUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
