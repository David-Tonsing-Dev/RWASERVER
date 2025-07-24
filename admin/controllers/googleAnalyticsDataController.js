const { query } = require("express");
const { fetchGA4Data } = require("../../helper/fetchGA4Data");
const { fetchMobileAppGA4Data } = require("../../helper/fetchMobileAppGA4Data");
const MobileAppAnalyticsData = require("../../models/mobileAppAnalyticsDataModel");
const GoogleAnalyticsData = require("../models/googleAnalyticsDataModel");

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
