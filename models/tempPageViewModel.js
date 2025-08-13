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
    userKey: { type: String, required: true },

    deviceId: { type: String, required: true },
    userAgent: { type: String },
    userId: { type: String },
  },
  { timestamps: true }
);

tempPageViewSchema.index(
  { pageId: 1, userKey: 1, deviceId: 1 },
  { unique: true }
);

module.exports = mongoose.model("TempPageView", tempPageViewSchema);
