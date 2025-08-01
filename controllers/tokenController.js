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
const GoogleAnalyticsData = require("../admin/models/googleAnalyticsDataModel");
const MobileAppAnalyticsData = require("../models/mobileAppAnalyticsDataModel");
const HighLight = require("../models/highLightModel");
const fetchHighLightData = require("../helper/fetchAndStoreHighlightData");
const { getClientIP } = require("../helper/getClientIP");

const apiRWACoins =
  "https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=real-world-assets-rwa&per_page=250&sparkline=true&price_change_percentage=1h,7d";
const apiCondoMarketData =
  "https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=condo&sparkline=true&price_change_percentage=1h,7d";

const apiRWACategory =
  "https://pro-api.coingecko.com/api/v3/coins/categories/list?category_id=real-world-assets-rwa&name=Real World Assets (RWA)";

const apiHighLight =
  "https://pro-api.coingecko.com/api/v3/coins/categories/real-world-assets-rwa";

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
    filter = filter?.trim();

    if (sortBy === "" || !sortBy) {
      sortBy = "rank";
    }
    if (order === "" || !order) {
      order = 1;
    }

    if (order) {
      if (order === "ASC" || order === "asc") order = 1;
      if (order === "DESC" || order === "desc") order = -1;
    }
    const matchStage = { enable: true, is_active: true };
    if (filter) {
      matchStage.$or = [
        { name: { $regex: filter, $options: "i" } },
        { symbol: { $regex: filter, $options: "i" } },
      ];
    }

    const pipeline = [
      { $match: matchStage },
      {
        $addFields: {
          sortNullHelper: {
            $cond: [{ $eq: [`$${sortBy}`, null] }, 1, 0],
          },
        },
      },
      {
        $sort: {
          sortNullHelper: 1,
          [sortBy]: order,
        },
      },
      { $skip: (page - 1) * size },
      { $limit: size },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $project: {
          sortNullHelper: 0,
        },
      },
    ];

    const tokens = await Token.aggregate(pipeline);

    const total = await Token.countDocuments(matchStage);

    return res.status(200).json({
      status: true,
      currency: tokens,
      total,
    });

    // const sortOptions = { [sortBy]: order };
    // const query = {
    //   [sortBy]: { $ne: null },
    //   enable: true,
    // };

    // if (filter) {
    //   const getToken = await Token.find({
    //     $and: [
    //       { enable: true },
    //       {
    //         $or: [
    //           { name: { $regex: filter, $options: "i" } },
    //           { symbol: { $regex: filter, $options: "i" } },
    //         ],
    //       },
    //     ],
    //   })
    //     .skip((page - 1) * size)
    //     .sort(sortOptions)
    //     .limit(size)
    //     .populate("category", "categoryName")
    //     .lean();

    //   const tokenCount = await Token.countDocuments({
    //     $and: [
    //       { enable: true },
    //       {
    //         $or: [
    //           { name: { $regex: filter, $options: "i" } },
    //           { symbol: { $regex: filter, $options: "i" } },
    //         ],
    //       },
    //     ],
    //   });

    //   return res
    //     .status(200)
    //     .json({ status: true, currency: getToken, total: tokenCount });
    // }

    //// const skip = (page - 1) * size;

    // const getTokens = await Token.find(query)
    //   .sort(sortOptions)
    //   .skip((page - 1) * size)
    //   .limit(size)
    //   .populate("category", "categoryName")
    //   .lean();

    // const tokenCount = await Token.countDocuments(query);

    // return res
    //   .status(200)
    //   .json({ status: true, currency: getTokens, total: tokenCount });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

const getCategoryTokens = async (req, res) => {
  try {
    const { categoryId } = req.params;
    let { page = 1, size = 10, sortBy, order } = req.query;
    page = parseInt(page);
    size = parseInt(size);

    if (sortBy === "" || !sortBy) {
      sortBy = "rank";
    }

    if (order === "" || !order) {
      order = 1;
    }

    if (order) {
      if (order === "ASC" || order === "asc") order = 1;
      if (order === "DESC" || order === "desc") order = -1;
    }

    const sortOptions = { [sortBy]: order };

    const allToken = await Token.find({
      category: categoryId,
    })
      .sort(sortOptions)
      .skip((page - 1) * size)
      .limit(size);

    return res.status(200).json({ status: true, tokens: allToken });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
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

    const getDescAndImg = await Token.findOne({ id: coinId }).populate({
      path: "category",
      select: "categoryName",
    });

    if (getDescAndImg) {
      if (getDescAndImg.description) {
        coinDetail.description.en = getDescAndImg.description;
      }

      if (getDescAndImg.image) {
        coinDetail.image.thumb = getDescAndImg.image;
        coinDetail.image.small = getDescAndImg.image;
        coinDetail.image.large = getDescAndImg.image;
      }

      if (getDescAndImg.category) {
        coinDetail.categories = getDescAndImg.category.map(
          (cat) => cat.categoryName
        );
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
      select: "username profileImg",
    });

    return res.status(200).json({
      status: true,
      detail: coinDetail,
      rank: getDescAndImg.rank,
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

// const getHighLightData = async (req, res) => {
//   try {
//     const resp = await axios.get(apiHighLight, {
//       headers: {
//         "x-cg-pro-api-key": process.env.COINGECKO_KEY,
//         "Access-Control-Allow-Origin": "*",
//       },
//     });

//     const highLightData = await resp.data;

//     const highlightFilter = highLightData.filter(
//       (item) => item.id === "real-world-assets-rwa"
//     );

//     if (!highLightData)
//       return res
//         .status(400)
//         .json({ status: false, message: "Could not fetch hightlight data!" });

//     return res
//       .status(200)
//       .json({ status: true, highlightData: highlightFilter[0] });
//   } catch (err) {
//     return res.status(500).json({
//       status: false,
//       message: "Something went wrong!",
//       error: err.message,
//     });
//   }
// };

const getHighLightData = async (req, res) => {
  try {
    const resp = await axios.get(apiHighLight, {
      headers: {
        "x-cg-pro-api-key": process.env.COINGECKO_KEY,
        "Access-Control-Allow-Origin": "*",
      },
    });

    const highLightData = await resp.data;

    if (!highLightData) {
      return res.status(400).json({
        status: false,
        message: "Could not fetch highlight data!",
      });
    }
    const todayVolume = highLightData.volume_24h;

    const yesterdayData = await HighLight.findOne();
    const yesterdayVolume = yesterdayData.volume_24h || 0;

    const volumeChange =
      yesterdayVolume > 0
        ? ((todayVolume - yesterdayVolume) / yesterdayVolume) * 100
        : 0;

    const totalData = {
      ...highLightData,
      volume_24h_change_percentage: Number(volumeChange.toFixed(2)),
    };

    return res.status(200).json({
      status: true,
      highlightData: totalData,
    });
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

const getTopGainer = async (req, res) => {
  try {
    const allResponseData = await Token.find()
      .select("-sparkline_in_7d")
      .lean();

    if (allResponseData.length <= 0)
      return res.status(400).json({ status: false });

    const sortedCoins = allResponseData
      .filter((coin) => coin.price_change_percentage_24h_in_currency != null)
      .sort(
        (a, b) =>
          b.price_change_percentage_24h_in_currency -
          a.price_change_percentage_24h_in_currency
      );

    const topGainerCoins = sortedCoins.slice(0, 100);

    return res.status(200).json({ status: true, topGainer: topGainerCoins });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

const getBlog = async (req, res) => {
  try {
    let { page = 1, size = 10, filter, sortBy, order } = req.query;
    const ip = getClientIP(req);
    console.log(ip, "============>ip");
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

// const getNews = async (req, res) => {
//   try {
//     let { page = 1, size = 10, filter, sortBy, order } = req.query;
//     page = parseInt(page);
//     size = parseInt(size);
//     sortBy = sortBy || "createdAt";
//     order =
//       order?.toLowerCase() === "asc"
//         ? 1
//         : order?.toLowerCase() === "desc"
//         ? -1
//         : -1;
//     const sortOptions = { [sortBy]: order };

//     if (!filter || filter === "") {
//       const getNews = await News.find()
//         .skip((page - 1) * size)
//         .limit(size)
//         .sort(sortOptions);

//       if (!getNews || getNews.length <= 0)
//         return res
//           .status(200)
//           .json({ status: false, message: "No news found" });

//       const total = await News.countDocuments();

//       return res.status(200).json({ status: true, news: getNews, total });
//     }

//     const getNews = await News.find({
//       $or: [
//         { title: { $regex: filter, $options: "i" } },
//         { subTitle: { $regex: filter, $options: "i" } },
//         { author: { $regex: filter, $options: "i" } },
//       ],
//     })
//       .skip((page - 1) * size)
//       .limit(size)
//       .sort(sortOptions);

//     if (!getNews || getNews.length <= 0)
//       return res.status(200).json({ status: false, message: "No news found" });

//     const total = await News.countDocuments({
//       $or: [
//         { title: { $regex: filter, $options: "i" } },
//         { subTitle: { $regex: filter, $options: "i" } },
//         { author: { $regex: filter, $options: "i" } },
//       ],
//     });

//     return res.status(200).json({ status: true, news: getNews, total });
//   } catch (err) {
//     return res.status(500).json({
//       status: false,
//       message: "Something went wrong!",
//       error: err.message,
//     });
//   }
// };

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

    const filterQuery = filter
      ? {
          $or: [
            { title: { $regex: filter, $options: "i" } },
            { subTitle: { $regex: filter, $options: "i" } },
            { author: { $regex: filter, $options: "i" } },
          ],
        }
      : {};

    const getNews = await News.find(filterQuery)
      .skip((page - 1) * size)
      .limit(size)
      .sort(sortOptions);

    if (!getNews || getNews.length === 0) {
      return res.status(200).json({ status: false, message: "No news found" });
    }

    const total = await News.countDocuments(filterQuery);

    const enrichedNews = [];

    for (const news of getNews) {
      const pagePath = `/newsdetails/${news.slug}`;

      const webDoc = await GoogleAnalyticsData.findOne({
        "pages.pagePath": pagePath,
      });
      const mobileDoc = await MobileAppAnalyticsData.findOne({
        "pages.pagePath": pagePath,
      });

      const webPageData = webDoc?.pages?.find((p) => p.pagePath === pagePath);
      const mobilePageData = mobileDoc?.pages?.find(
        (p) => p.pagePath === pagePath
      );

      const webViews = parseInt(webPageData?.screenPageViews || 0);
      const mobileViews = parseInt(mobilePageData?.screenPageViews || 0);

      enrichedNews.push({
        ...news._doc,
        views: webViews + mobileViews,
      });
    }

    return res.status(200).json({ status: true, news: enrichedNews, total });
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
    const ip = getClientIP(req);
    console.log(ip, "============>ip");

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
  getTopGainer,
  getCategoryTokens,
};
