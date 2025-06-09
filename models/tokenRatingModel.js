const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    tokenId: {
      type: String,
      required: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    rating: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        value: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("TokenRating", ratingSchema);
5;
