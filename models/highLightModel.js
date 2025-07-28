const mongoose = require("mongoose");

const highLightSchema = new mongoose.Schema(
  {
    volume_24h: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("HighLight", highLightSchema);
