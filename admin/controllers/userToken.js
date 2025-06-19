const axios = require("axios");
const Token = require("../../models/newTokenModel");
// const CoingeckoToken = require("../models/coinTokenModel");
const CoingeckoToken = require("../../models/coinTokenModel");
const { fetchNewToken } = require("../../helper/fetchAndStoreRwaData");

const getNewToken = async (req, res) => {
  try {
    let { page = 1, size = 10, filter } = req.query;

    page = parseInt(page);
    size = parseInt(size);
    if (filter === "" || !filter) {
      const getToken = await Token.find()
        .skip((page - 1) * size)
        .limit(size)
        .sort({ createdAt: -1 });

      const total = await Token.countDocuments();

      return res
        .status(200)
        .json({
          status: true,
          message: "Token fetched successfully",
          tokens: getToken,
          total,
        });
    }

    const getToken = await Token.find({
      $or: [
        { id: { $regex: filter, $options: "i" } },
        { nameToken: { $regex: filter, $options: "i" } },
        { symbolToken: { $regex: filter, $options: "i" } },
      ],
    })
      .skip((page - 1) * size)
      .limit(size)
      .sort({ createdAt: -1 });

    const total = await Token.countDocuments({
      $or: [
        { id: { $regex: filter, $options: "i" } },
        { nameToken: { $regex: filter, $options: "i" } },
        { symbolToken: { $regex: filter, $options: "i" } },
      ],
    });

    return res.status(200).json({
      status: true,
      message: "Token fetched successfully",
      tokens: getToken,
      total,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

const userTokenVerified = async (req, res) => {
  try {
    const role = req.role;
    const { id } = req.params;
    const { isVerify, tokenId } = req.body;

    if (role !== "SUPERADMIN") {
      return res.status(401).json({
        status: "false",
        message: "Unauthorized user",
      });
    }
    const checkToken = await Token.findOne({ _id: id });

    if (!checkToken) {
      return res.status(404).json({
        status: "false",
        message: "Token not found",
      });
    }
    const response = await axios.get(
      `https://pro-api.coingecko.com/api/v3/coins/${tokenId}?sparkline=true`,
      {
        headers: { "x-cg-pro-api-key": process.env.COINGECKO_KEY },
        validateStatus: () => true,
      }
    );

    if (
      response.status === 404 ||
      !response.data ||
      response.data.error === "coin not found"
    ) {
      return res.status(404).json({
        status: false,
        message:
          "Token not found on CoinGecko. Please verify the token ID and try again.",
      });
    }

    const checkTokenIdExists = await CoingeckoToken.findOne({ id: tokenId });
    if (checkTokenIdExists) {
      return res.status(404).json({
        status: false,
        message: "Token already exists",
      });
    }

    checkToken.id = tokenId;
    await checkToken.save();

    if (checkToken.adminVerified === true) {
      return res.status(400).json({
        status: "false",
        message: "Token is already verified",
      });
    }

    checkToken.adminVerified = isVerify;
    await checkToken.save();
    if (checkToken.adminVerified === true) {
      await fetchNewToken(tokenId);
    }

    return res.status(200).json({
      status: true,
      message: "Token verification status updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

module.exports = { getNewToken, userTokenVerified };
