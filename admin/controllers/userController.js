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

// const adminSignIn = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password)
//       return res
//         .status(400)
//         .json({ status: false, message: "All field are required" });

//     const checkEmail = await AdminUser.findOne({ email });

//     if (!checkEmail)
//       return res
//         .status(401)
//         .json({ status: false, message: "Invalid email or password" });

//     const checkPassword = await bcrypt.compare(password, checkEmail.password);

//     if (!checkPassword)
//       return res
//         .status(401)
//         .json({ status: false, message: "Invalid email or password" });

//     const token = jwt.sign(
//       { id: checkEmail._id, role: checkEmail.role },
//       process.env.JWT_SECRET_KEY_ADMIN
//     );

//     return res.status(200).json({
//       status: true,
//       message: "Admin login successfully!",
//       email,
//       token,
//     });
//   } catch (err) {
//     return res.status(500).json({
//       status: false,
//       message: "Oops! something went wrong",
//       error: err.message,
//     });
//   }
// };

const adminSignIn = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ status: false, message: "All field are required" });

    let checkEmail;

    if (role && role.toUpperCase() === "REVIEWER") {
      checkEmail = await AdminUser.findOne({ email, role: "REVIEWER" });
    } else {
      checkEmail = await AdminUser.findOne({
        email,
        role: { $in: ["ADMIN", "SUPERADMIN"] },
      });
    }

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
      message: "Login successfully!",
      email,
      token,
      name: checkEmail.username,
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
        .json({ status: false, message: "Email already exists" });

    const checkUsername = await AdminUser.findOne({ username });

    if (checkUsername)
      return res
        .status(400)
        .json({ status: false, message: "Username already exists" });

    const addAdmin = new AdminUser({ username, email, password });

    const salt = await bcrypt.genSalt(10);
    addAdmin.password = await bcrypt.hash(addAdmin.password, salt);
    await addAdmin.save();

    const nodemailerMailgun = nodemailer.createTransport(mg(auth));

    nodemailerMailgun.sendMail(
      {
        from: "super_admin@rwacamp.com",
        to: [email],
        subject: "Appointment Notice: Admin for Condo-RWA Hedge Fund",
        html: `<head>
    <meta charset="UTF-8" />
    <title>Login Details</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
        font-family: Arial, sans-serif;
      }
      .container {
        max-width: 600px;
        margin: 30px auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
      .header {
        background-color: #0f1132;
        color: #ffffff;
        padding: 20px;
        text-align: center;
        font-size: 24px;
      }
      .content {
        padding: 30px;
        font-size: 16px;
        color: #333333;
      }
      .details {
        background-color: #f0f0f0;
        padding: 15px;
        border-radius: 6px;
        margin-top: 20px;
        line-height: 1.6;
      }
      .footer {
        text-align: center;
        font-size: 12px;
        color: #999999;
        padding: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">Your Login Details</div>
      <div class="content">
        <p>Hi ${username},</p>
        <p>Welcome! Your admin account has been created successfully. Please find your login credentials below:</p>

        <div class="details">
          <strong>Email:</strong> ${email}<br />
          <strong>Password:</strong> ${password}
        </div>

     <p style="margin: 20px 0; font-size: 16px; color: #333;">
  You can now log in using the credentials above. <br/> Please navigate to
  <a href="https://rwahedgefund.netlify.app/adminlogin" style="color: #0f1132; text-decoration: none; font-weight: bold;">
    Admin Login
  </a>
  to access your dashboard.
</p>
        <p>Best regards,<br />Condo Team</p>
      </div>
      <div class="footer">
        © 2025 Condo-RWAHedgefund. All rights reserved.
      </div>
    </div>
  </body>
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

const reviewerSignUpBySuperAdmin = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const role = req.role;

    if (role !== "SUPERADMIN")
      return res.status(401).json({
        status: false,
        message: "Only Super_admin can add an reviewer",
      });

    if (!email || !password || !username)
      return res
        .status(400)
        .json({ status: false, message: "All fields are required" });

    const checkEmail = await AdminUser.findOne({ email });

    if (checkEmail && checkEmail.role === "REVIEWER")
      return res
        .status(400)
        .json({ status: false, message: "Email already exists" });

    const checkUsername = await AdminUser.findOne({ username });

    if (checkUsername)
      return res
        .status(400)
        .json({ status: false, message: "Username already exists" });

    const addAdmin = new AdminUser({
      username,
      email,
      password,
      role: "REVIEWER",
    });

    const salt = await bcrypt.genSalt(10);
    addAdmin.password = await bcrypt.hash(addAdmin.password, salt);
    await addAdmin.save();

    const nodemailerMailgun = nodemailer.createTransport(mg(auth));

    nodemailerMailgun.sendMail(
      {
        from: "super_admin@rwacamp.com",
        to: [email],
        subject: "Appointment Notice: Reviewer for Condo-RWA Hedge Fund",
        html: `<head>
    <meta charset="UTF-8" />
    <title>Login Details</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
        font-family: Arial, sans-serif;
      }
      .container {
        max-width: 600px;
        margin: 30px auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
      .header {
        background-color: #0f1132;
        color: #ffffff;
        padding: 20px;
        text-align: center;
        font-size: 24px;
      }
      .content {
        padding: 30px;
        font-size: 16px;
        color: #333333;
      }
      .details {
        background-color: #f0f0f0;
        padding: 15px;
        border-radius: 6px;
        margin-top: 20px;
        line-height: 1.6;
      }
      .footer {
        text-align: center;
        font-size: 12px;
        color: #999999;
        padding: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">Your Login Details</div>
      <div class="content">
      <p>Hi ${username},</p>
        <p>Welcome! Your reviewer account has been created successfully. Please find your login credentials below:</p>

        <div class="details">
          <strong>Email:</strong> ${email}<br />
          <strong>Password:</strong> ${password}
        </div>

     <p style="margin: 20px 0; font-size: 16px; color: #333;">
  You can now log in using the credentials above. <br/> Please navigate to
  <a href="https://rwahedgefund.netlify.app/adminlogin" style="color: #0f1132; text-decoration: none; font-weight: bold;">
    Reviewer Login
  </a>
  to access your dashboard.
</p>
        <p>Best regards,<br />Condo Team</p>
      </div>
      <div class="footer">
        © 2025 Condo-RWAHedgefund. All rights reserved.
      </div>
    </div>
  </body>
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
      .json({ status: true, message: "Reviewer added successfully" });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

const adminForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await AdminUser.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Admin not found",
      });
    }

    const verificationToken = jwt.sign(
      { email: email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "10m" }
    );
    const resetLink = `${process.env.CLIENT_URL}/reset-adminpassword/${verificationToken}`;

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

const adminResetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const { token } = req.params;
  console.log("Received token:", token);

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

    const user = await AdminUser.findOneAndUpdate(
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

module.exports = {
  adminSignIn,
  adminSignUp,
  adminSignUpBySuperAdmin,
  reviewerSignUpBySuperAdmin,
  adminForgotPassword,
  adminResetPassword,
};
