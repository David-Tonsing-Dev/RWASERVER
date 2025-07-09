const mongoose = require("mongoose");

const indexCoopSchema = new mongoose.Schema(
  {
    tokenName: {
      type: String,
      required: true,
    },
    priceHistory: [
      {
        timestamp: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("IndexCoopData", indexCoopSchema);
