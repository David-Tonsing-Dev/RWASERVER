const cron = require("node-cron");
const TempPageView = require("../models/tempPageViewModel");
const PageView = require("../models/pageViewModel");
const PageCount = require("../models/pageCountModel");
const UserStat = require("../models/userStatModel");
const { default: mongoose } = require("mongoose");

const views = async () => {
  try {
    cron.schedule("*/1 * * * *", async () => {
      console.log("Processing page views...");

      const views = await TempPageView.find();
      if (views.length === 0) {
        console.log("No views to process.");
        return;
      }

      const pageViewOps = [];
      const pageCountMap = {};
      const userStatMap = {};

      views.forEach((v) => {
        pageViewOps.push({
          updateOne: {
            filter: { pageId: v.pageId, userKey: v.userKey },
            update: {
              $setOnInsert: {
                deviceId: v.deviceId,
                ip: v.ip,
                userAgent: v.userAgent,
              },
            },
            upsert: true,
          },
        });

        pageCountMap[v.pageId] = (pageCountMap[v.pageId] || 0) + 1;

        if (v.userId) {
          userStatMap[v.userId] = (userStatMap[v.userId] || 0) + 1;
        }
      });

      try {
        await PageView.bulkWrite(pageViewOps);

        const pageCountOps = Object.entries(pageCountMap).map(
          ([pageId, count]) => ({
            updateOne: {
              filter: { pageId },
              update: { $inc: { views: count } },
              upsert: true,
            },
          })
        );

        // const userStatOps = Object.entries(userStatMap).map(
        //   ([userId, count]) => ({
        //     updateOne: {
        //       filter: { userId },
        //       update: { $inc: { totalViewReceived: count } },
        //       upsert: true,
        //     },
        //   })
        // );

        const userStatOps = Object.entries(userStatMap).map(
          ([userId, count]) => {
            let filterId = userId;

            if (mongoose.Types.ObjectId.isValid(userId)) {
              filterId = new mongoose.Types.ObjectId(userId);
            }

            return {
              updateOne: {
                filter: { userId: filterId },
                update: { $inc: { totalViewReceived: count } },
                upsert: true,
              },
            };
          }
        );

        await PageCount.bulkWrite(pageCountOps);
        await UserStat.bulkWrite(userStatOps);

        // await TempPageView.deleteMany({});

        console.log(`Processed ${views.length} views successfully.`);
      } catch (error) {
        console.error("Error processing views:", error);
      }
    });
  } catch (err) {
    console.error("Error:", err);
  }
};

module.exports = views;
