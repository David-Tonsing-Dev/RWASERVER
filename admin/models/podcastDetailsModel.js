const mongoose = require("mongoose");

const podcastDetailsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
    },
    profileImg: {
      type: String,
      default: null,
    },
    videoTitle: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    youtubeLink: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PodcastDetails", podcastDetailsSchema);
