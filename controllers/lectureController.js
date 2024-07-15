const video = require("../constant/video.json");

const getAllLecture = async (req, res) => {
  try {
    const userId = req.userId;

    if (!video)
      return res
        .status(400)
        .json({ status: false, message: "Could not fetch lecture!" });

    if (!userId)
      return res
        .status(400)
        .json({ status: 400, message: "Unauthorized User!" });

    return res.status(200).json({ status: true, lecture: video });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      error: err.message,
    });
  }
};

const updateProgressVideo = async (req, res) => {
  const { id } = req.params;
  const { progress } = req.body;

  try {
    if (!id || id === "undefined")
      return res
        .status(400)
        .json({ status: false, message: "Cannot detech video file id!" });

    if (!progress)
      return res
        .status(400)
        .json({ status: false, message: "Progress is required!" });

    const updatedData = video.map((item) => {
      if (item.id === id) return { ...item, progress: progress };
      return { ...item };
    });

    return res.status(200).json({ status: true, lecture: updatedData });
  } catch (err) {
    return res.status.json({ status: false, message: "Something went wrong!" });
  }
};

module.exports = {
  getAllLecture,
  updateProgressVideo,
};
