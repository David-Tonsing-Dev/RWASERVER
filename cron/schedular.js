const cron = require("node-cron");
const {
  fetchAndStoreRwaData,
  fetchCondoToken,
} = require("../helper/fetchAndStoreRwaData");

const start = async () => {
  try {
    cron.schedule("*/5 * * * *", async () => {
      console.log("Fetching RWA market data...");
      await fetchAndStoreRwaData();
      await fetchCondoToken();
    });

    console.log("CRON job started successfully!");
  } catch (err) {
    console.error("DB error:", err);
  }
};

module.exports = start;
