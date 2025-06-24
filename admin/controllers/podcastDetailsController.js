const PodcastDetails = require("../models/podcastDetailsModel");
const cloudinary = require("../../config/cloudinary");
const sendPushNotification = require("../../helper/sendPushNotification");

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

    // if (filter) {
    //   const podcast = await PodcastDetails.find({
    //     videoTitle: { $regex: filter, $options: "i" },
    //   })
    //     .skip((page - 1) * size)
    //     .limit(size)
    //     .sort(sortOptions);
    //   const total = await PodcastDetails.countDocuments({
    //     videoTitle: { $regex: filter, $options: "i" },
    //   });

    //   return res.status(200).json({
    //     message: "Podcast fetched successfully",
    //     data: podcast,
    //     total: total,
    //     status: "true",
    //   });
    // }
    // const podcast = await PodcastDetails.find()
    //   .populate({
    //     path: "userId",
    //     select: "username",
    //   })
    //   .skip((page - 1) * size)
    //   .limit(size)
    //   .sort(sortOptions);

    // const total = await PodcastDetails.countDocuments();
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
      message: "Podcast fetched successfully.",
      data: podcast,
      total,
      status: "true",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal server error", status: "false" });
  }
};

const addPodcast = async (req, res) => {
  try {
    const userId = req.userId;
    const { videoTitle, description, youtubeLink } = req.body;
    const role = req.role;

    if (role !== "ADMIN" && role !== "SUPERADMIN")
      return res.status(401).json({
        status: false,
        message: "Only Admin or Super admin can add podcast",
      });

    if (!videoTitle || !description || !youtubeLink || !req.file) {
      return res
        .status(400)
        .json({ status: false, message: "All fields are required" });
    }

    const uploadImg = await cloudinary.uploader.upload(req.file.path, {
      use_filename: true,
      folder: "rwa/podcast",
    });

    if (!uploadImg)
      return res
        .status(500)
        .json({ status: false, message: "Error in uploading image" });

    const newPodcast = new PodcastDetails({
      userId,
      profileImg: `https://avatar.iran.liara.run/public/boy?username=${userId}`,
      videoTitle,
      thumbnail: uploadImg.secure_url,
      description,
      youtubeLink,
    });
    await newPodcast.save();

    res.status(201).json({
      message: "Podcast created successfully",
      status: "true",
    });

    sendPushNotification({
      title: "Podcast",
      link: newPodcast.youtubeLink,
      body: newPodcast.videoTitle,
      image: newPodcast.thumbnail,
      id: newPodcast._id.toString(),
    }).catch((err) => console.error("Error sending notification:", err));
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal server error", status: "false" });
  }
};

const updatePodcast = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { videoTitle, description, youtubeLink } = req.body;
    const role = req.role;

    if (role !== "ADMIN" && role !== "SUPERADMIN")
      return res.status(401).json({
        status: false,
        message: "Only Admin or Super admin can add podcast",
      });

    const checkPodcast = await PodcastDetails.findOne({ _id: id });
    if (!checkPodcast)
      return res
        .status(400)
        .json({ status: false, message: "Podcast do not exist" });

    if (role === "ADMIN" && checkPodcast.userId.toString() !== userId) {
      return res.status(401).json({
        status: false,
        message: "You cannot update someone else's podcast",
      });
    }

    if (req.file) {
      const thumbnailImg = await cloudinary.uploader.upload(req.file.path, {
        use_filename: true,
        folder: "rwa/podcast",
      });

      if (!thumbnailImg)
        return res
          .status(500)
          .json({ status: false, message: "Error in uploading image" });

      checkPodcast.thumbnail = thumbnailImg.secure_url;
    }

    checkPodcast.videoTitle = videoTitle;
    checkPodcast.description = description;
    checkPodcast.youtubeLink = youtubeLink;

    await checkPodcast.save();

    return res
      .status(200)
      .json({ status: true, message: "Podcast updated successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal server error", status: "false" });
  }
};

// const deletePostcast = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.userId;
//     const role = req.role;

//     if (role !== "ADMIN" && role !== "SUPERADMIN")
//       return res.status(401).json({
//         status: false,
//         message: "Only Admin or Super admin can delete",
//       });

//     const checkPodcast = await PodcastDetails.findOne({ _id: id });

//     if (!checkPodcast) {
//       return res
//         .status(400)
//         .json({ status: false, message: "Podcast not found" });
//     }
//     if (role === "ADMIN") {
//       if (checkPodcast.userId !== userId) {
//         return res.status(401).json({
//           status: false,
//           message: "You cannot change someone else podcast",
//         });
//       }
//     }

//     const newCheckPodcast = checkPodcast.filter(
//       (item) => item.userId.toString() !== userId
//     );

//     checkPodcast = newCheckPodcast;
//     await checkPodcast.save();

//     return res
//       .status(200)
//       .json({ status: true, message: "Podcast deleted successfully" });
//   } catch (error) {
//     console.log(error, "delete");
//     res.status(500).json({ message: "Internal server error", status: "false" });
//   }
// };
const deletePostcast = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const role = req.role;

    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      return res.status(401).json({
        status: false,
        message: "Only Admin or Super admin can delete",
      });
    }

    const checkPodcast = await PodcastDetails.findOne({ _id: id });

    if (!checkPodcast) {
      return res
        .status(400)
        .json({ status: false, message: "Podcast not found" });
    }

    if (role === "ADMIN" && checkPodcast.userId.toString() !== userId) {
      return res.status(401).json({
        status: false,
        message: "You cannot delete someone else's podcast",
      });
    }

    await PodcastDetails.deleteOne({ _id: id });

    return res
      .status(200)
      .json({ status: true, message: "Podcast deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", status: false });
  }
};

module.exports = {
  getPodcastDetails,
  addPodcast,
  updatePodcast,
  deletePostcast,
};
