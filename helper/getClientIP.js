const PageCount = require("../models/pageCountModel");
const PageView = require("../models/pageViewModel");
const TempPageView = require("../models/tempPageViewModel");
const UserStat = require("../models/userStatModel");
const crypto = require("crypto");

// function generateFingerprint(ip, userAgent) {
//   const secret = process.env.FINGERPRINT_KEY;
//   return crypto
//     .createHash("sha256")
//     .update(ip + userAgent + secret)
//     .digest("hex");
// }

// const getClientIP = async (req, id, userId = null) => {
//   const ip = req.headers["x-forwarded-for"]?.split(",")[0];
//   const userAgent = req.headers["user-agent"] || "";

//   const deviceId = generateFingerprint(ip, userAgent);
//   const userKey = userId || deviceId;

//   let isUnique = false;

//   try {
//     // await PageView.create({ pageId: id, ip });
//     await PageView.create({ pageId: id, userKey, deviceId, ip, userAgent });

//     isUnique = true;
//   } catch (err) {
//     if (err.code !== 11000) {
//       console.error("Unexpected error saving PageView:", err);
//     }
//     return;
//   }

//   if (isUnique) {
//     try {
//       await PageCount.updateOne(
//         { pageId: id },
//         { $inc: { views: 1 } },
//         { upsert: true }
//       );

//       if (userId) {
//         await UserStat.updateOne(
//           { userId },
//           { $inc: { totalViewReceived: 1 } },
//           { upsert: true }
//         );
//       }
//     } catch (err) {
//       console.error("Error incrementing counters:", err);
//     }
//   }
// };

// module.exports = { getClientIP };

function generateFingerprint(ip, userAgent) {
  const secret = process.env.FINGERPRINT_KEY;
  return crypto
    .createHash("sha256")
    .update(ip + userAgent + secret)
    .digest("hex");
}

function generateUUID() {
  return crypto.randomUUID();
}

const getClientIP = async (req, res, id, userId = null) => {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0];
  const userAgent = req.headers["user-agent"];

  let uuid = req.cookies?.device_Id;
  if (!uuid) {
    uuid = generateUUID();
    res.cookie("device_Id", uuid, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 365 * 2,
    });
  }

  const fingerprint = generateFingerprint(ip, userAgent);
  const deviceId = crypto
    .createHash("sha256")
    .update(uuid + fingerprint)
    .digest("hex");

  const userKey = userId || deviceId;
  // let isUnique = false;

  // try {
  //   await PageView.create({ pageId: id, userKey, deviceId, ip, userAgent });
  //   isUnique = true;
  // } catch (err) {
  //   if (err.code !== 11000) {
  //     console.error("Unexpected error saving PageView:", err);
  //   }
  //   return;
  // }

  // if (isUnique) {
  //   try {
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
  //     console.error("Error", err);
  //   }
  // }

  try {
    await TempPageView.create({
      pageId: id,
      userKey,
      deviceId,
      ip,
      userAgent,
    });
  } catch (err) {
    if (err.code !== 11000) {
      console.error("Unexpected error saving TempPageView:", err);
    }
    return;
  }
};

module.exports = { getClientIP };
