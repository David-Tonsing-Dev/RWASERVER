const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_SETUP);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
