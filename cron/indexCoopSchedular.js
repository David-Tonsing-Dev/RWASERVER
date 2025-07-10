const cron = require("node-cron");
const storeIndexCoopData = require("../helper/storeIndexCoopData");

const indexCoopStart = async () => {
  try {
    cron.schedule("0 * * * *", async () => {
      console.log("Running Index Coop job...");
      await storeIndexCoopData();
    });

    console.log("Index Coop CRON job started successfully!");
  } catch (err) {
    console.error("DB error:", err);
  }
};

module.exports = indexCoopStart;
