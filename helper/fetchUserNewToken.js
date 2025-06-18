const { fetchNewToken } = require("./fetchAndStoreRwaData");
const Token = require("../models/newTokenModel");
const CoingeckoToken = require("../models/coinTokenModel");

const fetchUserNewToken = async () => {
  try {
    const userTokens = await Token.find();
    const userTokenIds = userTokens.map((token) => token.id);

    const coingeckoTokens = await CoingeckoToken.find();
    const coingeckoTokenIdSet = new Set(
      coingeckoTokens.map((token) => token.id)
    );

    for (const tokenId of userTokenIds) {
      if (coingeckoTokenIdSet.has(tokenId)) {
        await fetchNewToken(tokenId);
      }
    }

    console.log("Token sync completed.");
  } catch (err) {
    console.error("Error in syncTokens:", err);
  }
};
