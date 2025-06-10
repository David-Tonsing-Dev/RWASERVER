const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    tokenId: {
      type: String,
      required: true,
    },
    review: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "AdminUser",
        },
        value: {
          type: String,
        },
        rating: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Review", reviewSchema);
