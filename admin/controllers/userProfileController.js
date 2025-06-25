const Admin = require("../models/userModel");
const cloudinary = require("../../config/cloudinary");

const userProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { userName, description, link } = req.body;
    const image = req.file;

    // let parsedLinks;
    // if (Array.isArray(link) && typeof link[0] === "string") {
    //   parsedLinks = JSON.parse(link[0]);
    // } else if (typeof link === "string") {
    //   parsedLinks = JSON.parse(link);
    // } else {
    //   parsedLinks = link;
    // }

    const parsedLinks = JSON.parse(link);
    console.log(link, "link");
    console.log(typeof link, "link typeof");
    console.log(parsedLinks, "link parse");

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
    console.log(updateProfile);
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

module.exports = { userProfile, getUserProfile };
