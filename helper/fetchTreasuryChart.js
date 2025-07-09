const { ethers } = require("ethers");
const axios = require("axios");
const dotenv = require("dotenv");
const Treasury = require("../models/condoTreasuryTokenModel");
const IndexCoop = require("../models/indexCoopETH2xModel");

const { indexCoopABI } = require("../constant/abi");

dotenv.config();

// Addresses
const addressToCheck = "0x6404B20B5a8493c426b6efBE52809B206b26d393";
const indexCoopContract = "0xC884646E6C88d9b172a23051b38B0732Cc3E35a6";
const baseUrl = process.env.ALCHEMY_BASE_URL;
const AurusXBalance = 25417;
const formatEther = ethers.utils.formatEther;

const fetchMarketPrice = async (coinId) => {
  try {
    const url = `https://pro-api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1`;
    const options = {
      headers: {
        "x-cg-pro-api-key": process.env.COINGECKO_KEY,
      },
    };
    const resp = await axios.get(url, options);
    const data = resp.data;
    if (data && Array.isArray(data.prices) && data.prices.length > 0) {
      return data.prices;
    }
    throw new Error("Invalid response from CoinGecko");
  } catch (err) {
    console.error(`Error fetching market price for ${coinId}:`, err.message);
    return { current_price: 0 };
  }
};
const fetchIndexCoopPrice = async () => {
  try {
    const resp = await axios.get(
      "https://api.indexcoop.com/data/tokens/0xc884646e6c88d9b172a23051b38b0732cc3e35a6?metrics=nav"
    );
    if (Array.isArray(resp.data) && resp.data.length > 0) {
      return resp.data[0].NetAssetValue;
    }
    return null;
  } catch (err) {
    console.error("Failed to fetch INDEX token price:", err.message);
  }
};

const getBalance = async (provider, contractAddress, abi, holder) => {
  const contract = new ethers.Contract(contractAddress, abi, provider);
  const raw = await contract.balanceOf(holder);
  return formatEther(raw.toString());
};

const mapPricesToUsd = (prices = [], balance = 0) => {
  return prices.map(([timestamp, price]) => [timestamp, balance * price]);
};

const fetchTreasuryChart = async () => {
  const providerBase = new ethers.providers.JsonRpcProvider(baseUrl);

  const treasuryBalances = await Treasury.find();

  let balanceMap = {};
  treasuryBalances.forEach(({ tokenName, tokenBalance }) => {
    balanceMap[tokenName] = parseFloat(tokenBalance);
  });

  const condoDetails = await fetchMarketPrice("condo");
  const condoPricesInUsd = mapPricesToUsd(condoDetails, balanceMap["CONDO"]);

  const ethDetails = await fetchMarketPrice("ethereum");
  const ethPricesInUsd = mapPricesToUsd(ethDetails, balanceMap["Ethereum"]);

  const syrupDetails = await fetchMarketPrice("syrup");
  const syrupPricesInUsd = mapPricesToUsd(
    syrupDetails,
    balanceMap["Maple Finance"]
  );

  const brickkenDetails = await fetchMarketPrice("brickken");
  const brickkenPricesInUsd = mapPricesToUsd(
    brickkenDetails,
    balanceMap["Brickken"]
  );

  // const indexDetails = await fetchMarketPrice("index-coop-ethereum-2x-index");
  // const indexPricesInUsd = mapPricesToUsd(
  //   indexDetails,
  //   balanceMap["Index Coop Ethereum 2x Index"]
  // );
  // console.log(indexDetails, "indexDetails");
  // const transformedPriceHistory = indexDetails.map(([timestamp, price]) => ({
  //   timestamp,
  //   price,
  // }));

  // await IndexCoop.updateOne(
  //   { tokenName: "index-coop-ethereum-2x-index" },
  //   { $push: { priceHistory: { $each: transformedPriceHistory } } },
  //   { upsert: true }
  // );

  const indexBalanceStr = await getBalance(
    providerBase,
    indexCoopContract,
    indexCoopABI,
    addressToCheck
  );
  const indexBalance = parseFloat(indexBalanceStr);
  const indexPrice = await fetchIndexCoopPrice();
  const now = Date.now();

  const indexPricesInUsd = mapPricesToUsd([[now, indexPrice]], indexBalance);
  const transformedPriceHistory = indexPricesInUsd.map(
    ([timestamp, price]) => ({
      timestamp,
      price,
    })
  );
  await IndexCoop.updateOne(
    { tokenName: "index-coop-ethereum-2x-index" },
    {
      $push: { priceHistory: { $each: transformedPriceHistory } },
      $setOnInsert: { tokenName: "index-coop-ethereum-2x-index" },
    },
    { upsert: true }
  );

  const dataindex = await IndexCoop.find();

  const polyDetails = await fetchMarketPrice("polytrade");
  const polyPricesInUsd = mapPricesToUsd(polyDetails, balanceMap["Polytrade"]);

  const aurusXDetails = await fetchMarketPrice("aurusx");
  const aurusXPricesInUsd = mapPricesToUsd(aurusXDetails, AurusXBalance);

  const usdcDetails = await fetchMarketPrice("usd-coin");
  const usdcPricesInUsd = mapPricesToUsd(usdcDetails, balanceMap["USDC"]);

  const tokenPriceHistory = {
    condo: condoPricesInUsd,
    ether: ethPricesInUsd,
    aurus: aurusXPricesInUsd,
    polytrade: polyPricesInUsd,
    syrup: syrupPricesInUsd,
    brickken: brickkenPricesInUsd,
    eth2x: indexPricesInUsd,
    usdc: usdcPricesInUsd,
  };

  // const minLengthThreshold = 5;

  // const filteredTokenData = Object.values(tokenPriceHistory).filter(
  //   (arr) => arr.length >= minLengthThreshold
  // );

  const tokenData = tokenPriceHistory["ether"] || [];

  const alignedTimestamps = tokenData.map((entry) => entry[0]);

  const timestampAlignedPrices = Object.fromEntries(
    Object.entries(tokenPriceHistory).map(([token, priceData]) => {
      const filled = [];
      let foundValue = false;
      let currentValue = 0;

      alignedTimestamps.forEach((timestamp, index) => {
        const dataPoint = priceData[index] || [];

        if (dataPoint[1] !== undefined) {
          foundValue = true;
          currentValue = dataPoint[1];
          filled.push([timestamp, currentValue]);
        } else {
          filled.push([timestamp, foundValue ? currentValue : 0]);
        }
      });

      return [token, filled];
    })
  );

  console.log("HistoricalChart balances fetched.");
  return timestampAlignedPrices;
};

module.exports = {
  fetchTreasuryChart,
};
