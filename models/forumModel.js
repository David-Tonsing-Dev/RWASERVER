const mongoose = require("mongoose");

const forumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 150,
    },
    text: {
      type: String,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumCategory",
      required: true,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    reactions: {
      type: Map,
      of: Number,
      default: {},
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Forum", forumSchema);
