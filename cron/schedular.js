const cron = require("node-cron");
const {
  fetchAndStoreRwaData,
  fetchCondoToken,
  updateGlobalRanksByMarketCap,
} = require("../helper/fetchAndStoreRwaData");
const { fetchTreasuryToken } = require("../helper/fetchTreasuryToken");
const fetchUserNewToken = require("../helper/fetchUserNewToken");
const { fetchTreasuryChart } = require("../helper/fetchTreasuryChart");

const start = async () => {
  try {
    cron.schedule("*/5 * * * *", async () => {
      console.log("Fetching RWA market data...");
      await fetchTreasuryToken();
      await fetchAndStoreRwaData();
      await fetchCondoToken();
      await updateGlobalRanksByMarketCap();
      await fetchUserNewToken();
      await fetchTreasuryChart();
    });

    console.log("CRON job started successfully!");
  } catch (err) {
    console.error("DB error:", err);
  }
};

module.exports = start;
