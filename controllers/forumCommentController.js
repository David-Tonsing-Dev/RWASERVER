const Comment = require("../models/forumCommentModel");
const CommentReaction = require("../models/forumCommentReactionModel");
const Forum = require("../models/forumModel");

const addComment = async (req, res) => {
  try {
    const { forumId, text, username, quotedCommentId } = req.body;
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

    const existing = await CommentReaction.findOne({ commentId, userId });

    if (existing) {
      const oldEmoji = existing.emoji;

      if (oldEmoji === emoji)
        return res
          .status(200)
          .json({ status: true, message: "Reaction unchange" });

      existing.emoji = emoji;
      await existing.save();

      await Comment.findByIdAndUpdate(commentId, {
        $ince: {
          [`reactions.${oldEmoji}`]: -1,
          [`reactions.${emoji}`]: 1,
        },
      });

      return res
        .status(200)
        .json({ status: true, message: "Reaction updated" });
    }

    const reaction = new CommentReaction({ commentId, userId, emoji });
    await reaction.save();

    await Comment.findByIdAndUpdate(commentId, {
      $ince: { [`reactions.${emoji}`]: 1 },
    });

    return res.status(200).json({ status: true, message: "Reaction added" });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later",
    });
  }
};

const getCommentsByForumId = async (req, res) => {
  try {
    const { forumId } = req.params;
    let { page = 1, size = 10 } = req.query;
    page = parseInt(page);
    size = parseInt(size);

    const skip = (page - 1) * size;

    const comments = await Comment.find({ forumId })
      .populate("quotedCommentedId", "text username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size);

    const total = await Comment.countDocuments({ forumId });

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
