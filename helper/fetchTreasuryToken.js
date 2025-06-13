// const { ethers } = require("ethers");
// const axios = require("axios");
// const dotenv = require("dotenv");
// const Treasure = require("../models/condoTreasuryTokenModel");

// const {
//   condoABI,
//   mapleABI,
//   brickkenABI,
//   indexCoopABI,
//   polytradeABI,
//   devCondoABI,
// } = require("../constant/abi.js");

// const { fetchIndexCoopPrice } = require("../utils/getIndexCoopPrice.js");

// dotenv.config();

// // Addresses
// const addressToCheck = "0x6404B20B5a8493c426b6efBE52809B206b26d393";
// const condoPolygonTreasury = "0x4bF52ff02cc24ecD3d0e8E104f178647893Bd310";
// const baseWalletAddress = "0x30D19Fb77C3Ee5cFa97f73D72c6A1E509fa06AEf";
// const syrupContract = "0x643C4E15d7d62Ad0aBeC4a9BD4b001aA3Ef52d66";
// const brickkenContract = "0x0e28bC9B03971E95acF9ae1326E51ecF9C55B498";
// const indexCoopContract = "0xC884646E6C88d9b172a23051b38B0732Cc3E35a6";
// const devAddress = "0xEf3E49a3197417ccDbF5F6A60D89f7Fa4823199d";
// const devCondoContract = "0x30D19Fb77C3Ee5cFa97f73D72c6A1E509fa06AEf";
// const aurusXContractAddress = "0x1a763170B96F23f15576D0fa0b2619d1254c437d";
// const polytradeContractAddress = "0x692AC1e363ae34b6B489148152b12e2785a3d8d6";

// const baseUrl = process.env.ALCHEMY_BASE_URL;
// const ethUrl = process.env.ALCHEMY_ETH_URL;
// const bnbUrl = process.env.ALCHEMY_BNB_URL;
// const polyUrl = process.env.ALCHEMY_POLYGON_URL;
// const AurusXBalance = 25417;

// const formatEther = ethers.utils.formatEther;

// const fetchMarketPrice = async (coinId) => {
//   try {
//     const url = `https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}`;
//     const options = {
//       headers: {
//         "x-cg-pro-api-key": process.env.COINGECKO_KEY,
//       },
//     };
//     const resp = await axios.get(url, options);
//     const data = resp.data;
//     if (Array.isArray(data) && data.length > 0) {
//       return data[0];
//     }
//     throw new Error("Invalid response from CoinGecko");
//   } catch (err) {
//     console.error(`Error fetching market price for ${coinId}:`, err.message);
//     return { current_price: 0 };
//   }
// };

// async function upsertToken({
//   symbol,
//   name,
//   tokenImg,
//   tokenBalance,
//   balanceUSD,
// }) {
//   const existing = await Treasure.findOne({ where: { symbol } });
//   if (existing) {
//     await Token.update({ tokenBalance, balanceUSD }, { where: { symbol } });
//   } else {
//     await Token.create({ name, tokenImg, symbol, tokenBalance, balanceUSD });
//   }
// }

// const getBalance = async (provider, contractAddress, abi, holder) => {
//   const contract = new ethers.Contract(contractAddress, abi, provider);
//   const raw = await contract.balanceOf(holder);
//   return formatEther(raw.toString());
// };

// const fetchTreasuryToken = async () => {
//   const providerBase = new ethers.providers.JsonRpcProvider(baseUrl);
//   const providerEth = new ethers.providers.JsonRpcProvider(ethUrl);
//   const providerBnb = new ethers.providers.JsonRpcProvider(bnbUrl);
//   const providerPoly = new ethers.providers.JsonRpcProvider(polyUrl);

//   // Condo
//   const condoBalance = await getBalance(
//     providerBase,
//     baseWalletAddress,
//     condoABI,
//     addressToCheck
//   );
//   const condoDetails = await fetchMarketPrice("condo");
//   await upsertToken({
//     name: condoDetails.name,
//     tokenImg: condoDetails.image,
//     symbol: condoDetails.symbol,
//     tokenBalance: condoBalance,
//     balanceUSD: condoBalance * condoDetails.current_price,
//   });

//   // ETH
//   const ethRaw = await providerBase.getBalance(addressToCheck);
//   const ethBalance = formatEther(ethRaw.toString());
//   const ethDetails = await fetchMarketPrice("ethereum");
//   await upsertToken({
//     name: ethDetails.name,
//     tokenImg: ethDetails.image,
//     symbol: ethDetails.symbol,
//     tokenBalance: ethBalance,
//     balanceUSD: ethBalance * ethDetails.current_price,
//   });

//   // Maple Syrup
//   const syrupBalance = await getBalance(
//     providerEth,
//     syrupContract,
//     mapleABI,
//     addressToCheck
//   );
//   const syrupDetails = await fetchMarketPrice("syrup");
//   await upsertToken({
//     name: syrupDetails.name,
//     tokenImg: syrupDetails.image,
//     symbol: syrupDetails.symbol,
//     tokenBalance: syrupBalance,
//     balanceUSD: syrupBalance * syrupDetails.current_price,
//   });

//   // Brickken
//   const brickkenBalance = await getBalance(
//     providerBnb,
//     brickkenContract,
//     brickkenABI,
//     addressToCheck
//   );
//   const brickkenDetails = await fetchMarketPrice("brickken");
//   await upsertToken({
//     name: brickkenDetails.name,
//     tokenImg: brickkenDetails.image,
//     symbol: brickkenDetails.symbol,
//     tokenBalance: brickkenBalance,
//     balanceUSD: brickkenBalance * brickkenDetails.current_price,
//   });

//   // Index Coop
//   const indexBalance = await getBalance(
//     providerBase,
//     indexCoopContract,
//     indexCoopABI,
//     addressToCheck
//   );
//   const indexUsd = (await fetchIndexCoopPrice()) || 0;
//   await upsertToken({
//     name: "Index Coop Ethereum 2x Index",
//     tokenImg: "",
//     symbol: "ETH2X",
//     tokenBalance: indexBalance,
//     balanceUSD: indexBalance * indexUsd,
//   });

//   // Dev Condo
//   const devBalance = await getBalance(
//     providerBase,
//     devCondoContract,
//     devCondoABI,
//     devAddress
//   );
//   await upsertToken({
//     name: "Dev Wallet Condo",
//     symbol: "Dev",
//     tokenImg: "",
//     tokenBalance: devBalance,
//     balanceUSD: devBalance * condoDetails.current_price,
//   });

//   // Polytrade
//   const polyBalance = await getBalance(
//     providerPoly,
//     polytradeContractAddress,
//     polytradeABI,
//     condoPolygonTreasury
//   );
//   const polyDetails = await fetchMarketPrice("polytrade");
//   await upsertToken({
//     name: polyDetails.name,
//     tokenImg: polyDetails.image,
//     symbol: polyDetails.symbol,
//     tokenBalance: polyBalance,
//     balanceUSD: polyBalance * polyDetails.current_price,
//   });

//   // AurusX (constant balance)
//   const aurusXDetails = await fetchMarketPrice("aurusx");
//   await upsertToken({
//     name: aurusXDetails.name,
//     tokenImg: aurusXDetails.image,
//     symbol: aurusXDetails.symbol,
//     tokenBalance: AurusXBalance,
//     balanceUSD: AurusXBalance * aurusXDetails.current_price,
//   });

//   console.log("Token balances fetched and saved to DB.");
// };

// module.exports = {
//   fetchTreasuryToken,
// };
