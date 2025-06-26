const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const UserModel = require("../models/userModel");
const UserCoin = require("../models/userCoinModel");
const { capitalizeAfterSpace } = require("../helper/capitalize");
const password = require("passport");
const Guest = require("../models/guestUserModel");

const createToken = (id) => {
  const jwtkey = process.env.JWT_SECRET_KEY;
  return jwt.sign({ id }, jwtkey);
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

    if (checkEmail)
      return res
        .status(400)
        .json({ status: false, message: "Email already exist!" });

    userName = capitalizeAfterSpace(userName);

    const user = new UserModel({ userName, email, password, subscribe });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const verificationToken = jwt.sign(
      { email: email },
      process.env.JWT_SECRET_KEY
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
      return res.status(404).json({ status: false, message: "Invalid token!" });
    }

    return res.status(200).json({
      status: true,
      message: "Email verification done successfully!!",
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: false, message: "Server error", error: err.message });
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

    if (!user)
      return res
        .status(400)
        .json({ status: false, message: "Invalid email or password!" });

    if (!user.confirmEmail)
      return res
        .status(400)
        .json({ status: false, message: "Email verification not confirm!" });

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
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later!",
      error: err.message,
    });
  }
};

const googleSignIn = async (req, res) => {
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  res.redirect(`http://localhost:5173/auth-success?token=${token}`);
};

const googleData = async (req, res) => {
  try {
    const { userName, email, profileImg, googleId } = req.body;
    if (!email || !userName)
      return res
        .status(400)
        .json({ status: false, message: "All fields are required!" });

    let user = await UserModel.findOne({ email });

    let addUser;
    if (!user) {
      addUser = new UserModel({ userName, email, profileImg, googleId });
      await addUser.save();
    }

    const verificationToken = jwt.sign(
      {
        id: addUser ? addUser._id : user._id,
        role: addUser ? addUser.role : user.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      status: true,
      message: "Token generated successfully",
      token: verificationToken,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
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
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later!",
      error: err.message,
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
      error: err.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    const verificationToken = jwt.sign(
      { email: email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "10m" }
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
      status: true,
      message: "Check your email for reset password link!",
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: err.message,
    });
  }
};

const resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const { token } = req.params;

  try {
    if (!password || !confirmPassword)
      return res
        .status(400)
        .json({ status: false, message: "All fields required!" });

    if (password !== confirmPassword)
      return res
        .status(400)
        .json({ status: false, message: "Confirm password not match!" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(password, salt);

    const user = await UserModel.findOneAndUpdate(
      { email: decoded.email },
      { password: newPassword }
    );

    if (!user) {
      return res.status(404).json({ status: false, message: "Invalid token!" });
    }

    return res
      .status(200)
      .json({ status: true, message: "Password reset successfully!" });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Reset link has expired. Please request a new one.",
      error: err.message,
    });
  }
};

const addUserFavCoin = async (req, res) => {
  const { coinId } = req.params;
  const userId = req.userId;
  let add = false;

  try {
    let userCoin = await UserCoin.findOne({ userId });

    if (!userId)
      return res
        .status(400)
        .json({ status: false, message: "User must signin!" });

    if (!userCoin) {
      userCoin = new UserCoin({ userId });
      userCoin.favCoin.push(coinId);
      add = true;
    } else {
      const index = userCoin.favCoin.indexOf(coinId);
      if (index === -1) {
        userCoin.favCoin.push(coinId);
        add = true;
      } else {
        userCoin.favCoin.splice(index, 1);
        add = false;
      }
    }

    userCoin = await userCoin.save();

    return res.status(200).json({
      status: true,
      message: `Token ${add ? "added to" : "removed from"} watchlist!`,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong in adding coin to favorite!",
      error: err.message,
    });
  }
};

const deleteUserFavCoin = async (req, res) => {
  const { coinId } = req.params;
  const userId = req.userId;

  try {
    let userCoin = await UserCoin.findOne({ userId });

    if (!userId)
      return res
        .status(400)
        .json({ status: false, message: "User must signin!" });

    if (!userCoin)
      return res
        .status(400)
        .json({ status: false, message: "Token not exist in watchlist!" });

    const index = userCoin.favCoin.indexOf(coinId);
    if (index === -1)
      return res
        .status(400)
        .json({ status: false, message: "Token not exist in watchlist!" });
    userCoin.favCoin.splice(index, 1);

    userCoin = await userCoin.save();

    return res
      .status(200)
      .json({ status: true, message: "Token removed from watchlist!" });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong in removing token from watchlist!",
      error: err.message,
    });
  }
};

const fcmToken = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.userId;

    if (!token) {
      return res.status(400).json({
        status: false,
        message: "FCM token is required",
      });
    }
    const count = await Guest.countDocuments();
    if (userId) {
      const user = await UserModel.findOneAndUpdate(
        { _id: userId },
        {
          $addToSet: {
            fcmTokens: token,
          },
        },
        { new: true }
      );
      const deletedGuest = await Guest.findOneAndDelete({ fcmToken: token });

      return res.status(201).json({
        status: true,
        message: "Token updated successfully",
      });
    }
    const existingGuest = await Guest.findOne({ fcmToken: token });

    if (!existingGuest) {
      const addGuestUser = new Guest({
        userName: `Guest${count + 1}`,
        fcmToken: token,
      });
      await addGuestUser.save();
    }

    return res.status(200).json({
      status: true,
      message: "Guest user created successfully!",
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports = {
  signup,
  signin,
  googleSignIn,
  getUsers,
  findUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  addUserFavCoin,
  deleteUserFavCoin,
  googleData,
  fcmToken,
};
