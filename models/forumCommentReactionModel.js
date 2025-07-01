const mongoose = require("mongoose");

const commentReactionSchema = new mongoose.Schema(
  {
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumComment",
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

module.exports = mongoose.model("ForumCommentReaction", commentReactionSchema);
