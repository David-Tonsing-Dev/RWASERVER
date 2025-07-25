const PodcastDetails = require("../admin/models/podcastDetailsModel");

const getPodcastDetails = async (req, res) => {
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

    const query = filter?.trim()
      ? { videoTitle: { $regex: filter, $options: "i" } }
      : {};

    const podcast = await PodcastDetails.find(query)
      .populate({
        path: "userId",
        select: "username",
      })
      .skip((page - 1) * size)
      .limit(size)
      .sort(sortOptions);

    const total = await PodcastDetails.countDocuments(query);

    return res.status(200).json({
      status: "true",
      data: podcast,
      total,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal server error", status: "false" });
  }
};

module.exports = {
  getPodcastDetails,
};
