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

    if (role !== "SUPERADMIN")
      return res
        .status(401)
        .json({ status: false, message: "Only for superadmin" });

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

    if (role !== "SUPERADMIN")
      return res.status(401).json({
        status: false,
        message: "Only superadmin can alter token",
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

const getAllTokenAdmin = async (req, res) => {
  try {
    let { page = 1, size = 100, filter, sortBy, order } = req.query;
    page = parseInt(page);
    size = parseInt(size);

    if (sortBy === "" || !sortBy) {
      sortBy = "market_cap_rank";
    }

    if (order === "" || !order) {
      order = 1;
    }

    if (order) {
      if (order === "ASC" || order === "asc") order = 1;
      if (order === "DESC" || order === "desc") order = -1;
    }
    const sortOptions = { [sortBy]: order };
    const query = {
      [sortBy]: { $ne: null },
    };
    if (filter) {
      const getToken = await Token.find({
        $or: [
          { name: { $regex: filter, $options: "i" } },
          { symbol: { $regex: filter, $options: "i" } },
        ],
      })
        .sort(sortOptions)
        .skip((page - 1) * size)
        .limit(size)
        .populate("category", "categoryName")
        .lean();

      const tokenCount = await Token.countDocuments({
        $or: [
          { name: { $regex: filter, $options: "i" } },
          { symbol: { $regex: filter, $options: "i" } },
        ],
      });

      return res.status(200).json({
        status: true,
        message: "Tokens fetched successfully.",
        currency: getToken,
        total: tokenCount,
      });
    }

    // const skip = (page - 1) * size;

    const getTokens = await Token.find(query)
      .sort(sortOptions)
      .skip((page - 1) * size)
      .limit(size)
      .populate("category", "categoryName")
      .lean();
    const tokenCount = await Token.countDocuments(query);

    return res.status(200).json({
      status: true,
      message: "Tokens fetched successfully.",
      currency: getTokens,
      total: tokenCount,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports = { updateToken, tokenEnableToggle, getAllTokenAdmin };
