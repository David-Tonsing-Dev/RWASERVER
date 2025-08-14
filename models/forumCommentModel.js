const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    forumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Forum",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    quotedCommentedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumComment",
      default: null,
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    reactions: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ForumComment", commentSchema);
