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
      fetchGA4Data({
        metrics: ["activeUsers"],
        dimensions: ["date"],
      }),
      fetchGA4Data({
        metrics: ["activeUsers"],
        dimensions: ["country"],
      }),
      fetchGA4Data({
        metrics: ["eventCount"],
        dimensions: ["eventName"],
      }),
      fetchGA4Data({
        metrics: ["sessions"],
        dimensions: ["source", "medium"],
      }),
    ]);

    const formatResult = (res) =>
      res.status === "fulfilled"
        ? res.value
        : { error: true, message: res.reason?.message || "Unknown error" };

    const [overview, trends, geo, devices, events, traffic] =
      results.map(formatResult);
    console.log(overview, "overview");

    return res.status(200).json({
      status: true,
      message: "Analytics data fetched successfully",
      data: {
        overview,
        trends,
        geo,
        devices,
        events,
        traffic,
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
