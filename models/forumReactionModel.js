const mongoose = require("mongoose");

const forumReactionSchema = new mongoose.Schema(
  {
    forumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Forum",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    emoji: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ForumReaction", forumReactionSchema);
