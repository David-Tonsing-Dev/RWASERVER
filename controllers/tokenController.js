const axios = require("axios");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60 });

const blog = require("../constant/blog.json");
const news = require("../constant/news.json");
const UserCoin = require("../models/userCoinModel");
const News = require("../admin/models/newsModel");
const Blog = require("../admin/models/blogModel");
const TokenRating = require("../models/tokenRatingModel");
const Token = require("../models/coinTokenModel");
const Review = require("../admin/models/reviewModel");
const { trendingCoin } = require("../helper/trendingCoin");

const apiRWACoins =
  "https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=real-world-assets-rwa&per_page=250&sparkline=true&price_change_percentage=1h,7d";
const apiCondoMarketData =
  "https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=condo&sparkline=true&price_change_percentage=1h,7d";

const apiRWACategory =
  "https://pro-api.coingecko.com/api/v3/coins/categories/list?category_id=real-world-assets-rwa&name=Real World Assets (RWA)";

const apiHighLight = "https://pro-api.coingecko.com/api/v3/coins/categories";

// const getAllToken = async (req, res) => {
//   let { category, page = 1, size = 100, sortDirection, sortBy } = req.query;
//   const userId = req.userId;
//   page = parseInt(page);
//   size = parseInt(size);

//   try {
//     const cacheKey = `allTokenData_${category || "all"}_${page}_${size}`;
//     const cachedData = cache.get(cacheKey);

//     if (cachedData && sortDirection === "" && sortBy === "") {
//       console.log("Fetching list of coin data from cache currencies");
//       let data = cachedData.data;

//       if (category) {
//         data = data.filter(
//           (item) =>
//             item.name.toLowerCase().includes(category.toLowerCase()) ||
//             item.symbol.toLowerCase().includes(category.toLowerCase())
//         );
//       }

//       const dataLength = data.length;

//       let userCoins = await UserCoin.findOne({ userId });

//       const paginatedData = data
//         .map((item, index) => ({
//           ...item,
//           rank: index + 1,
//           favCoin: userCoins ? userCoins.favCoin.includes(item.id) : false,
//         }))
//         .sort((a, b) => {
//           if (a.favCoin && !b.favCoin) return -1;
//           if (!a.favCoin && b.favCoin) return 1;
//           return a.rank - b.rank;
//         });

//       const startIndex = (page - 1) * size;
//       const paginatedDataSubset = paginatedData.slice(
//         startIndex,
//         startIndex + size
//       );

//       return res.status(200).json({
//         status: true,
//         currency: paginatedDataSubset,
//         total: dataLength,
//       });
//     }

//     console.log("Not fetching from cache currencies");

//     const response = await axios.get(apiRWACoins, {
//       headers: {
//         "x-cg-pro-api-key": process.env.COINGECKO_KEY,
//         "Access-Control-Allow-Origin": "*",
//       },
//     });

//     let data = response.data;

//     const responseCondo = await axios.get(apiCondoMarketData, {
//       headers: {
//         "x-cg-pro-api-key": process.env.COINGECKO_KEY,
//         "Access-Control-Allow-Origin": "*",
//       },
//     });

//     data = [...response.data, ...responseCondo.data];

//     data.sort((a, b) => {
//       if (a.market_cap_rank === null && b.market_cap_rank === null) return 0;
//       if (a.market_cap_rank === null) return 1;
//       if (b.market_cap_rank === null) return -1;
//       return a.market_cap_rank - b.market_cap_rank;
//     });

//     if (category) {
//       data = data.filter(
//         (item) =>
//           item.name.toLowerCase().includes(category.toLowerCase()) ||
//           item.symbol.toLowerCase().includes(category.toLowerCase())
//       );
//     }

//     const dataLength = data.length;

//     cache.set(cacheKey, { status: true, data });

//     let userCoins = await UserCoin.findOne({ userId });

//     const paginatedData = data
//       .map((item, index) => ({
//         ...item,
//         rank: index + 1,
//         favCoin: userCoins ? userCoins.favCoin.includes(item.id) : false,
//       }))
//       .sort((a, b) => {
//         if (a.favCoin && !b.favCoin) return -1;
//         if (!a.favCoin && b.favCoin) return 1;
//         return a.rank - b.rank;
//       });

//     if (sortDirection || sortDirection !== "" || sortBy || sortBy !== "") {
//       if (sortDirection === "asc") {
//         if (sortBy === "name") {
//           paginatedData.sort((a, b) =>
//             a[sortBy].localeCompare(b[sortBy], undefined, {
//               sensitivity: "base",
//             })
//           );
//         } else {
//           paginatedData.sort((a, b) => a[sortBy] - b[sortBy]);
//         }
//       } else if (sortDirection === "desc") {
//         if (sortBy === "name") {
//           paginatedData.sort((a, b) =>
//             b[sortBy].localeCompare(a[sortBy], undefined, {
//               sensitivity: "base",
//             })
//           );
//         } else {
//           paginatedData.sort((a, b) => b[sortBy] - a[sortBy]);
//         }
//       }
//     }

//     const startIndex = (page - 1) * size;
//     const paginatedDataSubset = paginatedData.slice(
//       startIndex,
//       startIndex + size
//     );

//     return res.status(200).json({
//       status: true,
//       currency: paginatedDataSubset,
//       total: dataLength,
//     });
//   } catch (err) {
//     console.error("Error fetching data:", err.message);
//     return res.status(500).json({
//       status: false,
//       message: "Internal Server Error",
//       error: err.message,
//     });
//   }
// };
const getAllToken = async (req, res) => {
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

    if (filter) {
      const getToken = await Token.find({
        $and: [
          { enable: true },
          {
            $or: [
              { name: { $regex: filter, $options: "i" } },
              { symbol: { $regex: filter, $options: "i" } },
            ],
          },
        ],
      })
        .skip((page - 1) * size)
        .limit(size);

      const tokenCount = await Token.countDocuments({
        $and: [
          { enable: true },
          {
            $or: [
              { name: { $regex: filter, $options: "i" } },
              { symbol: { $regex: filter, $options: "i" } },
            ],
          },
        ],
      });

      return res
        .status(200)
        .json({ status: true, currency: getToken, total: tokenCount });
    }

    // const getTokens = await Token.find()
    //   .sort({ ["market_cap_rank"]: 1 })
    //   .skip((page - 1) * size)
    //   .limit(size);
    const skip = (page - 1) * size;
    const getTokens = await Token.aggregate([
      {
        $match: {
          enable: { $eq: true },
        },
      },

      {
        $addFields: {
          sortHelper: {
            $cond: {
              if: { $eq: [`$${sortBy}`, null] },
              then: 1,
              else: 0,
            },
          },
        },
      },

      {
        $sort: {
          sortHelper: 1,
          [sortBy]: order,
        },
      },

      {
        $project: {
          sortHelper: 0,
        },
      },

      // { $skip: skip },
      // { $limit: size },
    ])
      .skip(skip)
      .limit(size);

    const tokenCount = await Token.countDocuments({ enable: true });

    return res
      .status(200)
      .json({ status: true, currency: getTokens, total: tokenCount });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
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

    console.log("Not fetching from cache");

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
    const resp = await axios.get(
      `https://pro-api.coingecko.com/api/v3/coins/${coinId}`,
      {
        headers: {
          "x-cg-pro-api-key": process.env.COINGECKO_KEY,
        },
      }
    );

    let coinDetail = await resp.data;

    if (!coinDetail)
      return res
        .status(400)
        .json({ status: false, message: "Could not fetch detail!" });

    const getDescAndImg = await Token.findOne({ id: coinId });

    if (getDescAndImg) {
      if (getDescAndImg.description) {
        coinDetail.description.en = getDescAndImg.description;
      }

      if (getDescAndImg.image) {
        coinDetail.image.thumb = getDescAndImg.image;
        coinDetail.image.small = getDescAndImg.image;
        coinDetail.image.large = getDescAndImg.image;
      }
    }

    const getRating = await TokenRating.findOne({ tokenId: coinId });

    // cache.set(cacheKey, {
    //   status: true,
    //   detail: coinDetail,
    //   rating: getRating ? getRating.averageRating : 0,
    // });

    const getExpertReview = await Review.findOne({ tokenId: coinId }).populate({
      path: "review.userId",
      select: "username",
    });

    return res.status(200).json({
      status: true,
      detail: coinDetail,
      rating: getRating ? getRating.averageRating : 0,
      totalRating: getRating ? getRating.rating.length : 0,
      expertReview: getExpertReview ? getExpertReview.review : [],
    });
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
    // const resp = await axios.get(
    //   "https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=real-world-assets-rwa&order=market_cap_desc&per_page=10&page=1",
    //   {
    //     headers: {
    //       "x-cg-pro-api-key": process.env.COINGECKO_KEY,
    //       "Access-Control-Allow-Origin": "*",
    //     },
    //   }
    // );

    // const respCondo = await axios.get(
    //   "https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=condo",
    //   {
    //     headers: {
    //       "x-cg-pro-api-key": process.env.COINGECKO_KEY,
    //       "Access-Control-Allow-Origin": "*",
    //     },
    //   }
    // );

    // if (!resp.data || !respCondo)
    //   return res
    //     .status(400)
    //     .json({ status: false, message: "Could not fetch trending coin!" });

    // const allResponseData = [...resp.data, ...respCondo.data];
    const allResponseData = await Token.find()
      .select("-sparkline_in_7d")
      .lean();

    if (allResponseData.length <= 0)
      return res
        .status(400)
        .json({ status: false, trend: allResponseData, top: allResponseData });
    allResponseData.forEach((coin) => {
      coin.trending_score = trendingCoin(coin);
    });

    const sortedCoins = allResponseData
      .filter((coin) => coin.trending_score != null)
      .sort((a, b) => b.trending_score - a.trending_score);

    const topTrendingCoins = sortedCoins.slice(0, 100);

    const sortedTopCoins = allResponseData
      .filter((coin) => coin.market_cap_rank != null)
      .sort((a, b) => a.market_cap_rank - b.market_cap_rank);

    return res
      .status(200)
      .json({ status: true, trend: topTrendingCoins, top: sortedTopCoins });
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
    let { page = 1, size = 10, filter, sortBy, order } = req.query;
    page = parseInt(page);
    size = parseInt(size);
    sortBy = sortBy || "createdAt";
    order =
      order?.toLowerCase() === "asc"
        ? 1
        : order?.toLowerCase() === "desc"
        ? -1
        : -1;

    const sortOptions = { [sortBy]: order };

    if (!filter || filter === "") {
      const getBlog = await Blog.find()
        .skip((page - 1) * size)
        .limit(size)
        .sort(sortOptions);

      if (!getBlog || getBlog.length <= 0)
        return res
          .status(200)
          .json({ status: false, message: "No blog found" });

      const total = await Blog.countDocuments();

      return res.status(200).json({ status: true, blog: getBlog, total });
    }

    const getBlog = await Blog.find({
      $or: [
        { title: { $regex: filter, $options: "i" } },
        { subTitle: { $regex: filter, $options: "i" } },
        { category: { $regex: filter, $options: "i" } },
        { author: { $regex: filter, $options: "i" } },
      ],
    })
      .skip((page - 1) * size)
      .limit(size)
      .sort(sortOptions);

    if (!getBlog || getBlog.length <= 0)
      return res.status(200).json({ status: false, message: "No blog found" });

    const total = await Blog.countDocuments({
      $or: [
        { title: { $regex: filter, $options: "i" } },
        { subTitle: { $regex: filter, $options: "i" } },
        { category: { $regex: filter, $options: "i" } },
        { author: { $regex: filter, $options: "i" } },
      ],
    });

    return res.status(200).json({ status: true, blog: getBlog, total });
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
    let { page = 1, size = 10, filter, sortBy, order } = req.query;
    page = parseInt(page);
    size = parseInt(size);
    sortBy = sortBy || "createdAt";
    order =
      order?.toLowerCase() === "asc"
        ? 1
        : order?.toLowerCase() === "desc"
        ? -1
        : -1;
    const sortOptions = { [sortBy]: order };

    if (!filter || filter === "") {
      const getNews = await News.find()
        .skip((page - 1) * size)
        .limit(size)
        .sort(sortOptions);

      if (!getNews || getNews.length <= 0)
        return res
          .status(200)
          .json({ status: false, message: "No news found" });

      const total = await News.countDocuments();

      return res.status(200).json({ status: true, news: getNews, total });
    }

    const getNews = await News.find({
      $or: [
        { title: { $regex: filter, options: "i" } },
        { subTitle: { $regex: filter, options: "i" } },
        { author: { $regex: filter, options: "i" } },
      ],
    })
      .skip((page - 1) * size)
      .limit(size)
      .sort(sortOptions);

    if (!getNews || getNews.length <= 0)
      return res.status(200).json({ status: false, message: "No news found" });

    const total = await News.countDocuments({
      $or: [
        { title: { $regex: filter, options: "i" } },
        { subTitle: { $regex: filter, options: "i" } },
        { author: { $regex: filter, options: "i" } },
      ],
    });

    return res.status(200).json({ status: true, news: getNews, total });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: err.message,
    });
  }
};

const getNewsDetail = async (req, res) => {
  try {
    const { slug } = req.params;

    const newsObj = await News.findOne({ slug });

    if (!newsObj)
      return res
        .status(400)
        .json({ status: false, message: "News doesn't exist!" });

    return res.status(200).json({ status: true, news: newsObj });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: err.message,
    });
  }
};

const getBlogDetail = async (req, res) => {
  try {
    const { slug } = req.params;

    const getBlog = await Blog.findOne({ slug });

    if (!getBlog)
      return res
        .status(400)
        .json({ status: false, message: "Blog doesn't exist!" });

    return res.status(200).json({ status: true, blog: getBlog });
  } catch (err) {
    console.log(err, "error");
    res.status(500).json({
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
  getNewsDetail,
  getBlogDetail,
};
