const PageCount = require("../models/pageCountModel");
const PageView = require("../models/pageViewModel");

const getClientIP = async (req, id) => {
  try {
    // const ip = req.headers["x-forwarded-for"]?.split(",")[0];
    const ip = req.ip;

    try {
      await PageView.create({ pageId: id, ip });

      await PageCount.updateOne(
        { pageId: id },
        { $inc: { views: 1 } },
        { upsert: true }
      );
    } catch (err) {
      if (err.code === 11000) {
        return;
      }
      throw err;
    }
  } catch (err) {
    console.error("Error saving view:", err);
  }

  //   const pageCount = await PageCount.findOne({ pageType, pageId: id });
  //   return pageCount ? pageCount.views : 0;
};

module.exports = { getClientIP };
