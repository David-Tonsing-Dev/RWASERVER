const axios = require("axios");

const singleTokenPortfolioCal = (tokenId, amount, quantity, allToken) => {
  const tokenDetail = allToken.filter((item) => item.id === tokenId);
  const purchasePrice = amount / quantity;

  const totalPurchasePrice = purchasePrice * quantity;
  const totalCurrentPrice = tokenDetail[0].current_price * quantity;

  const profitOrLoss = totalCurrentPrice - totalPurchasePrice;

  const percentage =
    totalPurchasePrice != 0 ? (profitOrLoss / totalPurchasePrice) * 100 : 0;

  return {
    tokenId,
    amount,
    quantity,
    perUnit: isNaN(purchasePrice) ? 0 : purchasePrice,
    currentPrice: tokenDetail[0].current_price,
    returnPercentage: isNaN(percentage) ? 0 : percentage,
    return: isNaN(profitOrLoss) ? 0 : profitOrLoss,
    symbol: tokenDetail[0].symbol,
    name: tokenDetail[0].name,
    image: tokenDetail[0].image,
    price_change_percentage_24h: tokenDetail[0].price_change_percentage_24h,
    price_change_percentage_1h_in_currency:
      tokenDetail[0].price_change_percentage_1h_in_currency,
    price_change_percentage_7d_in_currency:
      tokenDetail[0].price_change_percentage_7d_in_currency,
  };
};

// const totalTokenPortfolioCal = (tokenPortfolioResult) => {
//   return tokenPortfolioResult.reduce((accumulator, currentValue) => accumulator + currentValue.amount,
//   0);
// };

module.exports = {
  singleTokenPortfolioCal,
};
