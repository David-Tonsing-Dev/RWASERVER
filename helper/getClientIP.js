const PageCount = require("../models/pageCountModel");
const PageView = require("../models/pageViewModel");

const getClientIP = async (req, id) => {
  try {
    // const forwarded = req.headers["x-forwarded-for"];
    // const ip = forwarded
    //   ? forwarded.split(",")[0]
    //   : req.socket?.remoteAddress || null;

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.connection?.socket?.remoteAddress;

    // const pathParts = req.path.split("/").filter(Boolean);
    //  const pageType = pathParts[0] || "unknown";

    // await PageView.create({ pageType, pageId: id, ip });

    // await PageCount.updateOne(
    //   { pageType, pageId: id },
    //   { $inc: { views: 1 } },
    //   { upsert: true }
    // );

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
