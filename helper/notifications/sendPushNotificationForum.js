const admin = require("../../config/firebase");
const User = require("../../models/userModel");
const Guest = require("../../models/guestUserModel");

async function sendPushNotificationForum(data) {
  const message = {
    notification: {
      title: data.title,
      body: data.body || "",
      image: data.image || "",
    },
    tokens: data.userId,
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log("response", response.responses[0].error);
  } catch (error) {
    console.error("Error sending message:", error);
    // res.status(500).send({ success: false, error });
  }
}

module.exports = sendPushNotificationForum;
