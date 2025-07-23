const { query } = require("express");
const { fetchGA4Data } = require("../../helper/fetchGA4Data");
const { fetchMobileAppGA4Data } = require("../../helper/fetchMobileAppGA4Data");
const MobileAppAnalyticsData = require("../../models/mobileAppAnalyticsDataModel");
const GoogleAnalyticsData = require("../models/googleAnalyticsDataModel");

// ===================>perfect
// const getAllGAData = async (req, res) => {
//   try {
//     // const role = req.role;

//     // Optional Role Check
//     // if (role !== "ADMIN" && role !== "SUPERADMIN") {
//     //   return res.status(401).json({
//     //     status: false,
//     //     message: "Only Admin or Super admin can access",
//     //   });
//     // }

//     const results = await Promise.allSettled([
//       fetchGA4Data({
//         metrics: ["activeUsers", "newUsers", "sessions", "screenPageViews"],
//       }),
//       fetchGA4Data({ metrics: ["activeUsers"], dimensions: ["date"] }),
//       fetchGA4Data({ metrics: ["screenPageViews"], dimensions: ["date"] }),
//       fetchGA4Data({ metrics: ["activeUsers"], dimensions: ["country"] }),
//       fetchGA4Data({ metrics: ["eventCount"], dimensions: ["eventName"] }),
//       fetchGA4Data({
//         metrics: ["engagedSessions", "averageSessionDuration", "bounceRate"],
//       }),
//       fetchGA4Data({
//         metrics: ["screenPageViews"],
//         dimensions: ["pagePath"],
//       }),
//     ]);

//     const toRows = (section) => {
//       if (!section) return [];
//       if (Array.isArray(section)) return section;
//       if (Array.isArray(section.rows)) return section.rows;
//       if (Array.isArray(section.data?.rows)) return section.data.rows;
//       return [];
//     };

//     const formatResult = (res) =>
//       res.status === "fulfilled" ? res.value : { rows: [], error: true };

//     const [
//       rawOverview,
//       rawActiveUsersTrend,
//       rawPageViewsTrend,
//       rawGeo,
//       rawEvents,
//       rawEngagementMetrics,
//       rawPageViewsByPath,
//     ] = results.map(formatResult);

//     const formatOverview = (rows) => {
//       const metrics = rows[0]?.metrics || [];
//       const labels = ["activeUsers", "newUsers", "sessions", "screenPageViews"];
//       return labels.map((label, index) => ({
//         metric: label,
//         value: metrics[index] || "0",
//       }));
//     };

//     const formatDateMetric = (rows, metricKey) =>
//       rows.map((row) => ({
//         date: row.dimensions?.[0] || "",
//         [metricKey]: row.metrics?.[0] || "0",
//       }));

//     const formatGeo = (rows) =>
//       rows.map((row) => ({
//         country: row.dimensions?.[0] || "",
//         activeUsers: row.metrics?.[0] || "0",
//       }));

//     const formatEvents = (rows) =>
//       rows.map((row) => ({
//         eventName: row.dimensions?.[0] || "",
//         eventCount: row.metrics?.[0] || "0",
//       }));

//     const formatEngagement = (rows) => {
//       const metrics = rows[0]?.metrics || [];
//       return {
//         engagedSessions: metrics[0] || "0",
//         averageSessionDuration: metrics[1] || "0",
//         bounceRate: metrics[2] || "0",
//       };
//     };

//     const formatPageViewsByPath = (rows) =>
//       rows.map((row) => ({
//         pagePath: row.dimensions?.[0] || "",
//         screenPageViews: row.metrics?.[0] || "0",
//       }));

//     return res.status(200).json({
//       status: true,
//       analytics: {
//         overview: formatOverview(toRows(rawOverview)),
//         trends: {
//           activeUsers: formatDateMetric(
//             toRows(rawActiveUsersTrend),
//             "activeUsers"
//           ),
//           screenPageViews: formatDateMetric(
//             toRows(rawPageViewsTrend),
//             "screenPageViews"
//           ),
//         },
//         geography: formatGeo(toRows(rawGeo)),
//         engagement: {
//           events: formatEvents(toRows(rawEvents)),
//           metrics: formatEngagement(toRows(rawEngagementMetrics)),
//         },
//         pages: formatPageViewsByPath(toRows(rawPageViewsByPath)),
//       },
//     });
//   } catch (err) {
//     return res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: err.message,
//     });
//   }
// };
// ==============================>
// const getAllGAData = async (req, res) => {
//   try {
//     const role = req.role;

//     // if (role !== "ADMIN" && role !== "SUPERADMIN") {
//     //   return res.status(401).json({
//     //     status: false,
//     //     message: "Only Admin or Super admin can access",
//     //   });
//     // }

//     const results = await Promise.allSettled([
//       fetchGA4Data({
//         metrics: ["activeUsers", "newUsers", "sessions", "screenPageViews"],
//       }),
//       fetchGA4Data({ metrics: ["activeUsers"], dimensions: ["date"] }),
//       fetchGA4Data({ metrics: ["screenPageViews"], dimensions: ["date"] }),
//       fetchGA4Data({ metrics: ["activeUsers"], dimensions: ["country"] }),
//       // fetchGA4Data({
//       //   metrics: ["sessions"],
//       //   dimensions: ["deviceCategory", "browser", "platform"],
//       // }),
//       fetchGA4Data({ metrics: ["eventCount"], dimensions: ["eventName"] }),
//       fetchGA4Data({
//         metrics: ["engagedSessions", "averageSessionDuration", "bounceRate"],
//       }),
//       fetchGA4Data({
//         metrics: ["sessions"],
//         dimensions: ["source", "medium", "campaign"],
//       }),
//       fetchGA4Data({
//         metrics: ["screenPageViews"],
//         dimensions: ["pagePath"],
//       }),
//     ]);

//     const toRows = (section) => {
//       if (!section) return [];
//       if (Array.isArray(section)) return section;
//       if (Array.isArray(section.rows)) return section.rows;
//       if (Array.isArray(section.data?.rows)) return section.data.rows;
//       return [];
//     };

//     const formatResult = (res) =>
//       res.status === "fulfilled" ? res.value : { rows: [], error: true };

//     const [
//       rawOverview,
//       rawActiveUsersTrend,
//       rawPageViewsTrend,
//       rawGeo,
//       // rawDevice,
//       rawEvents,
//       rawEngagementMetrics,
//       rawTraffic,
//       rawPageViewsByPath,
//     ] = results.map(formatResult);

//     const formatOverview = (rows) => {
//       const metrics = rows[0]?.metrics || [];
//       const labels = ["activeUsers", "newUsers", "sessions", "screenPageViews"];
//       return labels.map((label, index) => ({
//         metric: label,
//         value: metrics[index] || "0",
//       }));
//     };

//     const formatDateMetric = (rows, metricKey) =>
//       rows.map((row) => ({
//         date: row.dimensions?.[0] || "",
//         [metricKey]: row.metrics?.[0] || "0",
//       }));

//     const formatGeo = (rows) =>
//       rows.map((row) => ({
//         country: row.dimensions?.[0] || "",
//         activeUsers: row.metrics?.[0] || "0",
//       }));

//     // const formatDeviceTech = (rows) =>
//     //   rows.map((row) => ({
//     //     deviceCategory: row.dimensions?.[0] || "",
//     //     browser: row.dimensions?.[1] || "",
//     //     platform: row.dimensions?.[2] || "",
//     //     sessions: row.metrics?.[0] || "0",
//     //   }));

//     const formatEvents = (rows) =>
//       rows.map((row) => ({
//         eventName: row.dimensions?.[0] || "",
//         eventCount: row.metrics?.[0] || "0",
//       }));

//     const formatEngagement = (rows) => {
//       const metrics = rows[0]?.metrics || [];
//       return {
//         engagedSessions: metrics[0] || "0",
//         averageSessionDuration: metrics[1] || "0",
//         bounceRate: metrics[2] || "0",
//       };
//     };

//     const formatTrafficSources = (rows) =>
//       rows.map((row) => ({
//         source: row.dimensions?.[0] || "",
//         medium: row.dimensions?.[1] || "",
//         campaign: row.dimensions?.[2] || "",
//         sessions: row.metrics?.[0] || "0",
//       }));
//     const formatPageViewsByPath = (rows) =>
//       rows.map((row) => ({
//         pagePath: row.dimensions?.[0] || "",
//         screenPageViews: row.metrics?.[0] || "0",
//       }));

//     return res.status(200).json({
//       status: true,
//       message: "Analytics data fetched successfully",
//       analytics: {
//         overview: formatOverview(toRows(rawOverview)),
//         trends: {
//           activeUsers: formatDateMetric(
//             toRows(rawActiveUsersTrend),
//             "activeUsers"
//           ),
//           screenPageViews: formatDateMetric(
//             toRows(rawPageViewsTrend),
//             "screenPageViews"
//           ),
//         },
//         geography: formatGeo(toRows(rawGeo)),
//         // deviceTech: formatDeviceTech(toRows(rawDevice)),
//         engagement: {
//           events: formatEvents(toRows(rawEvents)),
//           metrics: formatEngagement(toRows(rawEngagementMetrics)),
//         },
//         trafficSources: formatTrafficSources(toRows(rawTraffic)),
//         pages: formatPageViewsByPath(toRows(rawPageViewsByPath)),
//       },
//     });
//   } catch (err) {
//     return res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: err.message,
//     });
//   }
// };

// const getMobileAppAllGAData = async (req, res) => {
//   try {
//     const role = req.role;

//     // if (role !== "ADMIN" && role !== "SUPERADMIN") {
//     //   return res.status(401).json({
//     //     status: false,
//     //     message: "Only Admin or Super admin can access",
//     //   });
//     // }

//     const results = await Promise.allSettled([
//       fetchMobileAppGA4Data({
//         metrics: ["activeUsers", "newUsers", "sessions", "screenPageViews"],
//       }),

//       fetchMobileAppGA4Data({
//         metrics: ["activeUsers", "newUsers"],
//         dimensions: ["screenName"],
//         // dateRange: { startDate: "7daysAgo", endDate: "today" }
//       }),

//       // fetchMobileAppGA4Data({ metrics: ["activeUsers"], dimensions: ["date"] }),

//       fetchMobileAppGA4Data({
//         metrics: ["activeUsers"],
//         dimensions: ["country"],
//       }),
//       // fetchGA4Data({
//       //   metrics: ["sessions"],
//       //   dimensions: ["deviceCategory", "browser", "platform"],
//       // }),
//       fetchMobileAppGA4Data({
//         metrics: ["eventCount"],
//         dimensions: ["eventName"],
//       }),
//       fetchMobileAppGA4Data({
//         metrics: ["engagedSessions", "averageSessionDuration", "bounceRate"],
//       }),
//       fetchMobileAppGA4Data({
//         metrics: ["sessions"],
//         dimensions: ["source", "medium", "campaign"],
//       }),
//       fetchMobileAppGA4Data({
//         metrics: ["screenPageViews"],
//         dimensions: ["unifiedPagePathScreen"],
//         // metrics: ["screenPageViews"],
//         // dimensions: ["screenName"],
//       }),
//     ]);

//     const toRows = (section) => {
//       if (!section) return [];
//       if (Array.isArray(section)) return section;
//       if (Array.isArray(section.rows)) return section.rows;
//       if (Array.isArray(section.data?.rows)) return section.data.rows;
//       return [];
//     };

//     const formatResult = (res) =>
//       res.status === "fulfilled" ? res.value : { rows: [], error: true };

//     const [
//       rawOverview,
//       rawActiveUsersTrend,
//       rawPageViewsTrend,
//       rawGeo,
//       // rawDevice,
//       rawEvents,
//       rawEngagementMetrics,
//       rawTraffic,
//       rawPageViewsByScreenName,
//     ] = results.map(formatResult);

//     const formatOverview = (rows) => {
//       const metrics = rows[0]?.metrics || [];
//       const labels = ["activeUsers", "newUsers", "sessions", "screenPageViews"];
//       return labels.map((label, index) => ({
//         metric: label,
//         value: metrics[index] || "0",
//       }));
//     };

//     const formatDateMetric = (rows, metricKey) =>
//       rows.map((row) => ({
//         date: row.dimensions?.[0] || "",
//         [metricKey]: row.metrics?.[0] || "0",
//       }));

//     const formatGeo = (rows) =>
//       rows.map((row) => ({
//         country: row.dimensions?.[0] || "",
//         activeUsers: row.metrics?.[0] || "0",
//       }));

//     // const formatDeviceTech = (rows) =>
//     //   rows.map((row) => ({
//     //     deviceCategory: row.dimensions?.[0] || "",
//     //     browser: row.dimensions?.[1] || "",
//     //     platform: row.dimensions?.[2] || "",
//     //     sessions: row.metrics?.[0] || "0",
//     //   }));

//     const formatEvents = (rows) =>
//       rows.map((row) => ({
//         eventName: row.dimensions?.[0] || "",
//         eventCount: row.metrics?.[0] || "0",
//       }));

//     const formatEngagement = (rows) => {
//       const metrics = rows[0]?.metrics || [];
//       return {
//         engagedSessions: metrics[0] || "0",
//         averageSessionDuration: metrics[1] || "0",
//         bounceRate: metrics[2] || "0",
//       };
//     };

//     const formatTrafficSources = (rows) =>
//       rows.map((row) => ({
//         source: row.dimensions?.[0] || "",
//         medium: row.dimensions?.[1] || "",
//         campaign: row.dimensions?.[2] || "",
//         sessions: row.metrics?.[0] || "0",
//       }));
//     // const formatPageViewsByPath = (rows) =>
//     //   rows.map((row) => ({
//     //     pagePath: row.dimensions?.[0] || "",
//     //     screenPageViews: row.metrics?.[0] || "0",
//     //   }));

//     const formatPageViewsByPageTitle = (rows) =>
//       rows.map((row) => ({
//         pageTitle: row.dimensions?.[0] || "",
//         screenPageViews: row.metrics?.[0] || "0",
//       }));

//     return res.status(200).json({
//       status: true,
//       message: " Mobile app analytics data fetched successfully",
//       analytics: {
//         pageViews: formatPageViewsByPageTitle(toRows(rawPageViewsByScreenName)),
//       },
//     });
//   } catch (err) {
//     return res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: err.message,
//     });
//   }
// };

// const getMobileAppAllGAData = async (req, res) => {
//   try {
//     const role = req.role;

//     // if (role !== "ADMIN" && role !== "SUPERADMIN") {
//     //   return res.status(401).json({
//     //     status: false,
//     //     message: "Only Admin or Super admin can access",
//     //   });
//     // }

//     const results = await Promise.allSettled([
//       fetchMobileAppGA4Data({
//         metrics: ["screenPageViews"],
//         dimensions: ["screenName"],
//         // metrics: ["screenPageViews"],
//         // dimensions: ["screenName"],
//       }),
//     ]);

//     const toRows = (section) => {
//       if (!section) return [];
//       if (Array.isArray(section)) return section;
//       if (Array.isArray(section.rows)) return section.rows;
//       if (Array.isArray(section.data?.rows)) return section.data.rows;
//       return [];
//     };

//     const formatResult = (res) =>
//       res.status === "fulfilled" ? res.value : { rows: [], error: true };

//     const [rawPageViewsByScreenName] = results.map(formatResult);

//     console.log("🔍 rawPageViewsByPath:", results);
//     // console.log(
//     //   "🔍 rawPageViewsByScreenName:",
//     //   JSON.stringify(rawPageViewsByScreenName, null, 2)
//     // );
//     const formatOverview = (rows) => {
//       const metrics = rows[0]?.metrics || [];
//       const labels = ["activeUsers", "newUsers", "sessions", "screenPageViews"];
//       return labels.map((label, index) => ({
//         metric: label,
//         value: metrics[index] || "0",
//       }));
//     };

//     const formatDateMetric = (rows, metricKey) =>
//       rows.map((row) => ({
//         date: row.dimensions?.[0] || "",
//         [metricKey]: row.metrics?.[0] || "0",
//       }));

//     // const formatDeviceTech = (rows) =>
//     //   rows.map((row) => ({
//     //     deviceCategory: row.dimensions?.[0] || "",
//     //     browser: row.dimensions?.[1] || "",
//     //     platform: row.dimensions?.[2] || "",
//     //     sessions: row.metrics?.[0] || "0",
//     //   }));

//     const formatPageViewsByScreenName = (rows) =>
//       rows.map((row) => ({
//         screenName: row.dimensions?.[0] || "",
//         screenPageViews: row.metrics?.[0] || "0",
//       }));

//     return res.status(200).json({
//       status: true,
//       message: " Mobile app analytics data fetched successfully",
//       analytics: {
//         pages: formatPageViewsByScreenName(toRows(rawPageViewsByScreenName)),
//       },
//     });
//   } catch (err) {
//     return res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: err.message,
//     });
//   }
// };
// ========================================================================>
// const getMobileAppAllGAData = async (req, res) => {
//   try {
//     const role = req.role;

//     // Optional Role check
//     // if (role !== "ADMIN" && role !== "SUPERADMIN") {
//     //   return res.status(401).json({
//     //     status: false,
//     //     message: "Only Admin or Superadmin can access this route",
//     //   });
//     // }

//     // Wrapped fetch with label and safe error handling
//     const fetchWrapped = async (label, config) => {
//       try {
//         const data = await fetchMobileAppGA4Data(config);
//         return { status: "fulfilled", label, value: data };
//       } catch (err) {
//         return { status: "rejected", label, reason: err.message };
//       }
//     };

//     const results = await Promise.all([
//       fetchWrapped("Page Title Views", {
//         metrics: ["screenPageViews"],
//         dimensions: ["unifiedPagePathScreen"],
//       }),
//     ]);

//     results.forEach((res) => {
//       if (res.status === "fulfilled") {
//         console.log(`✅ ${res.label} query succeeded.`);
//       } else {
//         console.error(`❌ ${res.label} failed: ${res.reason}`);
//       }
//     });

//     const pageTitleViews =
//       results.find((r) => r.label === "Page Title Views")?.value || [];

//     const formatData = (rows, labelKey, metricKey) =>
//       rows.map((row) => ({
//         [labelKey]: row.dimensions?.[0] || "Unknown",
//         [metricKey]: row.metrics?.[0] || "0",
//       }));

//     return res.status(200).json({
//       status: true,
//       message: "Mobile app analytics data fetched successfully",
//       analytics: {
//         pageViews: formatData(pageTitleViews, "pageTitle", "screenPageViews"),
//       },
//     });
//   } catch (err) {
//     console.error("🔥 GA4 Fetch Error:", err);
//     return res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: err.message,
//     });
//   }
// };
// ===========================================================================>
// const getMobileAppAllGAData = async (req, res) => {
//   try {
//     const data = await fetchMobileAppGA4Data({
//       metrics: ["screenPageViews"],
//       dimensions: ["unifiedScreenName"],
//     });

//     const formatData = (rows, labelKey, metricKey) =>
//       rows.map((row) => ({
//         [labelKey]: row.dimensions?.[0] || "Unknown",
//         [metricKey]: row.metrics?.[0] || "0",
//       }));

//     return res.status(200).json({
//       status: true,
//       analytics: {
//         pageViews: formatData(data, "pageTitle", "screenPageViews"),
//       },
//     });
//   } catch (err) {
//     return res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: err.message,
//     });
//   }
// };

// const storeGA4AnalyticsData = async () => {
//   try {
//     const data = await fetchMobileAppGA4Data({
//       metrics: ["screenPageViews"],
//       dimensions: ["unifiedScreenName"],
//     });

//     for (const row of data) {
//       const pagePath = row.dimensions?.[0] || "Unknown";
//       const screenPageViews = parseInt(row.metrics?.[0] || "0", 10);

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

//     console.log("✅ Mobile app GA4 data saved to DB");
//   } catch (error) {
//     console.error("❌ Failed to store GA4 analytics data:", error.message);
//   }
// };

// const storeAllGAData = async (req, res) => {
//   try {
//     const results = await Promise.allSettled([
//       fetchGA4Data({
//         metrics: ["activeUsers", "newUsers", "sessions", "screenPageViews"],
//       }),
//       fetchGA4Data({ metrics: ["activeUsers"], dimensions: ["date"] }),
//       fetchGA4Data({ metrics: ["screenPageViews"], dimensions: ["date"] }),
//       fetchGA4Data({ metrics: ["activeUsers"], dimensions: ["country"] }),
//       fetchGA4Data({ metrics: ["eventCount"], dimensions: ["eventName"] }),
//       fetchGA4Data({
//         metrics: ["engagedSessions", "averageSessionDuration", "bounceRate"],
//       }),
//       fetchGA4Data({ metrics: ["screenPageViews"], dimensions: ["pagePath"] }),
//     ]);

//     const toRows = (section) => (Array.isArray(section) ? section : []);

//     const formatResult = (res) => (res.status === "fulfilled" ? res.value : []);

//     const [
//       rawOverview,
//       rawActiveUsersTrend,
//       rawPageViewsTrend,
//       rawGeo,
//       rawEvents,
//       rawEngagementMetrics,
//       rawPageViewsByPath,
//     ] = results.map(formatResult);

//     const formatOverview = (rows) => {
//       const metrics = rows[0]?.metrics || [];
//       const labels = ["activeUsers", "newUsers", "sessions", "screenPageViews"];
//       return labels.map((label, index) => ({
//         metric: label,
//         value: metrics[index] || "0",
//       }));
//     };

//     const formatDateMetric = (rows, metricKey) =>
//       rows.map((row) => ({
//         date: row.dimensions?.[0] || "",
//         [metricKey]: row.metrics?.[0] || "0",
//       }));

//     const formatGeo = (rows) =>
//       rows.map((row) => ({
//         country: row.dimensions?.[0] || "",
//         activeUsers: row.metrics?.[0] || "0",
//       }));

//     const formatEvents = (rows) =>
//       rows.map((row) => ({
//         eventName: row.dimensions?.[0] || "",
//         eventCount: row.metrics?.[0] || "0",
//       }));

//     const formatEngagement = (rows) => {
//       const metrics = rows[0]?.metrics || [];
//       return {
//         engagedSessions: metrics[0] || "0",
//         averageSessionDuration: metrics[1] || "0",
//         bounceRate: metrics[2] || "0",
//       };
//     };

//     const formatPageViewsByPath = (rows) =>
//       rows.map((row) => ({
//         pagePath: row.dimensions?.[0] || "",
//         screenPageViews: row.metrics?.[0] || "0",
//       }));

//     const finalData = {
//       overview: formatOverview(toRows(rawOverview)),
//       trends: {
//         activeUsers: formatDateMetric(
//           toRows(rawActiveUsersTrend),
//           "activeUsers"
//         ),
//         screenPageViews: formatDateMetric(
//           toRows(rawPageViewsTrend),
//           "screenPageViews"
//         ),
//       },
//       geography: formatGeo(toRows(rawGeo)),
//       engagement: {
//         events: formatEvents(toRows(rawEvents)),
//         metrics: formatEngagement(toRows(rawEngagementMetrics)),
//       },
//       pages: [],
//     };
//     let existingDoc = await GoogleAnalyticsData.findOne();

//     if (existingDoc) {
//       await GoogleAnalyticsData.findOneAndUpdate(
//         { _id: existingDoc._id },
//         {
//           $set: {
//             overview: finalData.overview,
//             trends: finalData.trends,
//             geography: finalData.geography,
//             engagement: finalData.engagement,
//           },
//         },
//         { new: true }
//       );
//     } else {
//       existingDoc = await GoogleAnalyticsData.create({
//         ...finalData,
//         pages: [],
//       });
//     }

//     const pageViewsData = formatPageViewsByPath(toRows(rawPageViewsByPath));

//     for (const response of pageViewsData) {
//       const { pagePath, screenPageViews } = response;

//       const updateResult = await GoogleAnalyticsData.findOneAndUpdate(
//         { "pages.pagePath": pagePath },
//         { $set: { "pages.$.screenPageViews": screenPageViews } },
//         { new: true }
//       );

//       if (!updateResult) {
//         const doc = await GoogleAnalyticsData.findOne();
//         if (doc) {
//           doc.pages.push({ pagePath, screenPageViews });
//           await doc.save();
//         }
//       }
//     }
//     console.log("Analytics data stored successfully.");
//   } catch (err) {
//     console.error("Failed to store GA4 analytics data:", err.message);
//   }
// };

// ================>perfect prfect===============>
// const storeAllGAData = async (req, res) => {
//   try {
//     const results = await Promise.allSettled([
//       fetchGA4Data({
//         metrics: ["activeUsers", "newUsers", "sessions", "screenPageViews"],
//       }),
//       fetchGA4Data({ metrics: ["activeUsers"], dimensions: ["date"] }),
//       fetchGA4Data({ metrics: ["screenPageViews"], dimensions: ["date"] }),
//       fetchGA4Data({ metrics: ["activeUsers"], dimensions: ["country"] }),
//       fetchGA4Data({ metrics: ["eventCount"], dimensions: ["eventName"] }),
//       fetchGA4Data({
//         metrics: ["engagedSessions", "averageSessionDuration", "bounceRate"],
//       }),
//       fetchGA4Data({ metrics: ["screenPageViews"], dimensions: ["pagePath"] }),
//     ]);

//     const toRows = (section) => (Array.isArray(section) ? section : []);
//     const formatResult = (res) => (res.status === "fulfilled" ? res.value : []);

//     const [
//       rawOverview,
//       rawActiveUsersTrend,
//       rawPageViewsTrend,
//       rawGeo,
//       rawEvents,
//       rawEngagementMetrics,
//       rawPageViewsByPath,
//     ] = results.map(formatResult);

//     const formatOverview = (rows) => {
//       const metrics = rows[0]?.metrics || [];
//       const labels = ["activeUsers", "newUsers", "sessions", "screenPageViews"];
//       return labels.map((label, index) => ({
//         metric: label,
//         value: metrics[index] || "0",
//       }));
//     };

//     const formatDateMetric = (rows, metricKey) =>
//       rows.map((row) => ({
//         date: row.dimensions?.[0] || "",
//         [metricKey]: row.metrics?.[0] || "0",
//       }));

//     const formatGeo = (rows) =>
//       rows.map((row) => ({
//         country: row.dimensions?.[0] || "",
//         activeUsers: row.metrics?.[0] || "0",
//       }));

//     const formatEvents = (rows) =>
//       rows.map((row) => ({
//         eventName: row.dimensions?.[0] || "",
//         eventCount: row.metrics?.[0] || "0",
//       }));

//     const formatEngagement = (rows) => {
//       const metrics = rows[0]?.metrics || [];
//       return {
//         engagedSessions: metrics[0] || "0",
//         averageSessionDuration: metrics[1] || "0",
//         bounceRate: metrics[2] || "0",
//       };
//     };

//     const formatPageViewsByPath = (rows) =>
//       rows.map((row) => ({
//         pagePath: row.dimensions?.[0] || "",
//         screenPageViews: row.metrics?.[0] || "0",
//       }));

//     // 🔁 Merge activeUsers and screenPageViews trends
//     const activeUsers = formatDateMetric(
//       toRows(rawActiveUsersTrend),
//       "activeUsers"
//     );
//     const screenPageViews = formatDateMetric(
//       toRows(rawPageViewsTrend),
//       "screenPageViews"
//     );

//     const trendsMap = new Map();
//     activeUsers.forEach(({ date, activeUsers }) => {
//       trendsMap.set(date, { date, activeUsers });
//     });

//     screenPageViews.forEach(({ date, screenPageViews }) => {
//       if (trendsMap.has(date)) {
//         trendsMap.get(date).screenPageViews = screenPageViews;
//       } else {
//         trendsMap.set(date, { date, screenPageViews });
//       }
//     });

//     const trends = Array.from(trendsMap.values());

//     // 🧾 Final object
//     const finalData = {
//       overview: formatOverview(toRows(rawOverview)),
//       trends,
//       geography: formatGeo(toRows(rawGeo)),
//       engagement: {
//         events: formatEvents(toRows(rawEvents)),
//         metrics: formatEngagement(toRows(rawEngagementMetrics)),
//       },
//       pages: [],
//     };

//     // 🔄 Update or Create Document
//     let existingDoc = await GoogleAnalyticsData.findOne();

//     if (existingDoc) {
//       await GoogleAnalyticsData.findOneAndUpdate(
//         { _id: existingDoc._id },
//         {
//           $set: {
//             overview: finalData.overview,
//             trends: finalData.trends,
//             geography: finalData.geography,
//             engagement: finalData.engagement,
//           },
//         },
//         { new: true }
//       );
//     } else {
//       existingDoc = await GoogleAnalyticsData.create({
//         ...finalData,
//         pages: [],
//       });
//     }

//     const pageViewsData = formatPageViewsByPath(toRows(rawPageViewsByPath));

//     for (const response of pageViewsData) {
//       const { pagePath, screenPageViews } = response;

//       const updateResult = await GoogleAnalyticsData.findOneAndUpdate(
//         { "pages.pagePath": pagePath },
//         { $set: { "pages.$.screenPageViews": screenPageViews } },
//         { new: true }
//       );

//       if (!updateResult) {
//         const doc = await GoogleAnalyticsData.findOne();
//         if (doc) {
//           doc.pages.push({ pagePath, screenPageViews });
//           await doc.save();
//         }
//       }
//     }

//     console.log("GA4 analytics data stored successfully.");
//   } catch (err) {
//     console.error("Failed to store GA4 analytics data:", err.message);
//   }
// };

// this is perfect for easy to query
// const storeAllGAData = async (req, res) => {
//   try {
//     const [
//       overviewRes,
//       trendsActive,
//       trendsPageViews,
//       geoRes,
//       eventsRes,
//       engagementMetricsRes,
//       pagesRes,
//     ] = await Promise.all([
//       fetchGA4Data({
//         metrics: ["activeUsers", "newUsers", "sessions", "screenPageViews"],
//       }),
//       fetchGA4Data({ metrics: ["activeUsers"], dimensions: ["date"] }),
//       fetchGA4Data({ metrics: ["screenPageViews"], dimensions: ["date"] }),
//       fetchGA4Data({ metrics: ["activeUsers"], dimensions: ["country"] }),
//       fetchGA4Data({ metrics: ["eventCount"], dimensions: ["eventName"] }),
//       fetchGA4Data({
//         metrics: ["engagedSessions", "averageSessionDuration", "bounceRate"],
//       }),
//       fetchGA4Data({ metrics: ["screenPageViews"], dimensions: ["pagePath"] }),
//     ]);

//     const overview = {
//       activeUsers: overviewRes[0]?.metrics?.[0] || "0",
//       newUsers: overviewRes[0]?.metrics?.[1] || "0",
//       sessions: overviewRes[0]?.metrics?.[2] || "0",
//       screenPageViews: overviewRes[0]?.metrics?.[3] || "0",
//     };

//     const trendsMap = {};
//     for (const row of trendsActive) {
//       const date = row.dimensions[0];
//       trendsMap[date] = { date, activeUsers: row.metrics[0] };
//     }
//     for (const row of trendsPageViews) {
//       const date = row.dimensions[0];
//       if (!trendsMap[date]) trendsMap[date] = { date };
//       trendsMap[date].screenPageViews = row.metrics[0];
//     }
//     const trends = Object.values(trendsMap);

//     const geography = {};
//     geoRes.forEach((row) => {
//       geography[row.dimensions[0]] = row.metrics[0];
//     });

//     const engagementEvents = {};
//     eventsRes.forEach((row) => {
//       engagementEvents[row.dimensions[0]] = row.metrics[0];
//     });

//     const engagementMetrics = {
//       engagedSessions: engagementMetricsRes[0]?.metrics?.[0] || "0",
//       averageSessionDuration: engagementMetricsRes[0]?.metrics?.[1] || "0",
//       bounceRate: engagementMetricsRes[0]?.metrics?.[2] || "0",
//     };

//     const pages = {};
//     pagesRes.forEach((row) => {
//       pages[row.dimensions[0]] = parseInt(row.metrics[0]);
//     });

//     await GoogleAnalyticsData.findOneAndUpdate(
//       {},
//       {
//         $set: {
//           overview,
//           trends,
//           geography,
//           engagementEvents,
//           engagementMetrics,
//           pages,
//         },
//       },
//       { upsert: true, new: true }
//     );

//     console.log("GA4 analytics data stored successfully.");
//   } catch (err) {
//     console.error("Error storing GA data:", err.message);
//   }
// };

const storeAllGAData = async (req, res) => {
  try {
    const [
      overviewRes,
      trendsActive,
      trendsPageViews,
      geoRes,
      eventsRes,
      engagementMetricsRes,
      pagesRes,
    ] = await Promise.all([
      fetchGA4Data({
        metrics: ["activeUsers", "newUsers", "sessions", "screenPageViews"],
      }),
      fetchGA4Data({ metrics: ["activeUsers"], dimensions: ["date"] }),
      fetchGA4Data({ metrics: ["screenPageViews"], dimensions: ["date"] }),
      fetchGA4Data({ metrics: ["activeUsers"], dimensions: ["country"] }),
      fetchGA4Data({ metrics: ["eventCount"], dimensions: ["eventName"] }),
      fetchGA4Data({
        metrics: ["engagedSessions", "averageSessionDuration", "bounceRate"],
      }),
      fetchGA4Data({ metrics: ["screenPageViews"], dimensions: ["pagePath"] }),
    ]);

    const overview = [
      { key: "activeUsers", value: overviewRes[0]?.metrics?.[0] || "0" },
      { key: "newUsers", value: overviewRes[0]?.metrics?.[1] || "0" },
      { key: "sessions", value: overviewRes[0]?.metrics?.[2] || "0" },
      { key: "screenPageViews", value: overviewRes[0]?.metrics?.[3] || "0" },
    ];

    const trendsMap = {};
    for (const row of trendsActive) {
      const date = row.dimensions[0];
      trendsMap[date] = { date, activeUsers: row.metrics[0] };
    }
    for (const row of trendsPageViews) {
      const date = row.dimensions[0];
      if (!trendsMap[date]) trendsMap[date] = { date };
      trendsMap[date].screenPageViews = row.metrics[0];
    }
    const trends = Object.values(trendsMap);

    const geography = geoRes.map((row) => ({
      key: row.dimensions[0],
      value: row.metrics[0],
    }));

    const engagementEvents = eventsRes.map((row) => ({
      key: row.dimensions[0],
      value: row.metrics[0],
    }));

    const engagementMetrics = [
      {
        key: "engagedSessions",
        value: engagementMetricsRes[0]?.metrics?.[0] || "0",
      },
      {
        key: "averageSessionDuration",
        value: engagementMetricsRes[0]?.metrics?.[1] || "0",
      },
      {
        key: "bounceRate",
        value: engagementMetricsRes[0]?.metrics?.[2] || "0",
      },
    ];

    const pages = pagesRes.map((row) => ({
      pagePath: row.dimensions[0],
      screenPageViews: parseInt(row.metrics[0]),
    }));

    await GoogleAnalyticsData.findOneAndUpdate(
      {},
      {
        $set: {
          overview,
          trends,
          geography,
          engagementEvents,
          engagementMetrics,
          pages,
        },
      },
      { upsert: true, new: true }
    );

    console.log("GA website data stored successfully.");
  } catch (err) {
    console.error("Error storing GA data:", err.message);
  }
};

const getAllGAData = async (req, res) => {
  try {
    const data = await GoogleAnalyticsData.findOne();

    if (!data)
      return res
        .status(404)
        .json({ status: false, message: "No analytics data found" });

    return res.status(200).json({ status: true, analytics: data });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Error fetching analytics",
      error: err.message,
    });
  }
};

const getMobileAppAllGAData = async (req, res) => {
  try {
    const latest = await MobileAppAnalyticsData.findOne();

    return res.status(200).json({
      status: true,
      analytics: latest || { pages: [] },
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports = { getAllGAData, getMobileAppAllGAData, storeAllGAData };
