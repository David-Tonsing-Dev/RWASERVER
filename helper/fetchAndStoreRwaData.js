const axios = require("axios");
const CoingeckoToken = require("../models/coinTokenModel");
const Token = require("../models/newTokenModel");

const fetchAndStoreRwaData = async () => {
  const perPage = 100;
  let page = 1;
  // let globalRank = 1;

  while (true) {
    try {
      const response = await axios.get(
        "https://pro-api.coingecko.com/api/v3/coins/markets",
        {
          params: {
            vs_currency: "usd",
            category: "real-world-assets-rwa",
            price_change_percentage: "1h,24h,7d,30d",
            sparkline: "true",
            per_page: perPage,
            page,
          },
          headers: { "x-cg-pro-api-key": process.env.COINGECKO_KEY },
        }
      );

      const coins = response.data;

      if (coins.length === 0) break;

      for (const coin of coins) {
        const {
          id,
          symbol,
          name,
          image,
          current_price,
          market_cap,
          market_cap_rank,
          total_volume,
          circulating_supply,
          price_change_percentage_1h_in_currency,
          price_change_percentage_24h_in_currency,
          price_change_percentage_7d_in_currency,
          price_change_percentage_30d_in_currency,
          market_cap_change_percentage_24h,
          sparkline_in_7d,
        } = coin;

        // let i = 1;
        // if (page === 2) {
        //   console.log("id---", id, name, symbol);
        // }

        const existingToken = await CoingeckoToken.findOneAndUpdate(
          { id },
          {
            $set: {
              // rank: globalRank++,
              current_price: current_price ?? null,
              market_cap: market_cap ?? null,
              market_cap_rank: market_cap_rank ?? null,
              total_volume: total_volume ?? null,
              circulating_supply: circulating_supply ?? null,
              price_change_percentage_1h_in_currency:
                price_change_percentage_1h_in_currency ?? null,
              price_change_percentage_24h_in_currency:
                price_change_percentage_24h_in_currency ?? null,
              price_change_percentage_7d_in_currency:
                price_change_percentage_7d_in_currency ?? null,
              price_change_percentage_30d_in_currency:
                price_change_percentage_30d_in_currency ?? null,
              market_cap_change_percentage_24h:
                market_cap_change_percentage_24h ?? null,
              sparkline_in_7d: sparkline_in_7d || null,
            },
          }
        );

        if (!existingToken) {
          await CoingeckoToken.create({
            // rank: globalRank++,
            id,
            symbol,
            name,
            image,
            current_price: current_price ?? null,
            market_cap: market_cap ?? null,
            market_cap_rank: market_cap_rank ?? null,
            total_volume: total_volume ?? null,
            circulating_supply: circulating_supply ?? null,
            price_change_percentage_1h_in_currency:
              price_change_percentage_1h_in_currency ?? null,
            price_change_percentage_24h_in_currency:
              price_change_percentage_24h_in_currency ?? null,
            price_change_percentage_7d_in_currency:
              price_change_percentage_7d_in_currency ?? null,
            price_change_percentage_30d_in_currency:
              price_change_percentage_30d_in_currency ?? null,
            market_cap_change_percentage_24h:
              market_cap_change_percentage_24h ?? null,
            sparkline_in_7d: sparkline_in_7d || null,
          });
          //   await CoingeckoToken.save();
        }
      }
      console.log(`Page ${page} processed successfully.`);
      page++;

      console.log(coins.length, "coins fetched from Coingecko");
    } catch (error) {
      console.error("Error fetching data:", error.message);
      break;
    }
  }
};

const fetchCondoToken = async () => {
  try {
    const response = await axios.get(
      `https://pro-api.coingecko.com/api/v3/coins/condo?sparkline=true`,

      {
        headers: { "x-cg-pro-api-key": process.env.COINGECKO_KEY },
      }
    );

    const coin = response.data;

    const existingToken = await CoingeckoToken.findOneAndUpdate(
      {
        id: coin.id,
      },
      {
        $set: {
          current_price: coin.market_data?.current_price?.usd ?? null,
          market_cap: coin.market_data?.market_cap?.usd ?? null,
          market_cap_rank: coin.market_data?.market_cap_rank ?? null,
          total_volume: coin.market_data?.total_volume?.usd ?? null,
          circulating_supply: coin.market_data?.circulating_supply ?? null,

          price_change_percentage_1h_in_currency:
            coin.market_data?.price_change_percentage_1h_in_currency?.usd ??
            null,
          price_change_percentage_24h_in_currency:
            coin.market_data?.price_change_percentage_24h_in_currency?.usd ??
            null,
          price_change_percentage_7d_in_currency:
            coin.market_data?.price_change_percentage_7d_in_currency?.usd ??
            null,
          price_change_percentage_30d_in_currency:
            coin.market_data?.price_change_percentage_30d_in_currency?.usd ??
            null,
          sparkline_in_7d: coin.market_data?.sparkline_7d || null,
        },
      }
    );

    if (!existingToken) {
      await CoingeckoToken.create({
        id: coin.id ?? null,
        symbol: coin.symbol ?? null,
        name: coin.name ?? null,
        image: coin.image?.small ?? null,
        description: coin.description?.en ?? null,
        current_price: coin.market_data?.current_price?.usd ?? null,
        market_cap: coin.market_data?.market_cap?.usd ?? null,
        market_cap_rank: coin.market_data?.market_cap_rank ?? null,
        total_volume: coin.market_data?.total_volume?.usd ?? null,
        circulating_supply: coin.market_data?.circulating_supply ?? null,
        price_change_percentage_1h_in_currency:
          coin.market_data?.price_change_percentage_1h_in_currency?.usd ?? null,
        price_change_percentage_24h_in_currency:
          coin.market_data?.price_change_percentage_24h_in_currency?.usd ??
          null,
        price_change_percentage_7d_in_currency:
          coin.market_data?.price_change_percentage_7d_in_currency?.usd ?? null,
        price_change_percentage_30d_in_currency:
          coin.market_data?.price_change_percentage_30d_in_currency?.usd ??
          null,
        sparkline_in_7d: coin.market_data?.sparkline_7d || null,
      });
    }

    console.log("Condo token updated in the database.");
  } catch (err) {
    console.error(`Error`, err.message);
  }
};

const fetchNewToken = async (tokenId) => {
  try {
    const response = await axios.get(
      `https://pro-api.coingecko.com/api/v3/coins/${tokenId}?sparkline=true`,

      {
        headers: { "x-cg-pro-api-key": process.env.COINGECKO_KEY },
      }
    );
    const coin = response.data;
    const checkToken = await Token.findOne({ id: tokenId });

    const existingToken = await CoingeckoToken.findOneAndUpdate(
      {
        id: coin.id,
      },
      {
        $set: {
          current_price: coin.market_data?.current_price?.usd ?? null,
          market_cap: coin.market_data?.market_cap?.usd ?? null,
          market_cap_rank: coin.market_data?.market_cap_rank ?? null,
          total_volume: coin.market_data?.total_volume?.usd ?? null,
          circulating_supply: coin.market_data?.circulating_supply ?? null,

          price_change_percentage_1h_in_currency:
            coin.market_data?.price_change_percentage_1h_in_currency?.usd ??
            null,
          price_change_percentage_24h_in_currency:
            coin.market_data?.price_change_percentage_24h_in_currency?.usd ??
            null,
          price_change_percentage_7d_in_currency:
            coin.market_data?.price_change_percentage_7d_in_currency?.usd ??
            null,
          price_change_percentage_30d_in_currency:
            coin.market_data?.price_change_percentage_30d_in_currency?.usd ??
            null,
          sparkline_in_7d: coin.market_data?.sparkline_7d || null,
        },
      }
    );

    if (!existingToken) {
      const addNewToken = new CoingeckoToken({
        id: checkToken.id ?? null,
        symbol: checkToken.symbolToken ?? null,
        name: checkToken.nameToken ?? null,
        image: checkToken.tokenImage ?? null,
        description: checkToken.descriptionToken ?? null,

        current_price: coin.market_data?.current_price?.usd ?? null,
        market_cap: coin.market_data?.market_cap?.usd ?? null,
        market_cap_rank: coin.market_data?.market_cap_rank ?? null,
        total_volume: coin.market_data?.total_volume?.usd ?? null,
        circulating_supply: coin.market_data?.circulating_supply ?? null,
        price_change_percentage_1h_in_currency:
          coin.market_data?.price_change_percentage_1h_in_currency?.usd ?? null,
        price_change_percentage_24h_in_currency:
          coin.market_data?.price_change_percentage_24h_in_currency?.usd ??
          null,
        price_change_percentage_7d_in_currency:
          coin.market_data?.price_change_percentage_7d_in_currency?.usd ?? null,
        price_change_percentage_30d_in_currency:
          coin.market_data?.price_change_percentage_30d_in_currency?.usd ??
          null,
        sparkline_in_7d: coin.market_data?.sparkline_7d || null,
      });
      await addNewToken.save();
    }

    console.log("User token updated in the database.");
  } catch (err) {
    console.error(`Error`, err.message);
  }
};

// const updateGlobalRanksByMarketCap = async () => {
//   try {
//     const tokens = await CoingeckoToken.find({})
//       .sort({ market_cap: -1 })
//       .select("_id")
//       .exec();

//     const bulkOps = tokens.map((token, index) => ({
//       updateOne: {
//         filter: { _id: token._id },
//         update: { $set: { rank: index + 1 } },
//       },
//     }));

//     if (bulkOps.length > 0) {
//       await CoingeckoToken.bulkWrite(bulkOps);
//     }

//     console.log("Global ranks updated.");
//   } catch (error) {
//     console.error("Error updating ranks:", error.message);
//   }
// };

const updateGlobalRanksByMarketCap = async () => {
  try {
    const tokens = await CoingeckoToken.aggregate([
      {
        $addFields: {
          sortNullHelper: { $cond: [{ $eq: ["$market_cap", null] }, 1, 0] },
        },
      },
      {
        $sort: {
          sortNullHelper: 1,
          market_cap: -1,
        },
      },
      {
        $project: {
          _id: 1,
        },
      },
    ]);

    const bulkOps = tokens.map((token, index) => ({
      updateOne: {
        filter: { _id: token._id },
        update: { $set: { rank: index + 1 } },
      },
    }));

    if (bulkOps.length > 0) {
      await CoingeckoToken.bulkWrite(bulkOps);
    }

    console.log("Global ranks updated.");
  } catch (error) {
    console.error("Error updating ranks:", error.message);
  }
};

module.exports = {
  fetchAndStoreRwaData,
  fetchCondoToken,
  fetchNewToken,
  updateGlobalRanksByMarketCap,
};
