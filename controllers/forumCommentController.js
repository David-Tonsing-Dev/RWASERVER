const Comment = require("../models/forumCommentModel");
const CommentReaction = require("../models/forumCommentReactionModel");
const Forum = require("../models/forumModel");
const { io } = require("../socket/socket");

const addComment = async (req, res) => {
  try {
    const { categoryId, forumId, text, username, quotedCommentId } = req.body;
    const userId = req.userId;

    if (!userId)
      return res
        .status(403)
        .json({ status: false, message: "Sign in to comment" });

    const comment = new Comment({
      forumId,
      text,
      username,
      userId,
      quotedCommentedId: quotedCommentId || null,
    });

    await comment.save();
    await Forum.findByIdAndUpdate(forumId, { $inc: { commentsCount: 1 } });

    io.to(categoryId).emit("commentAdded", {
      forumId,
      action: "ADD",
    });
    return res.status(201).json({ status: true, message: "Comment added" });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later",
    });
  }
};

const editComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.userId;
    const comment = await Comment.findById(id);
    if (!comment)
      return res
        .status(404)
        .json({ status: false, message: "Comment not found" });

    if (comment.userId.toString() !== userId)
      return res
        .status(403)
        .json({ status: false, message: "Not allowed to edit this comment." });

    comment.text = text;

    await comment.save();
    return res.status(200).json({ status: true, message: "Comment updated" });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later",
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const comment = await Comment.findById(id);
    if (!comment)
      return res
        .status(404)
        .json({ status: false, message: "Comment not found" });

    if (comment.userId.toString() !== userId)
      return res
        .status(403)
        .json({ status: false, message: "NOt allowed to delete this comment" });

    await CommentReaction.deleteMany({ commentId: id });
    await comment.deleteOne();
    await Forum.findByIdAndUpdate(comment.forumId, {
      $inc: { commentsCount: -1 },
    });

    return res.status(200).json({ status: true, message: "Comment deleted" });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later",
    });
  }
};

const reactToComment = async (req, res) => {
  try {
    const { commentId, emoji } = req.body;
    const userId = req.userId;

    if (!userId)
      return res
        .status(403)
        .json({ status: false, message: "Sign in to react" });

    const existing = await CommentReaction.findOne({ commentId, userId });

    if (!existing) {
      const newEmoji = emoji || "👍";
      const reaction = new CommentReaction({
        commentId,
        userId,
        emoji: newEmoji,
      });
      await reaction.save();

      await Comment.findByIdAndUpdate(commentId, {
        $inc: { [`reactions.${newEmoji}`]: 1 },
      });

      return res.status(201).json({ message: "Reaction added.", reaction });
    }

    if (!emoji) {
      const removedEmoji = existing.emoji;
      await CommentReaction.deleteOne({ _id: existing._id });

      await Comment.findByIdAndUpdate(commentId, {
        $inc: { [`reactions.${removedEmoji}`]: -1 },
      });

      await Comment.updateOne(
        { _id: commentId, [`reactions.${removedEmoji}`]: { $lte: 0 } },
        { $unset: { [`reactions.${removedEmoji}`]: "" } }
      );

      return res.status(200).json({ message: "Reaction removed." });
    }

    const oldEmoji = existing.emoji;

    if (oldEmoji === emoji) {
      return res
        .status(200)
        .json({ message: "Reaction unchanged.", reaction: existing });
    }

    existing.emoji = emoji;
    await existing.save();

    await Comment.findByIdAndUpdate(commentId, {
      $inc: {
        [`reactions.${oldEmoji}`]: -1,
        [`reactions.${emoji}`]: 1,
      },
    });

    await Comment.updateOne(
      { _id: commentId, [`reactions.${oldEmoji}`]: { $lte: 0 } },
      { $unset: { [`reactions.${oldEmoji}`]: "" } }
    );

    return res
      .status(200)
      .json({ message: "Reaction updated.", reaction: existing });
  } catch (error) {
    console.error("React to comment error:", error);
    res.status(500).json({ message: "Failed to react to comment." });
  }
};

const getCommentsByForumId = async (req, res) => {
  try {
    const { forumId } = req.params;
    let { page = 1, size = 10 } = req.query;
    const userId = req.userId;

    page = parseInt(page);
    size = parseInt(size);
    const skip = (page - 1) * size;

    const comments = await Comment.find({ forumId })
      .populate("quotedCommentedId", "text username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean();

    const total = await Comment.countDocuments({ forumId });

    if (userId) {
      const commentIds = comments.map((c) => c._id);

      const userReactions = await CommentReaction.find({
        commentId: { $in: commentIds },
        userId: userId,
      }).select("commentId");

      const reactedIds = new Set(
        userReactions.map((r) => r.commentId.toString())
      );

      comments.forEach((c) => {
        c.isReact = reactedIds.has(c._id.toString());
      });
    } else {
      comments.forEach((c) => {
        c.isReact = false;
      });
    }

    return res.status(200).json({
      status: true,
      total,
      page,
      size,
      comments,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later",
    });
  }
};

module.exports = {
  addComment,
  editComment,
  deleteComment,
  reactToComment,
  getCommentsByForumId,
};
