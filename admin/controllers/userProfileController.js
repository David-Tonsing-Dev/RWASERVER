const Admin = require("../models/userModel");
const UserProfile = require("../models/userProfileModel");
const cloudinary = require("../../config/cloudinary");

const userProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { userName, description, link } = req.body;

    const userExists = await Admin.findById({ _id: userId });
    if (!userExists) {
      return res
        .status(404)
        .json({ status: false, message: "Reviewer not found." });
    }

    const uploadImg = await cloudinary.uploader.upload(req.file.path, {
      use_filename: true,
      folder: "rwa/userProfile",
    });

    if (!uploadImg)
      return res
        .status(500)
        .json({ status: false, message: "Error in uploading image" });

    const newProfile = new UserProfile({
      userId: userId,
      userName,
      profileImg: uploadImg.secure_url,
      description,
      link,
    });

    userExists.username = userName;
    await userExists.save();
    await newProfile.save();

    return res.status(200).json({
      status: true,
      message: "Profile creating successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

module.exports = userProfile;
