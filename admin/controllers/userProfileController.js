const Admin = require("../models/userModel");
const UserProfile = require("../models/userProfileModel");
const cloudinary = require("../../config/cloudinary");

const userProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { userName, description, link } = req.body;

    const userExists = await Admin.findOne({ _id: userId });
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

    const userProfileExist = await UserProfile.findOne({ userId: userId });

    let updateProfile;
    if (userProfileExist) {
      updateProfile = await UserProfile.findOneAndUpdate(
        { userId: userId },
        {
          $set: {
            userName,
            profileImg: uploadImg.secure_url,
            description,
            link,
          },
        }
      );
    } else {
      updateProfile = new UserProfile({
        userId: userId,
        userName,
        profileImg: uploadImg.secure_url,
        description,
        link,
      });
    }

    userExists.username = userName;
    await userExists.save();
    await updateProfile.save();

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
