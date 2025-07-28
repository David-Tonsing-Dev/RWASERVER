const mongoose = require("mongoose");

const condoTreasuryTokenSchema = new mongoose.Schema(
  {
    tokenId: {
      type: String,
      required: true,
      unique: true,
    },
    tokenName: {
      type: String,
      required: true,
    },
    tokenImg: {
      type: String,
      default: null,
    },
    symbol: {
      type: String,
      required: true,
    },
    chain: {
      type: String,
    },
    tokenBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    tokenAddress: {
      type: String,
    },
    balanceUsd: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CondoTreasuryToken", condoTreasuryTokenSchema);
