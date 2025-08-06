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
    let { email, password } = req.body;

    email = email.toLowerCase();

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
    let { email, password, role } = req.body;
    email = email.toLowerCase();

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
    let { email, password, username } = req.body;
    const role = req.role;
    email = email.toLowerCase();

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

    const htmlContent = `<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; box-shadow: 0 0 3px #b8cbe9b7;">
  <div style="max-width: 600px; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background-color: #000000; padding: 30px 20px 20px; text-align: center;">
      <img src="https://res.cloudinary.com/dbtsrjssc/image/upload/v1753419169/Group_8866_an1zkz.png" alt="RWA Pros Logo" style="max-height: 40px; display: block; margin: 0 auto 20px;" />
      <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Your Login Details</h1>
    </div>

    <!-- Content -->
    <div style="padding: 30px; color: #000000; font-size: 16px; line-height: 1.5;">
      <p style="margin: 0 0 16px; color: #000000;">Hi ${username},</p>
      <p style="margin: 0 0 20px; color: #000000;">
        Welcome! Your admin account has been successfully created. Below are your login credentials:
      </p>

      <div style="background-color: #f0f0f0; padding: 15px; border-radius: 6px; margin: 20px 0; line-height: 1.6;">
        <p style="margin: 0; color: #000000;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 8px 0 0; color: #000000;"><strong>Password:</strong> ${password}</p>
      </div>

      <p style="margin: 20px 0; font-size: 16px; color: #000000;">
      You can now access your dashboard using the login details above. Visit the 
        <a href="https://rwapros.com/adminlogin" style="color:#000000; text-decoration: underline; font-weight: bold;">Admin Login</a>
      page 
      </p>

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
        from: "super_admin@rwapros.com",
        to: [email],
        subject: "Appointment Notice: Admin for RWA Pros LLC",
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
    let { email, password, username } = req.body;
    const role = req.role;
    email = email.toLowerCase();

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
    const htmlContent = `<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; box-shadow: 0 0 3px #b8cbe9b7;">
  <div style="max-width: 600px; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background-color: #000000; padding: 30px 20px 20px; text-align: center;">
      <img src="https://res.cloudinary.com/dbtsrjssc/image/upload/v1753419169/Group_8866_an1zkz.png" alt="RWA Pros Logo" style="max-height: 40px; display: block; margin: 0 auto 20px;" />
      <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Your Login Details</h1>
    </div>

    <!-- Content -->
    <div style="padding: 30px; color: #000000; font-size: 16px; line-height: 1.5;">
      <p style="margin: 0 0 16px; color: #000000;">Hi ${username},</p>
      <p style="margin: 0 0 20px; color: #000000;">
        Welcome! Your reviewer account has been successfully created. Below are your login credentials:
      </p>

      <div style="background-color: #f0f0f0; padding: 15px; border-radius: 6px; margin: 20px 0; line-height: 1.6;">
        <p style="margin: 0; color: #000000;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 8px 0 0; color: #000000;"><strong>Password:</strong> ${password}</p>
      </div>

      <p style="margin: 20px 0; font-size: 16px; color: #000000;">
      You can now access your dashboard using the login details above. Visit the 
        <a href="https://rwapros.com/reviewerlogin" style="color:#000000; text-decoration: underline; font-weight: bold;">Reviewer Login</a>
      page 
      </p>

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
        from: "super_admin@rwapros.com",
        to: [email],
        subject: "Appointment Notice: Reviewer for RWA Pros LLC",
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
    const htmlContent = `
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; box-shadow: 0 0 3px #b8cbe9b7;">
  <div style="max-width: 600px; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); background-color: #ffffff;">

    <!-- Header -->
    <div style="background-color: #000000; padding: 30px 20px 20px; text-align: center;">
      <img src="https://res.cloudinary.com/dbtsrjssc/image/upload/v1753419169/Group_8866_an1zkz.png" alt="RWA Pros Logo" style="max-height: 40px; display: block; margin: 0 auto 20px;" />
      <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Reset Your Password</h1>
    </div>

    <!-- Content -->
    <div style="padding: 30px; color: #000000;; font-size: 16px; line-height: 1.5;">
      <p style="margin: 0 0 16px; color: #000000;">Hi there,</p>
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

      <p style="margin: 0; color: #000000; ">Best regards,<br />The RWA Pros Team</p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; font-size: 12px; color: #999999; padding: 20px; border-top: 1.5px solid #ebb411;">
      <p style="margin: 4px 0;">RWA Pros LLC, Republic of Seychelles</p>
      <p style="margin: 4px 0;">Email: <a href="mailto:admin@rwapros.com" style="color: #0f1132; text-decoration: underline;">admin@rwapros.com</a></p>

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
