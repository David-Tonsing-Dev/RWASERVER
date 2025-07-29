const cron = require("node-cron");
const { fetchMobileAppGA4Data } = require("../helper/fetchMobileAppGA4Data");
const {
  storeAllGAData,
} = require("../admin/controllers/googleAnalyticsDataController");

const startGA = async () => {
  try {
    cron.schedule("*/3 * * * *", async () => {
      console.log("Fetching GA data...");
      await fetchMobileAppGA4Data();
      await storeAllGAData();
    });

    console.log("GA CRON job started successfully!");
  } catch (err) {
    console.error("Error:", err);
  }
};

module.exports = startGA;
