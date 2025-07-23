const Airdrop = require("../admin/models/airdropModel");

const getUserAirdrops = async (req, res) => {
  try {
    let { page = 1, size = 10, filter, sortBy, order } = req.query;
    page = parseInt(page);
    size = parseInt(size);

    sortBy = sortBy || "createdAt";
    order =
      order?.toLowerCase() === "asc"
        ? 1
        : order?.toLowerCase() === "desc"
        ? -1
        : -1;

    const sortOptions = { [sortBy]: order };

    if (filter === "" || !filter) {
      const airdropData = await Airdrop.find()
        .skip((page - 1) * size)
        .limit(size)
        .sort(sortOptions);

      const totalAirdrop = await Airdrop.countDocuments();

      return res.status(200).json({
        airdrops: airdropData,
        total: totalAirdrop,
        status: true,
      });
    }

    const airdropData = await Airdrop.find({
      $or: [
        { tokenName: { $regex: filter, $options: "i" } },
        { tokenTicker: { $regex: filter, $options: "i" } },
      ],
    })
      .skip((page - 1) * size)
      .limit(size)
      .sort(sortOptions);

    const totalAirdrop = await Airdrop.countDocuments({
      $or: [
        { tokenName: { $regex: filter, $options: "i" } },
        { tokenTicker: { $regex: filter, $options: "i" } },
      ],
    });

    return res.status(200).json({
      status: true,
      airdrops: airdropData,
      total: totalAirdrop,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to fetch airdrops", status: false });
  }
};

const getUserAirdropsById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: false,
        message: "Airdrop ID is required.",
      });
    }

    const airdropData = await Airdrop.findOne({ _id: id });

    if (!airdropData) {
      return res.status(404).json({
        status: false,
        message: "Airdrop not found.",
      });
    }

    return res.status(200).json({
      status: true,
      airdrop: airdropData,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  getUserAirdrops,
  getUserAirdropsById,
};
