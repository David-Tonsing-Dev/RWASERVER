const { fetchTreasuryChart } = require("../helper/fetchTreasuryChart");

const getTreasuryChart = async (req, res) => {
  try {
    const data = await fetchTreasuryChart();
    return res.status(200).json({
      status: true,
      portfolioHistorical: data,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = getTreasuryChart;
