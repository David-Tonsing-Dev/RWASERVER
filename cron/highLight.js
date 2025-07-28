const cron = require("node-cron");
const fetchHighLightData = require("../helper/fetchAndStoreHighlightData");

const highLightCron = async () => {
  try {
    cron.schedule("0 * * * *", async () => {
      console.log("Fetching highlight data...");
      await fetchHighLightData();
    });

    console.log("Highlight CRON job started successfully!");
  } catch (err) {
    console.error("Error:", err);
  }
};

module.exports = highLightCron;
