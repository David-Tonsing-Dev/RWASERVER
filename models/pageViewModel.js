const mongoose = require("mongoose");

const pageViewSchema = new mongoose.Schema(
  {
    pageId: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    // userKey: { type: String, required: true },

    deviceId: { type: String, required: true },
    // userAgent: { type: String },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: "7d",
    },
  },
  { timestamps: true }
);

// pageViewSchema.index({ pageId: 1, userKey: 1, deviceId: 1 }, { unique: true });
pageViewSchema.index({ pageId: 1, deviceId: 1 }, { unique: true });

module.exports = mongoose.model("PageView", pageViewSchema);
