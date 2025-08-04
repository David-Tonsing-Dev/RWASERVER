const PageCount = require("../models/pageCountModel");
const PageView = require("../models/pageViewModel");
const UserStat = require("../models/userStatModel");

const getClientIP = async (req, id, userId) => {
  // try {
  //   // const ip = req.headers["x-forwarded-for"]?.split(",")[0];
  //   const ip = req.ip;

  //   try {
  //     await PageView.create({ pageId: id, ip });

  //     await PageCount.updateOne(
  //       { pageId: id },
  //       { $inc: { views: 1 } },
  //       { upsert: true }
  //     );

  //     if (userId) {
  //       await UserStat.updateOne(
  //         { userId },
  //         { $inc: { totalViewReceived: 1 } },
  //         { upsert: true }
  //       );
  //     }
  //   } catch (err) {
  //     if (err.code === 11000) {
  //       return;
  //     }
  //     throw err;
  //   }
  // } catch (err) {
  //   console.error("Error saving view:", err);
  // }

  // const ip = req.ip;
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim();
  let isUnique = false;

  try {
    await PageView.create({ pageId: id, ip });
    isUnique = true;
  } catch (err) {
    if (err.code !== 11000) {
      console.error("Unexpected error saving PageView:", err);
    }
    return;
  }

  if (isUnique) {
    try {
      await PageCount.updateOne(
        { pageId: id },
        { $inc: { views: 1 } },
        { upsert: true }
      );

      if (userId) {
        await UserStat.updateOne(
          { userId },
          { $inc: { totalViewReceived: 1 } },
          { upsert: true }
        );
      }
    } catch (err) {
      console.error("Error incrementing counters:", err);
    }
  }
};

module.exports = { getClientIP };
