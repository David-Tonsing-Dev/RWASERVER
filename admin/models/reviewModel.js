const mongoose = require("mongoose");

const reviewEntrySchema = new mongoose.Schema(
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
  {
    timestamps: true, // This applies createdAt and updatedAt to each review entry
  }
);

const reviewSchema = new mongoose.Schema(
  {
    tokenId: {
      type: String,
      required: true,
    },
    review: [reviewEntrySchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Review", reviewSchema);
