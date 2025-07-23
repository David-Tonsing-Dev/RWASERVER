const cron = require("node-cron");
const { fetchMobileAppGA4Data } = require("../helper/fetchMobileAppGA4Data");
const {
  storeAllGAData,
} = require("../admin/controllers/googleAnalyticsDataController");

const startGA4 = async () => {
  try {
    cron.schedule("*/1 * * * *", async () => {
      console.log("Fetching GA4 data...");
      await fetchMobileAppGA4Data();
      await storeAllGAData();
    });

    console.log("GA CRON job started successfully!");
  } catch (err) {
    console.error("DB error:", err);
  }
};

module.exports = startGA4;
