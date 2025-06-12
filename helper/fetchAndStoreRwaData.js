const axios = require("axios");
const CoingeckoToken = require("../models/coinTokenModel");

const fetchAndStoreRwaData = async () => {
  const perPage = 100;
  let page = 1;

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
          sparkline_in_7d,
        } = coin;

        const existingToken = await CoingeckoToken.findOneAndUpdate(
          { symbol },
          {
            $set: {
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

              sparkline_in_7d: sparkline_in_7d || null,
            },
          }
        );

        if (!existingToken) {
          await CoingeckoToken.create({
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

module.exports = { fetchAndStoreRwaData, fetchCondoToken };
