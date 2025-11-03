const mongoose = require("mongoose");

const tempPageViewSchema = new mongoose.Schema(
  {
    pageId: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    deviceId: { type: String, required: true },
    userId: { type: String },
    isCounted: { type: Boolean, default: false },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: "10d",
    },
  },
  { timestamps: true }
);

tempPageViewSchema.index({ pageId: 1, deviceId: 1 }, { unique: true });

module.exports = mongoose.model("TempPageView", tempPageViewSchema);
