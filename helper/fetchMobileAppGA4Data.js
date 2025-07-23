// const { BetaAnalyticsDataClient } = require("@google-analytics/data");

// const GA4_PROPERTY_ID = process.env.MOBILE_APP_GA4_PROPERTY_ID;
// const analyticsDataClient = new BetaAnalyticsDataClient({
//   credentials: JSON.parse(process.env.MOBILE_APP_SETUP),
// });

// async function fetchMobileAppGA4Data({
//   metrics,
//   dimensions = [],
//   dateRange = { startDate: "30daysAgo", endDate: "today" },
// }) {
//   const [response] = await analyticsDataClient.runReport({
//     property: `properties/${GA4_PROPERTY_ID}`,
//     dateRanges: [dateRange],
//     metrics: metrics.map((name) => ({ name })),
//     dimensions: dimensions.map((name) => ({ name })),
//   });

//   return response.rows.map((row) => ({
//     dimensions: row.dimensionValues.map((v) => v.value),
//     metrics: row.metricValues.map((v) => v.value),
//   }));
// }

// module.exports = { fetchMobileAppGA4Data };

// ====================>

// const { BetaAnalyticsDataClient } = require("@google-analytics/data");

// const GA4_PROPERTY_ID = process.env.MOBILE_APP_GA4_PROPERTY_ID;

// const analyticsDataClient = new BetaAnalyticsDataClient({
//   credentials: JSON.parse(process.env.MOBILE_APP_SETUP),
// });

// async function fetchMobileAppGA4Data({
//   metrics,
//   dimensions = [],
//   dateRange = { startDate: "30daysAgo", endDate: "today" },
// }) {
//   const [response] = await analyticsDataClient.runReport({
//     property: `properties/${GA4_PROPERTY_ID}`,
//     dateRanges: [dateRange],
//     metrics: metrics.map((name) => ({ name })),
//     dimensions: dimensions.map((name) => ({ name })),
//   });

//   return response.rows.map((row) => ({
//     dimensions: row.dimensionValues.map((v) => v.value),
//     metrics: row.metricValues.map((v) => v.value),
//   }));
// }

// module.exports = { fetchMobileAppGA4Data };
// ===============>

// ========================>perfect
// const { BetaAnalyticsDataClient } = require("@google-analytics/data");

// const GA4_PROPERTY_ID = process.env.MOBILE_APP_GA4_PROPERTY_ID;

// const analyticsDataClient = new BetaAnalyticsDataClient({
//   credentials: JSON.parse(process.env.MOBILE_APP_SETUP),
// });

// async function fetchMobileAppGA4Data({
//   metrics,
//   dimensions = [],
//   dateRange = { startDate: "30daysAgo", endDate: "today" },
// }) {
//   const [response] = await analyticsDataClient.runReport({
//     property: `properties/${GA4_PROPERTY_ID}`,
//     dateRanges: [dateRange],
//     metrics: metrics.map((name) => ({ name })),
//     dimensions: dimensions.map((name) => ({ name })),
//   });

//   return response.rows.map((row) => ({
//     dimensions: row.dimensionValues.map((v) => v.value),
//     metrics: row.metricValues.map((v) => v.value),
//   }));
// }
// ================perfect==>
// const { BetaAnalyticsDataClient } = require("@google-analytics/data");
// const MobileAppAnalyticsData = require("../models/mobileAppAnalyticsDataModel");

// const GA4_PROPERTY_ID = process.env.MOBILE_APP_GA4_PROPERTY_ID;

// const analyticsDataClient = new BetaAnalyticsDataClient({
//   credentials: JSON.parse(process.env.MOBILE_APP_SETUP),
// });

// const fetchMobileAppGA4Data = async () => {
//   try {
//     const [response] = await analyticsDataClient.runReport({
//       property: `properties/${GA4_PROPERTY_ID}`,
//       dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
//       metrics: [{ name: "screenPageViews" }],
//       dimensions: [{ name: "unifiedScreenName" }],
//     });
//     console.log(response, "response");

//     const data = response.rows.map((row) => ({
//       pagePath: row.dimensionValues?.[0]?.value || "Unknown",
//       screenPageViews: parseInt(row.metricValues?.[0]?.value || "0", 10),
//     }));

//     for (const response of data) {
//       const { pagePath, screenPageViews } = response;

//       const updateResult = await MobileAppAnalyticsData.findOneAndUpdate(
//         { "pages.pagePath": pagePath },
//         { $set: { "pages.$.screenPageViews": screenPageViews } },
//         { new: true }
//       );

//       if (!updateResult) {
//         const existingDoc = await MobileAppAnalyticsData.findOne();

//         if (existingDoc) {
//           existingDoc.pages.push({ pagePath, screenPageViews });
//           await existingDoc.save();
//         }
//       }
//     }

//     console.log("GA4 Mobile App Analytics data stored successfully.");
//   } catch (error) {
//     console.error("Failed to store Mobile GA4 analytics data:", error.message);
//   }
// };

// const { BetaAnalyticsDataClient } = require("@google-analytics/data");
// const MobileAppAnalyticsData = require("../models/mobileAppAnalyticsDataModel");

// const GA4_PROPERTY_ID = process.env.MOBILE_APP_GA4_PROPERTY_ID;

// const analyticsDataClient = new BetaAnalyticsDataClient({
//   credentials: JSON.parse(process.env.MOBILE_APP_SETUP),
// });

// // Try querying data with different fallback dimensions
// const fetchMobileAppGA4Data = async () => {
//   try {
//     const dimensionsToTry = ["unifiedScreenName", "pagePath", "pageTitle"];
//     let data = [];

//     for (const dimension of dimensionsToTry) {
//       const [response] = await analyticsDataClient.runReport({
//         property: `properties/${GA4_PROPERTY_ID}`,
//         dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
//         metrics: [{ name: "screenPageViews" }],
//         dimensions: [{ name: dimension }],
//       });

//       if (response?.rows?.length > 0) {
//         data = response.rows.map((row) => ({
//           pagePath: row.dimensionValues?.[0]?.value || "Unknown",
//           screenPageViews: parseInt(row.metricValues?.[0]?.value || "0", 10),
//         }));
//         console.log(`✅ Found data using dimension: ${dimension}`);
//         break;
//       } else {
//         console.warn(`⚠️ No data using dimension: ${dimension}`);
//       }
//     }

//     if (data.length === 0) {
//       console.warn("❌ No analytics data found from GA4.");
//       return;
//     }

//     for (const { pagePath, screenPageViews } of data) {
//       const updateResult = await MobileAppAnalyticsData.findOneAndUpdate(
//         { "pages.pagePath": pagePath },
//         { $set: { "pages.$.screenPageViews": screenPageViews } },
//         { new: true }
//       );

//       if (!updateResult) {
//         const existingDoc = await MobileAppAnalyticsData.findOne();
//         if (existingDoc) {
//           existingDoc.pages.push({ pagePath, screenPageViews });
//           await existingDoc.save();
//           console.log(`➕ Added new page: ${pagePath}`);
//         } else {
//           // If no document exists, create one
//           await MobileAppAnalyticsData.create({
//             pages: [{ pagePath, screenPageViews }],
//           });
//           console.log("🆕 Created new document with first page");
//         }
//       } else {
//         console.log(`✅ Updated page: ${pagePath}`);
//       }
//     }

//     console.log("✅ GA4 Mobile App Analytics data stored successfully.");
//   } catch (error) {
//     console.error(
//       "❌ Failed to store Mobile GA4 analytics data:",
//       error.message
//     );
//   }
// };

// module.exports = { fetchMobileAppGA4Data };

const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const MobileAppAnalyticsData = require("../models/mobileAppAnalyticsDataModel");

const GA4_PROPERTY_ID = process.env.MOBILE_APP_GA4_PROPERTY_ID;

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: JSON.parse(process.env.MOBILE_APP_SETUP),
});

const fetchMobileAppGA4Data = async () => {
  try {
    let analyticsData = [];

    const [report] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      metrics: [{ name: "screenPageViews" }],
      dimensions: [{ name: "unifiedScreenName" }],
    });

    if (report?.rows?.length) {
      analyticsData = report.rows.map((row) => ({
        pagePath: row.dimensionValues?.[0]?.value || "Unknown",
        screenPageViews: parseInt(row.metricValues?.[0]?.value || "0", 10),
      }));
    } else {
      console.log("No data found from GA4.");
      return;
    }

    for (const response of analyticsData) {
      const { pagePath, screenPageViews } = response;

      const updateResult = await MobileAppAnalyticsData.findOneAndUpdate(
        { "pages.pagePath": pagePath },
        { $set: { "pages.$.screenPageViews": screenPageViews } },
        { new: true }
      );

      if (!updateResult) {
        const existingDoc = await MobileAppAnalyticsData.findOne();

        if (existingDoc) {
          existingDoc.pages.push({ pagePath, screenPageViews });
          await existingDoc.save();
        } else {
          await MobileAppAnalyticsData.create({
            pages: [{ pagePath, screenPageViews }],
          });
        }
      }
    }

    console.log("GA mobile app data stored successfully.");
  } catch (err) {
    console.error("Error storing GA mobile app data:", err.message);
  }
};

module.exports = { fetchMobileAppGA4Data };
