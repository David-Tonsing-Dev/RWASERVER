// const mongoose = require("mongoose");

// const AnalyticsSchema = new mongoose.Schema(
//   {
//     overview: [
//       {
//         metric: {
//           type: String,
//           required: true,
//         },
//         value: { type: String, required: true },
//       },
//     ],

//     trends: [
//       {
//         date: { type: String, required: true },
//         activeUsers: { type: String },
//         screenPageViews: { type: String },
//       },
//     ],

//     geography: [
//       {
//         country: { type: String, required: true },
//         activeUsers: { type: String, required: true },
//       },
//     ],

//     engagement: {
//       events: [
//         {
//           eventName: { type: String, required: true },
//           eventCount: { type: String, required: true },
//         },
//       ],
//       metrics: {
//         engagedSessions: { type: String },
//         averageSessionDuration: { type: String },
//         bounceRate: { type: String },
//       },
//     },

//     pages: [
//       {
//         pagePath: { type: String, required: true },
//         screenPageViews: { type: Number, required: true },
//       },
//     ],
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("websiteAnalyticsData", AnalyticsSchema);

const mongoose = require("mongoose");

const TrendSchema = new mongoose.Schema({
  date: String,
  activeUsers: Number,
  screenPageViews: Number,
});

const KeyValueSchema = new mongoose.Schema({
  key: String,
  value: Number,
});

const PageSchema = new mongoose.Schema({
  pagePath: String,
  screenPageViews: Number,
});

const AnalyticsSchema = new mongoose.Schema(
  {
    overview: [KeyValueSchema],

    trends: [TrendSchema],

    geography: [KeyValueSchema],

    engagementEvents: [KeyValueSchema],

    engagementMetrics: [KeyValueSchema],

    pages: [PageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("WebsiteAnalytics", AnalyticsSchema);
