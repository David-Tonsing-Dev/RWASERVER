const admin = require("../config/firebase");
const User = require("../models/userModel");
const Guest = require("../models/guestUserModel");

async function sendPushNotification(data) {
  // const getTokens = await User.find({
  //   fcmToken: { $exists: true, $ne: null, $ne: "" },
  // })
  //   .select("fcmToken")
  //   .lean();
  const getTokens = await User.find({
    fcmToken: { $exists: true, $not: { $size: 0 } },
  })
    .select("fcmToken")
    .lean();

  const getGuestTokens = await Guest.find({
    fcmToken: { $exists: true, $ne: null, $ne: "" },
  })
    .select("fcmToken")
    .lean();

  const userFcmTokens = getTokens.map((user) => user.fcmToken);
  // const userFcmTokens = [];
  // getTokens.forEach((user) => {
  //   if (Array.isArray(user.fcmToken)) {
  //     userFcmTokens.push(...user.fcmToken);
  //   } else if (typeof user.fcmToken === "string") {
  //     userFcmTokens.push(user.fcmToken);
  //   }
  // });

  const guestFcmTokens = getGuestTokens.map((user) => user.fcmToken);
  const allFcmTokens = [...userFcmTokens, ...guestFcmTokens].flat(Infinity);
  if (getTokens.length <= 0) {
    return;
  }

  const message = {
    notification: {
      title: `New ${data.title} added`,
      body: data.body || "",
      image: data.image || "",
    },
    data: {
      subject: data.title || "",
      id: data.id || "",
      slug: data.slug || "",
      youtubeUrl: data.link || "",
    },
    tokens: allFcmTokens,
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
  } catch (error) {
    console.error("Error sending message:", error);
    // res.status(500).send({ success: false, error });
  }
}

module.exports = sendPushNotification;
