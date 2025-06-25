const Admin = require("../models/userModel");
const cloudinary = require("../../config/cloudinary");

const userProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { userName, description, link } = req.body;
    const image = req.file;

    const parsedLinks = JSON.parse(link);

    const userExists = await Admin.findOne({ _id: userId });
    if (!userExists) {
      return res
        .status(404)
        .json({ status: false, message: "Reviewer not found." });
    }

    let uploadImg;
    if (image) {
      uploadImg = await cloudinary.uploader.upload(req.file.path, {
        use_filename: true,
        folder: "rwa/userProfile",
      });

      if (!uploadImg)
        return res
          .status(500)
          .json({ status: false, message: "Error in uploading image" });
    }

    const updateProfile = await Admin.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          username: userName,
          profileImg: uploadImg?.secure_url,
          description,
          link: parsedLinks,
        },
      },
      { new: true }
    );
    return res.status(200).json({
      status: true,
      message: "Profile creating successfully",
    });
  } catch (error) {
    console.log(error.message, "error");
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const userProfile = await Admin.findOne({ _id: userId }).select(
      "-password -role"
    );

    if (!userProfile) {
      return res.status(404).json({
        status: false,
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Profile retrieved successfully",
      userProfile: userProfile,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getMobileUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const userProfile = await Admin.findOne({ _id: id }).select(
      "-password -role"
    );

    if (!userProfile) {
      return res.status(404).json({
        status: false,
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Profile retrieved successfully",
      userProfile: userProfile,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = { userProfile, getUserProfile, getMobileUserProfile };
