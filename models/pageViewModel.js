const mongoose = require("mongoose");

const pageViewSchema = new mongoose.Schema({
  pageId: {
    type: String,
    required: true,
  },
  ip: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "7d",
  },
});

pageViewSchema.index({ pageId: 1, ip: 1 }, { unique: true });

module.exports = mongoose.model("PageView", pageViewSchema);
