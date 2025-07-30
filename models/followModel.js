const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

followSchema.index({ userId: 1 });
followSchema.index({ followerId: 1 });
followSchema.index({ userId: 1, followerId: 1 }, { unique: true });

module.exports = mongoose.model("Follow", followSchema);
