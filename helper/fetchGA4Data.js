const { BetaAnalyticsDataClient } = require("@google-analytics/data");
// const key = require("../service-account.json");

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;

const key = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY,
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URL,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER,
  client_x509_cert_url: process.env.CLIENT_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN,
};

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
