const cron = require("node-cron");
const {
  fetchAndStoreRwaData,
  fetchCondoToken,
  updateGlobalRanksByMarketCap,
} = require("../helper/fetchAndStoreRwaData");
const { fetchTreasuryToken } = require("../helper/fetchTreasuryToken");
const fetchUserNewToken = require("../helper/fetchUserNewToken");

const start = async () => {
  try {
    cron.schedule("*/1 * * * *", async () => {
      console.log("Fetching RWA market data...");
      await fetchTreasuryToken();
      await fetchAndStoreRwaData();
      await fetchCondoToken();
      await fetchUserNewToken();
      await updateGlobalRanksByMarketCap();
    });

    console.log("CRON job started successfully!");
  } catch (err) {
    console.error("DB error:", err);
  }
};

module.exports = start;
