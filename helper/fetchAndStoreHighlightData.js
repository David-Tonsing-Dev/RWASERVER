const axios = require("axios");
const HighLight = require("../models/highLightModel");

const apiHighLight = "https://pro-api.coingecko.com/api/v3/coins/categories";

const fetchHighLightData = async () => {
  try {
    const resp = await axios.get(apiHighLight, {
      headers: {
        "x-cg-pro-api-key": process.env.COINGECKO_KEY,
      },
    });

    const highLightData = await resp.data;

    const highlightItem = highLightData.find(
      (item) => item.id === "real-world-assets-rwa"
    );

    const todayVolume = highlightItem.volume_24h;

    await HighLight.deleteMany();
    await HighLight.create({ volume_24h: todayVolume });
    console.log("Highlight data fetched and stored successfully");
  } catch (err) {
    console.error("Error fetching or storing highlight data:", err.message);
  }
};

module.exports = fetchHighLightData;
