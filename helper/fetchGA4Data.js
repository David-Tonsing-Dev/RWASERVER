const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const key = require("../service-account.json");

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: key,
});

async function fetchGA4Data({
  metrics,
  dimensions = [],
  dateRange = { startDate: "30daysAgo", endDate: "today" },
}) {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    dateRanges: [dateRange],
    metrics: metrics.map((name) => ({ name })),
    dimensions: dimensions.map((name) => ({ name })),
  });

  return response.rows.map((row) => ({
    dimensions: row.dimensionValues.map((v) => v.value),
    metrics: row.metricValues.map((v) => v.value),
  }));
}

module.exports = { fetchGA4Data };
