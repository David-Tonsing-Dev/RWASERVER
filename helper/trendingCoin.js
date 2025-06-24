const trendingCoin = (coin) => {
  if (
    coin.price_change_percentage_24h_in_currency === null ||
    coin.market_cap_change_percentage_24h === null
  ) {
    return null;
  }
  const priceChangeScore = coin.price_change_percentage_24h_in_currency || 0;
  const marketCapChangeScore = coin.market_cap_change_percentage_24h || 0;
  const trendingScore = priceChangeScore + marketCapChangeScore;
  return trendingScore;
};

module.exports = {
  trendingCoin,
};
