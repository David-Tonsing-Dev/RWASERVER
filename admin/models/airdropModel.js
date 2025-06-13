const mongoose = require("mongoose");

const airdropSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    tokenName: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    tokenTicker: {
      type: String,
      required: true,
    },
    chain: {
      type: String,
      required: true,
    },
    tokenDescription: {
      type: String,
      required: true,
    },
    airdropEligibility: {
      type: String,
      required: true,
    },
    airdropStart: {
      type: String,
      required: true,
    },
    airdropEnd: {
      type: String,
      required: true,
    },
    airdropAmt: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Airdrop", airdropSchema);
