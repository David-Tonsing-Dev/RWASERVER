const mongoose = require("mongoose");

const MobileAppAnalyticsSchema = new mongoose.Schema(
  {
    pages: [
      {
        pagePath: { type: String },
        screenPageViews: { type: Number },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MobileAppAnalytics", MobileAppAnalyticsSchema);
