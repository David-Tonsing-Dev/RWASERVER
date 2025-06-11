const Token = require("../../models/coinTokenModel");

const updateToken = async (req, res) => {
  try {
    const tokenId = req.params;
    const userId = req.userId;
    const role = req.role;

    const { description } = req.body;
    const { image } = req.file;

    if (!userId)
      return res
        .status(401)
        .json({ status: false, message: "Unauthorized user" });

    if (role !== "ADMIN" && role !== "SUPERADMIN")
      return res
        .status(401)
        .json({ status: false, message: "Only for admin and superadmin" });

    const checkToken = await Token.findOne({ tokenId });

    if (!checkToken)
      return res
        .status(400)
        .json({ status: false, message: "Token do not exist" });

    if (image) {
      const tokenImage = await cloudinary.uploader.upload("tokenImage", {
        use_filename: true,
        folder: "rwa/coingecko/token",
      });

      if (!tokenImage)
        return res
          .status(500)
          .json({ status: false, message: "Error in uploading image" });

      checkToken.image = tokenImage.secure_url;
    }

    if (description) {
      checkToken.description = description;
    }

    await checkToken.save();

    return res
      .status(200)
      .json({ status: true, message: "Token updated successfully" });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports = { updateToken };
