const cloudinary = require("../../config/cloudinary");
const Token = require("../../models/coinTokenModel");

const updateToken = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const userId = req.userId;
    const role = req.role;

    const { description } = req.body;
    const tokenImage = req.file;

    if (!userId)
      return res
        .status(401)
        .json({ status: false, message: "Unauthorized user" });

    if (role !== "ADMIN" && role !== "SUPERADMIN")
      return res
        .status(401)
        .json({ status: false, message: "Only for admin and superadmin" });

    const checkToken = await Token.findOne({ id: tokenId });

    if (!checkToken)
      return res
        .status(400)
        .json({ status: false, message: "Token do not exist" });
    if (tokenImage) {
      const tokenImageLink = await cloudinary.uploader.upload(req.file.path, {
        use_filename: true,
        folder: "rwa/coingecko/token",
      });

      if (!tokenImageLink)
        return res
          .status(500)
          .json({ status: false, message: "Error in uploading image" });

      checkToken.image = tokenImageLink.secure_url;
    }

    if (description) {
      checkToken.description = description;
    }

    await checkToken.save();

    return res
      .status(200)
      .json({ status: true, message: "Token updated successfully" });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

const tokenEnableToggle = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const userId = req.userId;
    const role = req.role;

    if (!tokenId)
      return res
        .status(400)
        .json({ status: false, message: "Token not found" });

    if (!userId)
      return res
        .status(400)
        .json({ status: false, message: "Unauthorized user" });

    if (role !== "ADMIN" && role !== "SUPERADMIN")
      return res.status(401).json({
        status: false,
        message: "Only admin and superadmin can alter token",
      });

    const toggleToken = await Token.findOne({ id: tokenId });

    if (!toggleToken)
      return res
        .status(400)
        .json({ status: false, message: "Token not found" });

    toggleToken.enable
      ? (toggleToken.enable = false)
      : (toggleToken.enable = true);
    await toggleToken.save();
    return res
      .status(200)
      .json({ status: true, message: "Token updated successfully" });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports = { updateToken, tokenEnableToggle };
