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
      console.log("No data found from GA.");
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
