const axios = require("axios");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60 });

const blog = require("../constant/blog.json");

const apiRWACoins =
  "https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=real-world-assets-rwa&sparkline=true&price_change_percentage=1h,7d";

const apiRWACategory =
  "https://pro-api.coingecko.com/api/v3/coins/categories/list?category_id=real-world-assets-rwa&name=Real World Assets (RWA)";

const apiHighLight = "https://pro-api.coingecko.com/api/v3/coins/categories";

const getAllToken = async (req, res) => {
  let { category, page = 1, size = 10 } = req.query;
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

      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size;
      const paginatedData = data
        .slice(startIndex, endIndex)
        .map((item, index) => ({
          ...item,
          rank: startIndex + index + 1,
        }));

      return res
        .status(200)
        .json({ success: true, currency: paginatedData, total: dataLength });
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

    cache.set(cacheKey, { success: true, data });

    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedData = data
      .slice(startIndex, endIndex)
      .map((item, index) => ({
        ...item,
        rank: startIndex + index + 1,
      }));

    console.log("Fetching list of coin data from API");

    return res
      .status(200)
      .json({ success: true, currency: paginatedData, total: dataLength });
  } catch (error) {
    console.error("Error fetching data:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
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
        .json({ success: true, category: data, total: dataLength });
    }

    const resp = await axios.get(apiRWACategory, {
      headers: {
        "x-cg-pro-api-key": process.env.COINGECKO_KEY,
      },
    });

    let categoryData = await resp.data;

    if (!categoryData)
      return res.status(401).json("Could not retrieved category!");

    const dataLength = categoryData.length;

    cache.set(cacheKey, {
      success: true,
      category: categoryData,
      total: dataLength,
    });

    if (page && size) {
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size;
      categoryData = categoryData.slice(startIndex, endIndex);
    }

    return res.status(200).json({
      success: true,
      category: categoryData,
      total: dataLength,
    });
  } catch (err) {
    console.log("EERRR", err.message);
    return res.status(500).json({
      success: false,
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

    if (!coinDetail) return res.status(400).json("Could not fetch detail!");

    cache.set(cacheKey, { success: true, detail: coinDetail });

    return res.status(200).json({ success: true, detail: coinDetail });
  } catch (err) {
    return res.status(500).json("Something went wrong!");
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
      return res.status(400).json("Could not fetch hightlight data!");

    return res
      .status(200)
      .json({ success: true, highlightData: highlightFilter[0] });
  } catch (err) {
    return res.status(500).json("Something went wrong!");
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
      return res.status(400).json("Could not fetch graph data!");

    return res.status(200).json({ success: true, graphData: coinOHLCData });
  } catch (err) {
    return res.status(500).json("Something went wrong!");
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
      return res.status(400).json("Could not fetch trending coin!");

    return res.status(200).json({ success: true, trend: resp.data });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Something went wrong!", err: err.message });
  }
};

const getBlog = async (req, res) => {
  try {
    if (!blog) return res.status(400).json("Could not retrieve blog!");
    return res.status(200).json({ success: true, blog });
  } catch (err) {
    return res.status(500).json("Something went wrong!");
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
};
