const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const mongoose = require("mongoose");
const UserModel = require("../models/userModel");
const UserCoin = require("../models/userCoinModel");
const UserStat = require("../models/userStatModel");
const Guest = require("../models/guestUserModel");
const cloudinary = require("../config/cloudinary");
const { capitalizeAfterSpace } = require("../helper/capitalize");
const differenceTwoDates = require("../helper/moments/dateDifference");
const {
  calculateForBadge,
  calculateForBadgeWithoutImage,
  calculateUserAllBadges,
  calculateUserAllBadgesWithoutImg,
} = require("../helper/calculationForBadges");

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

  email = email.toLowerCase();

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

    const userStat = new UserStat({ userId: user._id });
    await userStat.save();

    const verificationToken = jwt.sign(
      { email: email },
      process.env.JWT_SECRET_KEY
    );

    const verificationLink = `${process.env.CLIENT_URL}/verify/${verificationToken}`;

    const nodemailerMailgun = nodemailer.createTransport(mg(auth));
    const htmlContent = `
<body style="margin: 0; padding: 0;  font-family: Arial, sans-serif;     box-shadow: 0 0 3px #b8cbe9b7;
">
  <div style="max-width: 600px; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background-color: #000000; padding: 30px 20px 20px; text-align: center;">
      <img src="https://res.cloudinary.com/dbtsrjssc/image/upload/v1753419169/Group_8866_an1zkz.png" alt="RWA Pros Logo" style="max-height: 40px; display: block; margin: 0 auto 20px;" />
      <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Verify Your Email Address</h1>
    </div>

    <!-- Content -->
    <div style="padding: 30px; color: #000000; font-size: 16px; line-height: 1.5;">
      <p style="margin: 0 0 16px; color: #000000;">Hi ${userName},</p>
      <p style="margin: 0 0 20px; color: #000000;">
        Thank you for signing up with <strong>RWA Pros</strong>! To complete your registration and begin exploring real-world asset opportunities, please confirm your email address below.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" target="_blank" style="background-color: #ebb411; padding: 12px 24px; border-radius: 6px; color: #ffffff; font-weight: bold; font-size: 16px; text-decoration: none;">Confirm Email</a>
      </div>

<p style="font-size:15px; line-height:1.6; color: #000000;">
  If you didn’t request this email, you can safely ignore it or contact us at  
  <a href="mailto:admin@rwapros.com" style="color:#0f1132; text-decoration: underline;">admin@rwapros.com</a>.
</p>
      <p style="margin: 0; color: #000000;">Best wishes,<br />The RWA Pros Team</p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; font-size: 12px; color: #999999; padding: 20px; border-top: 1.5px solid #ebb411; ">
      <p style="margin: 4px 0;">RWA Pros LLC, Republic of Seychelles</p>
      <p style="margin: 4px 0;">Email: <a href="mailto:admin@rwapros.com" style="color: #0f1132;  text-decoration: underline;">admin@rwapros.com</a></p>

      <div style="margin: 12px 0;">
        <a href="https://x.com/RWAPROS" style="margin: 0 6px; text-decoration: none;">
          <img src="https://res.cloudinary.com/dbtsrjssc/image/upload/v1753445015/ic_baseline-telegram-2_2_vdxodc.png" alt="Twitter" width="30" style="vertical-align: middle;" />
        </a>
        <a href="https://t.me/RealWorldAssets2023" style="margin: 0 6px; text-decoration: none;">
          <img src="https://res.cloudinary.com/dbtsrjssc/image/upload/v1753445015/ic_baseline-telegram-1_2_si1z8o.png" alt="Telegram" width="30" style="vertical-align: middle;" />
        </a>
        <a href="https://medium.com" style="margin: 0 6px; text-decoration: none;">
          <img src="https://res.cloudinary.com/dbtsrjssc/image/upload/v1753445015/ic_baseline-telegram_2_yg8a4g.png" alt="Medium" width="30" style="vertical-align: middle;" />
        </a>
      </div>

      <p style="margin: 4px 0;">© 2025 RWA Pros LLC. All rights reserved.</p>
    </div>

  </div>
</body>
`;

    nodemailerMailgun.sendMail(
      {
        from: "service@rwapros.com",
        to: [email],
        subject: "Email Confirmation – RWA Pros LLC",
        html: htmlContent,
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
  let { email, password } = req.body;

  email = email.toLowerCase();

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

    const userStat = await UserStat.findOneAndUpdate(
      {
        userId: user._id,
      },
      {},
      { upsert: true }
    ).lean();

    if (userStat) {
      for (let field in userStat) {
        if (userStat[field] === false) {
          delete userStat[field];
        }
      }
    }

    // const badges = calculateForBadge(user, userStat);
    const badgesWithoutImg = calculateForBadgeWithoutImage(user, userStat);

    return res.status(200).json({
      status: true,
      message: "Login successfully!",
      _id: user._id,
      name: user.userName,
      profileImg: user.profileImg,
      bannerImg: user.bannerImg,
      createdAt: user.createdAt,
      description: user.description,
      link: user.link,
      token,
      email,
      stat: badgesWithoutImg,
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
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
  res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`);
};

const googleData = async (req, res) => {
  try {
    let { userName, email, profileImg, googleId } = req.body;
    email = email.toLowerCase();

    if (!email || !userName)
      return res
        .status(400)
        .json({ status: false, message: "All fields are required!" });

    let user = await UserModel.findOne({ email });

    let addUser;
    if (!user) {
      addUser = new UserModel({ userName, email, profileImg, googleId });
      await addUser.save();

      const userStat = new UserStat({ userId: addUser._id });
      await userStat.save();
    }

    const verificationToken = jwt.sign(
      {
        id: addUser ? addUser._id : user._id,
        role: addUser ? addUser.role : user.role,
      },
      process.env.JWT_SECRET_KEY
    );

    const currentUser = user || addUser;

    const userStat = await UserStat.findOneAndUpdate(
      {
        userId: currentUser._id,
      },
      {},
      { upsert: true }
    ).lean();

    if (userStat) {
      for (let field in userStat) {
        if (userStat[field] === false) {
          delete userStat[field];
        }
      }
    }

    // const badges = calculateForBadge(user, userStat);
    const badgesWithoutImg = calculateForBadgeWithoutImage(
      currentUser,
      userStat
    );

    return res.status(200).json({
      status: true,
      message: "Token generated successfully",
      id: currentUser._id,
      name: currentUser.userName,
      token: verificationToken,
      profileImg: currentUser.profileImg,
      bannerImg: currentUser.bannerImg,
      createdAt: currentUser.createdAt,
      description: currentUser.description,
      email,
      stat: badgesWithoutImg,
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

    const htmlContent = `
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; box-shadow: 0 0 3px #b8cbe9b7;">
  <div style="max-width: 600px; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background-color: #000000; padding: 30px 20px 20px; text-align: center;">
      <img src="https://res.cloudinary.com/dbtsrjssc/image/upload/v1753419169/Group_8866_an1zkz.png" alt="RWA Pros Logo" style="max-height: 40px; display: block; margin: 0 auto 20px;" />
      <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Reset Your Password</h1>
    </div>

    <!-- Content -->
    <div style="padding: 30px; color: #000000; font-size: 16px; line-height: 1.5;">
      <p style="margin: 0 0 16px; color: #000000;">Hi ${user.userName},</p>
      <p style="margin: 0 0 20px; color: #000000;">
        We received a request to reset your password. Click the button below to create a new password.<br />
       
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" target="_blank" style="background-color: #ebb411; padding: 12px 24px; border-radius: 6px; color: #ffffff; font-weight: bold; font-size: 16px; text-decoration: none;">Reset Password</a>
      </div>

      <p style="font-size: 15px; line-height: 1.6; color: #000000;">
        Need assistance? Reach out to our support team at 
        <a href="mailto:admin@rwapros.com" style="color: #0f1132; text-decoration: underline;">admin@rwapros.com</a>.
      </p>

      <p style="margin: 0; color: #000000;">Best regards,<br />The RWA Pros Team</p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; font-size: 12px; color: #999999; padding: 20px; border-top: 1.5px solid #ebb411;">
      <p style="margin: 4px 0;">RWA Pros LLC, Republic of Seychelles</p>
      <p style="margin: 4px 0;">Email: 
        <a href="mailto:admin@rwapros.com" style="color: #0f1132; text-decoration: underline;">admin@rwapros.com</a>
      </p>

      <div style="margin: 12px 0;">
        <a href="https://x.com/RWAPROS" style="margin: 0 6px; text-decoration: none;">
          <img src="https://res.cloudinary.com/dbtsrjssc/image/upload/v1753445015/ic_baseline-telegram-2_2_vdxodc.png" alt="Twitter" width="30" style="vertical-align: middle;" />
        </a>
        <a href="https://t.me/RealWorldAssets2023" style="margin: 0 6px; text-decoration: none;">
          <img src="https://res.cloudinary.com/dbtsrjssc/image/upload/v1753445015/ic_baseline-telegram-1_2_si1z8o.png" alt="Telegram" width="30" style="vertical-align: middle;" />
        </a>
        <a href="https://medium.com" style="margin: 0 6px; text-decoration: none;">
          <img src="https://res.cloudinary.com/dbtsrjssc/image/upload/v1753445015/ic_baseline-telegram_2_yg8a4g.png" alt="Medium" width="30" style="vertical-align: middle;" />
        </a>
      </div>

      <p style="margin: 4px 0;">© 2025 RWA Pros LLC. All rights reserved.</p>
    </div>

  </div>
</body>
`;
    const nodemailerMailgun = nodemailer.createTransport(mg(auth));

    nodemailerMailgun.sendMail(
      {
        from: "service@rwapros.com",
        to: [email],
        subject: "Reset Your Password – RWA Pros LLC",
        html: htmlContent,
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
            fcmToken: token,
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

const updateUser = async (req, res) => {
  try {
    let {
      userName,
      email,
      link,
      description,
      removeProfileImg = false,
      removeBannerImg = false,
    } = req.body;
    const { profileImg, bannerImg } = req.files;
    const userId = req.userId;
    email = email.toLowerCase();

    link = link && link.length ? JSON.parse(link) : [];
    removeProfileImg =
      removeProfileImg && removeProfileImg === "true" ? true : false;
    removeBannerImg =
      removeBannerImg && removeBannerImg === "true" ? true : false;

    if (!userName)
      return res
        .status(400)
        .json({ status: false, message: "Username cannot be empty" });

    if (!email)
      return res
        .status(400)
        .json({ status: false, message: "Email cannot be empty" });

    if (!mongoose.Types.ObjectId.isValid(userId) || !userId)
      return res.status(403).json({ status: false, message: "User not found" });

    const checkUser = await UserModel.findOne({ _id: userId });

    if (!checkUser)
      return res.status(404).json({ status: false, message: "User not found" });

    if (userName) checkUser.userName = userName;
    if (email) checkUser.email = email;
    if (link && link.length > 0) checkUser.link = link;
    if (description) checkUser.description = description;
    // if (link && link.length > 0) {
    //   if (checkUser.link.length > 0) {
    //     const linkMap = new Map();
    //     checkUser.link.forEach((link) =>
    //       linkMap.set(link._id.toString(), link)
    //     );
    //     link.forEach(({ _id, platform, url }) => {
    //       if (!platform || !url) return;

    //       if (linkMap.has(_id)) {
    //         linkMap.get(_id).platform = platform;
    //         linkMap.get(_id).url = url;
    //       } else {
    //         linkMap.set(_id, { platform, url });
    //       }
    //     });
    //     checkUser.link = Array.from(linkMap.values());
    //   } else {
    //     checkUser.link = link;
    //   }
    // }
    if (profileImg && !bannerImg && !removeProfileImg) {
      const response = await cloudinary.uploader.upload(profileImg[0].path, {
        use_filename: true,
        folder: "rwa/user/profile",
      });
      checkUser.profileImg = response.secure_url;
    }
    if (bannerImg && !profileImg && !removeBannerImg) {
      const response = await cloudinary.uploader.upload(bannerImg[0].path, {
        use_filename: true,
        folder: "rwa/user/banner",
      });
      checkUser.bannerImg = response.secure_url;
    }
    if (profileImg && bannerImg && !removeProfileImg && !removeBannerImg) {
      const profileResponse = cloudinary.uploader.upload(profileImg[0].path, {
        use_filename: true,
        folder: "rwa/user/profile",
      });

      const bannerResponse = cloudinary.uploader.upload(bannerImg[0].path, {
        use_filename: true,
        folder: "rwa/user/banner",
      });

      const [profile, banner] = await Promise.all([
        profileResponse,
        bannerResponse,
      ]);

      checkUser.profileImg = profile.secure_url;
      checkUser.bannerImg = banner.secure_url;
    }

    if (removeProfileImg) checkUser.profileImg = null;
    if (removeBannerImg) checkUser.bannerImg = null;

    await checkUser.save();

    return res
      .status(200)
      .json({ status: true, message: "User updated successfully" });
  } catch (err) {
    console.log("ERROR::", err.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later",
    });
  }
};

const getUserDetailById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ status: false, message: "User not exist" });

    const userDetail = await UserModel.findOne({ _id: userId }).select(
      "userName email profileImg bannerImg link description createdAt"
    );

    if (!userDetail)
      return res.status(404).json({ status: false, message: "User not found" });

    const userStat = await UserStat.findOneAndUpdate(
      {
        userId,
      },
      {},
      { upsert: true }
    ).lean();

    if (userStat) {
      for (let field in userStat) {
        if (userStat[field] === false) {
          delete userStat[field];
        }
      }
    }

    // const badges = calculateForBadge(userDetail, userStat);
    const badgesWithoutImg = calculateForBadgeWithoutImage(
      userDetail,
      userStat
    );

    return res
      .status(200)
      .json({ status: true, userDetail, stat: badgesWithoutImg });
  } catch (err) {
    console.log("ERROR:: ", err.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later",
    });
  }
};

const getUserBadges = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ status: false, message: "User not found" });

    const checkUser = await UserModel.findOne({ _id: userId });

    if (!checkUser)
      return res.status(404).json({ status: false, message: "User not found" });

    const userStat = await UserStat.findOneAndUpdate(
      {
        userId,
      },
      {},
      { upsert: true }
    ).lean();

    if (userStat) {
      for (let field in userStat) {
        if (userStat[field] === false) {
          delete userStat[field];
        }
      }
    }

    // const badges = calculateUserAllBadges(checkUser, userStat);
    const badgesWithoutImg = calculateUserAllBadgesWithoutImg(
      checkUser,
      userStat
    );

    return res.status(200).json({ status: true, userStat: badgesWithoutImg });
  } catch (err) {
    console.log("ERROR::", err.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later",
    });
  }
};

module.exports = {
  signup,
  signin,
  googleSignIn,
  getUsers,
  findUser,
  getUserDetailById,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updateUser,
  addUserFavCoin,
  deleteUserFavCoin,
  googleData,
  fcmToken,
  getUserBadges,
};
