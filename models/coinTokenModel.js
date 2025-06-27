const mongoose = require("mongoose");

const coinGeckoTokenSchema = new mongoose.Schema(
  {
    rank: {
      type: Number,
    },
    id: {
      type: String,
      required: true,
      unique: true,
    },
    symbol: {
      type: String,
      required: true,
      // unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },

    current_price: {
      type: Number,
    },
    market_cap: {
      type: Number,
    },
    market_cap_rank: {
      type: Number,
    },
    total_volume: {
      type: Number,
    },
    circulating_supply: {
      type: Number,
    },
    price_change_percentage_1h_in_currency: {
      type: Number,
    },
    price_change_percentage_24h_in_currency: {
      type: Number,
    },

    price_change_percentage_30d_in_currency: {
      type: Number,
    },
    price_change_percentage_7d_in_currency: {
      type: Number,
    },
    market_cap_change_percentage_24h: {
      type: Number,
    },
    sparkline_in_7d: {
      type: {
        price: [Number],
      },
    },
    enable: {
      type: Boolean,
      default: true,
    },
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CoingeckoToken", coinGeckoTokenSchema);
