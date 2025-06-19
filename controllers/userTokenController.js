const axios = require("axios");
const Token = require("../models/newTokenModel");
const PortfolioToken = require("../models/userTokenPorfolio");
const TokenRating = require("../models/tokenRatingModel");
const cloudinary = require("../config/cloudinary");

const { singleTokenPortfolioCal } = require("../helper/portfolioTokenReturn");
const { trusted } = require("mongoose");

const apiRWACoins =
  "https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=real-world-assets-rwa&sparkline=true&price_change_percentage=1h,7d";

const apiCondoMarketData =
  "https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=condo&sparkline=true&price_change_percentage=1h,7d";

const getPortfolioToken = async (req, res) => {
  try {
    const userId = req.userId;

    const getAllToken = await PortfolioToken.find({
      userId,
      deleted: { $ne: true },
    }).sort({ createdAt: -1 });

    if (getAllToken.length <= 0)
      return res.status(200).json({
        status: true,
        portfolioToken: [],
        totalAmount: 0,
        totalReturn: 0,
        totalPercentage: 0,
      });

    const allTokenResp = await axios.get(apiRWACoins, {
      headers: {
        "x-cg-pro-api-key": process.env.COINGECKO_KEY,
        "Access-Control-Allow-Origin": "*",
      },
    });
    const allToken = await allTokenResp.data;

    const responseCondo = await axios.get(apiCondoMarketData, {
      headers: {
        "x-cg-pro-api-key": process.env.COINGECKO_KEY,
        "Access-Control-Allow-Origin": "*",
      },
    });

    const condoResp = await responseCondo.data;

    const mergedAllToken = [...allToken, ...condoResp];

    let tokenPortfolioResult = getAllToken
      .filter((item) => item.tokenId !== "undefined")
      .map((item) =>
        singleTokenPortfolioCal(
          item.tokenId,
          item.amount,
          item.quantity,
          mergedAllToken
        )
      );

    const totalAmount = tokenPortfolioResult.reduce(
      (accumulator, currentValue) => accumulator + currentValue.amount,
      0
    );

    const totalReturn = tokenPortfolioResult.reduce(
      (accumulator, currentValue) => accumulator + currentValue.return,
      0
    );

    const totalPercentage = tokenPortfolioResult.reduce(
      (accumulator, currentValue) =>
        accumulator + currentValue.returnPercentage,
      0
    );

    return res.status(200).json({
      status: true,
      portfolioToken: tokenPortfolioResult,
      totalAmount,
      totalReturn,
      totalPercentage,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: err.message,
    });
  }
};

const addNewToken = async (req, res) => {
  try {
    let {
      nameToken,
      symbolToken,
      descriptionToken,
      rwaCategory,
      website,
      whitepaper,
      submitter,
      tokenIssue,
      contractAddress,
      contractDecimals,
      tokenSupply,
      twitter,
      telegram,
      facebook,
      youtube,
      subreddit,
      github,
      bitbucket,
      listingTerm,
      supportTerm,
      explorerLink1,
      explorerLink2,
      explorerLink3,
      exchangeTradeUrl,
    } = req.body;

    if (
      !nameToken ||
      !symbolToken ||
      !rwaCategory ||
      !website ||
      !submitter ||
      !req.file ||
      !listingTerm ||
      !supportTerm
    )
      return res
        .status(400)
        .json({ status: false, message: "Fill all require field!" });

    const userId = req.userId;

    rwaCategory = rwaCategory.split(",");

    const tokenImage = await cloudinary.uploader.upload(req.file.path, {
      use_filename: true,
      folder: "rwa/user/token",
    });

    if (!tokenImage)
      return res
        .status(500)
        .json({ status: false, message: "Error in uploading image" });

    const newTokenObj = {
      userId,
      nameToken,
      symbolToken,
      descriptionToken,
      rwaCategory,
      website,
      whitepaper,
      submitter,
      tokenSupply,
      communityInformation: {
        twitter,
        telegram,
        facebook,
        youtube,
        subreddit,
      },
      developerInformation: {
        github,
        bitbucket,
      },
      contractInformation: {
        tokenIssue,
        contractAddress,
        contractDecimals,
      },
      explorerLink: [explorerLink1, explorerLink2, explorerLink3],
      exchangeTradeUrl: [exchangeTradeUrl],
      tokenImage: tokenImage.secure_url,
      listingTerm: listingTerm ? true : false,
      supportTerm: supportTerm ? true : false,
    };

    if (!listingTerm || !supportTerm)
      return res
        .staus(400)
        .json({ status: false, message: "Accept the term!" });

    const addNewToken = await Token.create(newTokenObj);
    await addNewToken.save();

    return res
      .status(200)
      .json({ status: true, message: "Request submit successfully!" });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: err.message,
    });
  }
};

const checkPortfolio = async (req, res) => {
  try {
    const { amount, quantity } = req.body;
    const { id } = req.params;
    const userId = req.userId;

    if (!amount || !quantity)
      return res
        .status(400)
        .json({ status: false, message: "Amount or quantity is missing!" });

    if (!id)
      return res
        .status(400)
        .json({ status: false, message: "id cannot be undefined, check url!" });

    let getAllToken = await PortfolioToken.findOneAndUpdate(
      { userId, tokenId: id },
      { amount, quantity, deleted: false },
      { new: true }
    );

    if (!getAllToken) {
      getAllToken = await PortfolioToken.create({
        tokenId: id,
        userId,
        amount,
        quantity,
        deleted: false,
      });
      await getAllToken.save();
    }

    const allTokenResp = await axios.get(apiRWACoins, {
      headers: {
        "x-cg-pro-api-key": process.env.COINGECKO_KEY,
        "Access-Control-Allow-Origin": "*",
      },
    });
    const allToken = await allTokenResp.data;

    const responseCondo = await axios.get(apiCondoMarketData, {
      headers: {
        "x-cg-pro-api-key": process.env.COINGECKO_KEY,
        "Access-Control-Allow-Origin": "*",
      },
    });

    const condoRes = await responseCondo.data;

    const mergedAllToken = [...allToken, ...condoRes];

    let tokenPortfolioResult = singleTokenPortfolioCal(
      getAllToken.tokenId,
      getAllToken.amount,
      getAllToken.quantity,
      mergedAllToken
    );

    return res.status(200).json({
      status: true,
      tokenPortfolio: tokenPortfolioResult,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: err.message,
    });
  }
};

const addTokenPortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!id)
      return res.status(400).json({
        status: 400,
        message: "Getting undefined token id, please check url!",
      });
    const checkTokenId = await PortfolioToken.findOneAndUpdate(
      { userId, tokenId: id, deleted: false },
      { deleted: true, amount: 0, perUnit: 0, quantity: 0 },
      { new: true }
    );

    if (checkTokenId)
      return res
        .status(200)
        .json({ status: 200, message: "Token removed from portfolio!" });

    const checkTokenDeleted = await PortfolioToken.findOneAndUpdate(
      { userId, tokenId: id, deleted: true },
      { deleted: false },
      { upsert: false, new: true }
    );

    if (checkTokenDeleted)
      return res
        .status(200)
        .json({ status: 200, message: "Token added to portfolio!" });

    const addTokenObj = {
      userId,
      tokenId: id,
    };

    const addTokenToPortfolio = await PortfolioToken.create(addTokenObj);
    await addTokenToPortfolio.save();

    return res
      .status(200)
      .json({ status: true, message: "Token added to portfolio!" });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something went wrong!",
      error: err.message,
    });
  }
};

const mobileAddTokenPortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!id)
      return res.status(400).json({
        status: 400,
        message: "Getting undefined token id, please check url!",
      });
    const checkTokenId = await PortfolioToken.findOne({
      userId,
      tokenId: id,
      deleted: false,
    });

    if (checkTokenId)
      return res
        .status(200)
        .json({ status: 200, message: "Token already exist in portfolio!" });

    const checkTokenDeleted = await PortfolioToken.findOneAndUpdate(
      { userId, tokenId: id, deleted: true },
      { deleted: false },
      { upsert: false, new: true }
    );

    if (checkTokenDeleted)
      return res
        .status(200)
        .json({ status: 200, message: "Token added to portfolio!" });

    const addTokenObj = {
      userId,
      tokenId: id,
    };

    const addTokenToPortfolio = await PortfolioToken.create(addTokenObj);
    await addTokenToPortfolio.save();

    return res
      .status(200)
      .json({ status: true, message: "Token added to portfolio!" });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something went wrong!",
      error: err.message,
    });
  }
};

const removeTokenPortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!id || id === "undefined")
      return res.status(400).json({
        status: 400,
        message: "Getting undefined token id, please check url!",
      });
    const checkTokenId = await PortfolioToken.findOneAndUpdate(
      { userId, tokenId: id, deleted: false },
      { deleted: true, amount: 0, perUnit: 0, quantity: 0 },
      { new: true }
    );

    if (!checkTokenId)
      return res
        .status(400)
        .json({ status: 200, message: "Portfolio doesn't exist!" });

    return res
      .status(200)
      .json({ status: 200, message: "Token removed from portfolio!" });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something went wrong!",
      error: err.message,
    });
  }
};

const addRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ status: false, message: "Unauthorized user!" });
    }

    const ratingValue = req.body.value;

    let checkTokenRating = await TokenRating.findOne({ tokenId: id });

    if (!checkTokenRating) {
      checkTokenRating = await TokenRating.create({
        tokenId: id,
        averageRating: ratingValue,
        rating: [{ userId, value: ratingValue }],
      });
    } else {
      const existingRatingIndex = checkTokenRating.rating.findIndex((r) =>
        r.userId.equals(userId)
      );

      if (existingRatingIndex === -1) {
        checkTokenRating.rating.push({ userId, value: ratingValue });
      } else {
        checkTokenRating.rating[existingRatingIndex].value = ratingValue;
      }

      const total = checkTokenRating.rating.reduce(
        (sum, r) => sum + r.value,
        0
      );
      checkTokenRating.averageRating = total / checkTokenRating.rating.length;

      await checkTokenRating.save();
    }

    return res
      .status(200)
      .json({ status: true, message: "Rating updated successfully!" });
  } catch (err) {
    console.log("err.message", err.message);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: err.messsage,
    });
  }
};

module.exports = {
  addNewToken,
  checkPortfolio,
  getPortfolioToken,
  addTokenPortfolio,
  mobileAddTokenPortfolio,
  removeTokenPortfolio,
  addRating,
};
