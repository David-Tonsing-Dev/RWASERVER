const cron = require("node-cron");
const fetchAndStoreRwaData = require("../helper/fetchAndStoreRwaData");

const start = async () => {
  try {
    cron.schedule("*/60 * * * *", async () => {
      console.log("Fetching RWA market data...");
      await fetchAndStoreRwaData();
    });

    console.log("CRON job started successfully!");
  } catch (err) {
    console.error("DB error:", err);
  }
};

module.exports = start;
