const axios = require("axios");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60 });

const blog = require("../constant/blog.json");
const news = require("../constant/news.json");
const UserCoin = require("../models/userCoinModel");

const apiRWACoins =
  "https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=real-world-assets-rwa&sparkline=true&price_change_percentage=1h,7d";

const apiRWACategory =
  "https://pro-api.coingecko.com/api/v3/coins/categories/list?category_id=real-world-assets-rwa&name=Real World Assets (RWA)";

const apiHighLight = "https://pro-api.coingecko.com/api/v3/coins/categories";

const getAllToken = async (req, res) => {
  let { category, page = 1, size = 10 } = req.query;
  const userId = req.userId;
  page = parseInt(page);
  size = parseInt(size);

  try {
    const cacheKey = `allTokenData_${category || "all"}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      console.log("Fetching list of coin data from cache");
      let data = cachedData.data;

      if (category) {
        data = data.filter(
          (item) =>
            item.name.toLowerCase().includes(category.toLowerCase()) ||
            item.symbol.toLowerCase().includes(category.toLowerCase())
        );
      }

      const dataLength = data.length;

      let userCoins = await UserCoin.findOne({ userId });

      const paginatedData = data
        .map((item, index) => ({
          ...item,
          rank: index + 1,
          favCoin: userCoins ? userCoins.favCoin.includes(item.id) : false,
        }))
        .sort((a, b) => {
          if (a.favCoin && !b.favCoin) return -1;
          if (!a.favCoin && b.favCoin) return 1;
          return a.rank - b.rank;
        });

      const startIndex = (page - 1) * size;
      const paginatedDataSubset = paginatedData.slice(
        startIndex,
        startIndex + size
      );

      return res.status(200).json({
        status: true,
        currency: paginatedDataSubset,
        total: dataLength,
      });
    }

    const response = await axios.get(apiRWACoins, {
      headers: {
        "x-cg-pro-api-key": process.env.COINGECKO_KEY,
        "Access-Control-Allow-Origin": "*",
      },
    });

    let data = response.data;

    if (category) {
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(category.toLowerCase()) ||
          item.symbol.toLowerCase().includes(category.toLowerCase())
      );
    }

    const dataLength = data.length;

    cache.set(cacheKey, { status: true, data });

    let userCoins = await UserCoin.findOne({ userId });

    const paginatedData = data
      .map((item, index) => ({
        ...item,
        rank: index + 1,
        favCoin: userCoins ? userCoins.favCoin.includes(item.id) : false,
      }))
      .sort((a, b) => {
        if (a.favCoin && !b.favCoin) return -1;
        if (!a.favCoin && b.favCoin) return 1;
        return a.rank - b.rank;
      });

    const startIndex = (page - 1) * size;
    const paginatedDataSubset = paginatedData.slice(
      startIndex,
      startIndex + size
    );

    return res.status(200).json({
      status: true,
      currency: paginatedDataSubset,
      total: dataLength,
    });
  } catch (err) {
    console.error("Error fetching data:", err.message);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const getCategories = async (req, res) => {
  const { category, page, size } = req.query;
  try {
    const cacheKey = `allRWACategory ${category}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      console.log("Fetching list of coin data from cache");
      let data = cachedData.category;

      const dataLength = data.length;

      if (page && size) {
        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        data = data.slice(startIndex, endIndex);
      }

      return res
        .status(200)
        .json({ status: true, category: data, total: dataLength });
    }

    const resp = await axios.get(apiRWACategory, {
      headers: {
        "x-cg-pro-api-key": process.env.COINGECKO_KEY,
      },
    });

    let categoryData = await resp.data;

    if (!categoryData)
      return res
        .status(401)
        .json({ status: false, message: "Could not retrieved category!" });

    const dataLength = categoryData.length;

    cache.set(cacheKey, {
      status: true,
      category: categoryData,
      total: dataLength,
    });

    if (page && size) {
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size;
      categoryData = categoryData.slice(startIndex, endIndex);
    }

    return res.status(200).json({
      status: true,
      category: categoryData,
      total: dataLength,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: err.message,
    });
  }
};

const getCoinDetail = async (req, res) => {
  const { coinId } = req.params;

  try {
    const cacheKey = `coinDetail ${coinId}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      console.log("Fetching coin data from cache");
      return res.status(200).json(cachedData);
    }

    const resp = await axios.get(
      `https://pro-api.coingecko.com/api/v3/coins/${coinId}`,
      {
        headers: {
          "x-cg-pro-api-key": process.env.COINGECKO_KEY,
        },
      }
    );

    const coinDetail = await resp.data;

    if (!coinDetail)
      return res
        .status(400)
        .json({ status: false, message: "Could not fetch detail!" });

    cache.set(cacheKey, { status: true, detail: coinDetail });

    return res.status(200).json({ status: true, detail: coinDetail });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: err.message,
    });
  }
};

const getHighLightData = async (req, res) => {
  try {
    const resp = await axios.get(apiHighLight, {
      headers: {
        "x-cg-pro-api-key": process.env.COINGECKO_KEY,
        "Access-Control-Allow-Origin": "*",
      },
    });

    const highLightData = await resp.data;

    const highlightFilter = highLightData.filter(
      (item) => item.id === "real-world-assets-rwa"
    );

    if (!highLightData)
      return res
        .status(400)
        .json({ status: false, message: "Could not fetch hightlight data!" });

    return res
      .status(200)
      .json({ status: true, highlightData: highlightFilter[0] });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: err.message,
    });
  }
};

const getCoinGraphData = async (req, res) => {
  const coinId = req.params.coinId;
  try {
    const resp = await axios.get(
      `https://pro-api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=1`,
      {
        headers: {
          "x-cg-pro-api-key": process.env.COINGECKO_KEY,
          "Access-Control-Allow-Origin": "*",
        },
      }
    );

    const coinOHLCData = await resp.data;

    if (!coinOHLCData)
      return res
        .status(400)
        .json({ status: false, message: "Could not fetch graph data!" });

    return res.status(200).json({ status: true, graphData: coinOHLCData });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: err.message,
    });
  }
};

const getTrends = async (req, res) => {
  try {
    const resp = await axios.get(
      "https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=real-world-assets-rwa&order=market_cap_desc&per_page=10&page=1",
      {
        headers: {
          "x-cg-pro-api-key": process.env.COINGECKO_KEY,
          "Access-Control-Allow-Origin": "*",
        },
      }
    );

    if (!resp.data)
      return res
        .status(400)
        .json({ status: false, message: "Could not fetch trending coin!" });

    return res.status(200).json({ status: true, trend: resp.data });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: err.message,
    });
  }
};

const getBlog = async (req, res) => {
  try {
    if (!blog)
      return res
        .status(400)
        .json({ status: false, message: "Could not retrieve blog!" });
    return res.status(200).json({ status: true, blog });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: err.message,
    });
  }
};

const getNews = async (req, res) => {
  try {
    if (!news)
      return res
        .status(400)
        .json({ status: false, message: "Could not retrieve news!" });
    return res.status(200).json({ status: true, news: news.news });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: err.message,
    });
  }
};

const getNewsDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!news)
      return res
        .status(400)
        .json({ status: false, message: "Could not retrieve news!" });

    const newsObj = news.news.filter((item) => item.id === id);

    return res.status(200).json({ status: true, news: newsObj[0] });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: err.message,
    });
  }
};

module.exports = {
  getAllToken,
  getCategories,
  getCoinDetail,
  getHighLightData,
  getCoinGraphData,
  getTrends,
  getBlog,
  getNews,
  getNewsDetails,
};
