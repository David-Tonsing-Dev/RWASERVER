// const { fetchGA4Data } = require("../../helper/fetchGA4Data");

// const getAllGAData = async (req, res) => {
//   try {
//     const role = req.role;

//     if (role !== "ADMIN" && role !== "SUPERADMIN") {
//       return res.status(401).json({
//         status: false,
//         message: "Only Admin or Super admin can access",
//       });
//     }

//     const results = await Promise.allSettled([
//       fetchGA4Data({
//         metrics: ["activeUsers", "newUsers", "sessions", "screenPageViews"],
//       }),
//       fetchGA4Data({
//         metrics: ["activeUsers"],
//         dimensions: ["date"],
//       }),
//       fetchGA4Data({
//         metrics: ["activeUsers"],
//         dimensions: ["country"],
//       }),
//       fetchGA4Data({
//         metrics: ["eventCount"],
//         dimensions: ["eventName"],
//       }),
//       fetchGA4Data({
//         metrics: ["sessions"],
//         dimensions: ["source", "medium"],
//       }),
//     ]);

//     const formatResult = (res) =>
//       res.status === "fulfilled"
//         ? res.value
//         : { error: true, message: res.reason?.message || "Unknown error" };

//     const [overview, trends, geo, devices, events, traffic] =
//       results.map(formatResult);

//     return res.status(200).json({
//       status: true,
//       message: "Analytics data fetched successfully",
//       data: {
//         overview,
//         trends,
//         geo,
//         devices,
//         events,
//         traffic,
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

// module.exports = { getAllGAData };
// ==============>
// const { fetchGA4Data } = require("../../helper/fetchGA4Data");

// const getAllGAData = async (req, res) => {
//   try {
//     const role = req.role;

//     if (role !== "ADMIN" && role !== "SUPERADMIN") {
//       return res.status(401).json({
//         status: false,
//         message: "Only Admin or Super admin can access",
//       });
//     }

//     /* ---------- 1)  Pull GA4 reports in parallel ---------- */
//     const results = await Promise.allSettled([
//       fetchGA4Data({
//         metrics: ["activeUsers", "newUsers", "sessions", "screenPageViews"],
//       }),
//       fetchGA4Data({ metrics: ["activeUsers"], dimensions: ["date"] }),
//       fetchGA4Data({ metrics: ["activeUsers"], dimensions: ["country"] }),
//       fetchGA4Data({ metrics: ["sessions"], dimensions: ["source", "medium"] }),
//     ]);

//     /* ---------- 2)  Normalise "rows" no matter the wrapper ---------- */
//     const toRows = (section) => {
//       if (!section) return [];
//       if (Array.isArray(section)) return section; // top-level array
//       if (Array.isArray(section.rows)) return section.rows; // { rows:[...] }
//       if (Array.isArray(section.data?.rows)) return section.data.rows; // { data:{rows:[...]} }
//       return [];
//     };

//     const formatResult = (p) =>
//       p.status === "fulfilled" ? p.value : { rows: [] };

//     const [rawOverview, rawDates, rawCountries, rawTraffic] =
//       results.map(formatResult);

//     /* ---------- 3)  Formatters ---------- */
//     const formatOverview = (rows) => {
//       const metrics = rows[0]?.metrics || [];
//       return {
//         activeUsers: metrics[0] || "0",
//         newUsers: metrics[1] || "0",
//         sessions: metrics[2] || "0",
//         screenPageViews: metrics[3] || "0",
//       };
//     };

//     const formatActiveUsersByCountry = (rows) =>
//       rows.map((r) => ({
//         country: r.dimensions?.[0] || "",
//         activeUsers: r.metrics?.[0] || "0",
//       }));

//     const formatSessionsBySourceMedium = (rows) =>
//       rows.map((r) => ({
//         source: r.dimensions?.[0] || "",
//         medium: r.dimensions?.[1] || "",
//         sessions: r.metrics?.[0] || "0",
//       }));

//     /* ---------- 4)  Build response ---------- */
//     return res.status(200).json({
//       status: true,
//       message: "Analytics data fetched successfully",
//       data: {
//         overview: formatOverview(toRows(rawOverview)),
//         activeUsersByCountry: formatActiveUsersByCountry(toRows(rawCountries)),
//         sessionsBySourceMedium: formatSessionsBySourceMedium(
//           toRows(rawTraffic)
//         ),
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

// module.exports = { getAllGAData };
// =============>
// const { fetchGA4Data } = require("../../helper/fetchGA4Data");

// const getAllGAData = async (req, res) => {
//   try {
//     const role = req.role;

//     if (role !== "ADMIN" && role !== "SUPERADMIN") {
//       return res.status(401).json({
//         status: false,
//         message: "Only Admin or Super admin can access",
//       });
//     }

//     // Fetch all data sections
//     const results = await Promise.allSettled([
//       // 📊 Overview
//       fetchGA4Data({
//         metrics: ["activeUsers", "newUsers", "sessions", "screenPageViews"],
//       }),

//       // 📈 Trends - activeUsers by date
//       // fetchGA4Data({ metrics: ["activeUsers"], dimensions: ["date"] }),

//       // 📈 Trends - screenPageViews by date
//       fetchGA4Data({ metrics: ["screenPageViews"], dimensions: ["date"] }),

//       // 🌍 Geography
//       fetchGA4Data({ metrics: ["activeUsers"], dimensions: ["country"] }),

//       // 📱 Device/Tech
//       // fetchGA4Data({
//       //   metrics: ["sessions"],
//       //   dimensions: ["deviceCategory", "browser", "platform"],
//       // }),

//       // 💬 Engagement - events
//       fetchGA4Data({ metrics: ["eventCount"], dimensions: ["eventName"] }),

//       // 💬 Engagement - metrics
//       fetchGA4Data({
//         metrics: ["engagedSessions", "averageSessionDuration", "bounceRate"],
//       }),

//       // 🚀 Traffic Sources
//       fetchGA4Data({
//         metrics: ["sessions"],
//         dimensions: ["source", "medium", "campaign"],
//       }),
//     ]);

//     // Safely extract rows
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
//       // rawActiveUsersTrend,
//       // rawPageViewsTrend,
//       rawGeo,
//       // rawDevice,
//       rawEvents,
//       rawEngagementMetrics,
//       rawTraffic,
//     ] = results.map(formatResult);

//     // Formatters
//     const formatOverview = (rows) => {
//       const metrics = rows[0]?.metrics || [];
//       return {
//         activeUsers: metrics[0] || "0",
//         newUsers: metrics[1] || "0",
//         sessions: metrics[2] || "0",
//         screenPageViews: metrics[3] || "0",
//       };
//     };

//     // const formatDateMetric = (rows, metricKey) =>
//     //   rows.map((row) => ({
//     //     date: row.dimensions?.[0] || "",
//     //     [metricKey]: row.metrics?.[0] || "0",
//     //   }));

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

//     // Final structured output
//     return res.status(200).json({
//       status: true,
//       message: "Analytics data fetched successfully",
//       data: {
//         overview: formatOverview(toRows(rawOverview)),
//         // trends: {
//         //   activeUsers: formatDateMetric(
//         //     toRows(rawActiveUsersTrend),
//         //     "activeUsers"
//         //   ),
//         //   screenPageViews: formatDateMetric(
//         //     toRows(rawPageViewsTrend),
//         //     "screenPageViews"
//         //   ),
//         // },
//         geography: formatGeo(toRows(rawGeo)),
//         // deviceTech: formatDeviceTech(toRows(rawDevice)),
//         engagement: {
//           events: formatEvents(toRows(rawEvents)),
//           metrics: formatEngagement(toRows(rawEngagementMetrics)),
//         },
//         trafficSources: formatTrafficSources(toRows(rawTraffic)),
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

// module.exports = { getAllGAData };

// ===============>
const { fetchGA4Data } = require("../../helper/fetchGA4Data");

const getAllGAData = async (req, res) => {
  try {
    const role = req.role;

    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      return res.status(401).json({
        status: false,
        message: "Only Admin or Super admin can access",
      });
    }

    const results = await Promise.allSettled([
      fetchGA4Data({
        metrics: ["activeUsers", "newUsers", "sessions", "screenPageViews"],
      }),
      fetchGA4Data({ metrics: ["activeUsers"], dimensions: ["date"] }),
      fetchGA4Data({ metrics: ["screenPageViews"], dimensions: ["date"] }),
      fetchGA4Data({ metrics: ["activeUsers"], dimensions: ["country"] }),
      // fetchGA4Data({
      //   metrics: ["sessions"],
      //   dimensions: ["deviceCategory", "browser", "platform"],
      // }),
      fetchGA4Data({ metrics: ["eventCount"], dimensions: ["eventName"] }),
      fetchGA4Data({
        metrics: ["engagedSessions", "averageSessionDuration", "bounceRate"],
      }),
      fetchGA4Data({
        metrics: ["sessions"],
        dimensions: ["source", "medium", "campaign"],
      }),
    ]);

    const toRows = (section) => {
      if (!section) return [];
      if (Array.isArray(section)) return section;
      if (Array.isArray(section.rows)) return section.rows;
      if (Array.isArray(section.data?.rows)) return section.data.rows;
      return [];
    };

    const formatResult = (res) =>
      res.status === "fulfilled" ? res.value : { rows: [], error: true };

    const [
      rawOverview,
      rawActiveUsersTrend,
      rawPageViewsTrend,
      rawGeo,
      // rawDevice,
      rawEvents,
      rawEngagementMetrics,
      rawTraffic,
    ] = results.map(formatResult);

    const formatOverview = (rows) => {
      const metrics = rows[0]?.metrics || [];
      const labels = ["activeUsers", "newUsers", "sessions", "screenPageViews"];
      return labels.map((label, index) => ({
        metric: label,
        value: metrics[index] || "0",
      }));
    };

    const formatDateMetric = (rows, metricKey) =>
      rows.map((row) => ({
        date: row.dimensions?.[0] || "",
        [metricKey]: row.metrics?.[0] || "0",
      }));

    const formatGeo = (rows) =>
      rows.map((row) => ({
        country: row.dimensions?.[0] || "",
        activeUsers: row.metrics?.[0] || "0",
      }));

    // const formatDeviceTech = (rows) =>
    //   rows.map((row) => ({
    //     deviceCategory: row.dimensions?.[0] || "",
    //     browser: row.dimensions?.[1] || "",
    //     platform: row.dimensions?.[2] || "",
    //     sessions: row.metrics?.[0] || "0",
    //   }));

    const formatEvents = (rows) =>
      rows.map((row) => ({
        eventName: row.dimensions?.[0] || "",
        eventCount: row.metrics?.[0] || "0",
      }));

    const formatEngagement = (rows) => {
      const metrics = rows[0]?.metrics || [];
      return {
        engagedSessions: metrics[0] || "0",
        averageSessionDuration: metrics[1] || "0",
        bounceRate: metrics[2] || "0",
      };
    };

    const formatTrafficSources = (rows) =>
      rows.map((row) => ({
        source: row.dimensions?.[0] || "",
        medium: row.dimensions?.[1] || "",
        campaign: row.dimensions?.[2] || "",
        sessions: row.metrics?.[0] || "0",
      }));

    return res.status(200).json({
      status: true,
      message: "Analytics data fetched successfully",
      analytics: {
        overview: formatOverview(toRows(rawOverview)),
        trends: {
          activeUsers: formatDateMetric(
            toRows(rawActiveUsersTrend),
            "activeUsers"
          ),
          screenPageViews: formatDateMetric(
            toRows(rawPageViewsTrend),
            "screenPageViews"
          ),
        },
        geography: formatGeo(toRows(rawGeo)),
        // deviceTech: formatDeviceTech(toRows(rawDevice)),
        engagement: {
          events: formatEvents(toRows(rawEvents)),
          metrics: formatEngagement(toRows(rawEngagementMetrics)),
        },
        trafficSources: formatTrafficSources(toRows(rawTraffic)),
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports = { getAllGAData };
