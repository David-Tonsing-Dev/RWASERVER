const PageCount = require("../models/pageCountModel");
const PageView = require("../models/pageViewModel");
const TempPageView = require("../models/tempPageViewModel");
const UserStat = require("../models/userStatModel");
const crypto = require("crypto");

const getClientIP = async (req, res, id, userId) => {
  let ip = req.headers["x-forwarded-for"]?.split(",")[0];

  let deviceId = req.cookies?.device_Id;

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    res.cookie("device_Id", deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 365 * 2,
      path: "/",
    });
  }
  try {
    // await TempPageView.create({
    //   pageId: id,
    //   deviceId,
    //   ip,
    //   userId,
    // });
    await TempPageView.updateOne(
      { pageId: id, deviceId },
      { $setOnInsert: { ip, userId } },
      { upsert: true }
    );
  } catch (err) {
    if (err.code !== 11000) {
      console.error("Unexpected error saving TempPageView:", err);
    }
  }
};

module.exports = { getClientIP };
