const axios = require("axios");
const Token = require("../models/newTokenModel");
const PortfolioToken = require("../models/userTokenPorfolio");

const { singleTokenPortfolioCal } = require("../helper/portfolioTokenReturn");

const apiRWACoins =
  "https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=real-world-assets-rwa&sparkline=true&price_change_percentage=1h,7d";

const getPortfolioToken = async (req, res) => {
  try {
    const userId = req.userId;

    const getAllToken = await PortfolioToken.find({
      userId,
      deleted: { $ne: true },
    });

    if (getAllToken.length <= 0)
      return res
        .status(400)
        .json({ status: false, message: "Could not found any token!" });

    const allTokenResp = await axios.get(apiRWACoins, {
      headers: {
        "x-cg-pro-api-key": process.env.COINGECKO_KEY,
        "Access-Control-Allow-Origin": "*",
      },
    });

    const allToken = await allTokenResp.data;

    let tokenPortfolioResult = getAllToken
      .filter((item) => item.tokenId !== "undefined")
      .map((item) =>
        singleTokenPortfolioCal(
          item.tokenId,
          item.amount,
          item.quantity,
          allToken
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
    const tokenImage = req.file;

    if (
      !nameToken ||
      !symbolToken ||
      !rwaCategory ||
      !website ||
      !submitter ||
      !tokenImage
    )
      return res
        .status(400)
        .json({ status: false, message: "Fill all require field!" });

    const userId = req.userId;

    rwaCategory = rwaCategory.split(",");

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
      tokenImage: tokenImage.filename,
      listingTerm: listingTerm === "true" ? true : false,
      supportTerm,
    };

    if (!listingTerm || !supportTerm)
      return res
        .staus(400)
        .json({ status: false, message: "Accept the term!" });
    const addNewToken = await Token.create(newTokenObj);
    await addNewToken.save();

    return res
      .status(200)
      .json({ status: true, message: "Token added successfully!" });
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

    let getAllToken = await PortfolioToken.findOneAndUpdate(
      { userId, tokenId: id },
      { amount, quantity },
      { new: true }
    );

    if (!getAllToken) {
      getAllToken = await PortfolioToken.create({
        tokenId: id,
        userId,
        amount,
        quantity,
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

    let tokenPortfolioResult = singleTokenPortfolioCal(
      getAllToken.tokenId,
      getAllToken.amount,
      getAllToken.quantity,
      allToken
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

    const checkTokenId = await PortfolioToken.findOneAndUpdate(
      { userId, tokenId: id, deleted: false },
      { deleted: true },
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

module.exports = {
  addNewToken,
  checkPortfolio,
  getPortfolioToken,
  addTokenPortfolio,
};
