const mongoose = require("mongoose");

const coinSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  favCoin: {
    type: [String],
  },
});

module.exports = mongoose.model("UserCoin", coinSchema);
