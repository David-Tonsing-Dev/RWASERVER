const mongoose = require("mongoose");

const pageCountSchema = new mongoose.Schema(
  {
    pageId: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

pageCountSchema.index({ pageId: 1 }, { unique: true });

module.exports = mongoose.model("PageCount", pageCountSchema);
