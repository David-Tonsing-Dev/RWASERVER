const mongoose = require("mongoose");

const singleTokenPortfolio = mongoose.Schema(
  {
    amount: {
      type: Number,
      default: 0,
    },
    perUnit: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    datetime: {
      type: String,
    },
    tokenId: {
      type: String,
      required: true,
    },
    token_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Token",
    },
  },
  { timestamps: true }
);

const portfolioTokenSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
      default: 0,
    },
    perUnit: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    datetime: {
      type: String,
    },
    tokenId: {
      type: String,
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = new mongoose.model("PortfolioToken", portfolioTokenSchema);
