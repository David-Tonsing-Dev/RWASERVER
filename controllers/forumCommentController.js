const mongoose = require("mongoose");
const Comment = require("../models/forumCommentModel");
const CommentReaction = require("../models/forumCommentReactionModel");
const Forum = require("../models/forumModel");
const UserStat = require("../models/userStatModel");
const { io } = require("../socket/socket");
const normalizeEmoji = require("../helper/normalizeEmoji");
const hotForumTopicsService = require("../services/hotForumTopicsService");

const addComment = async (req, res) => {
  try {
    const {
      categoryId,
      subCategoryId,
      forumId,
      text,
      username,
      quotedCommentId,
    } = req.body;
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
    await comment.populate([
      { path: "userId", select: "userName" },
      { path: "quotedCommentedId", select: "text username" },
    ]);

    await Forum.findByIdAndUpdate(forumId, { $inc: { commentsCount: 1 } });

    // io.to(categoryId).emit("commentAddedForSubCategoryPage", {
    //   subCategoryId,
    //   action: "ADD",
    // });

    io.to(subCategoryId).emit("commentAdded", {
      forumId,
      action: "ADD",
    });

    io.to(forumId).emit("commentAddToForum", {
      comment,
      action: "ADD",
    });

    const { hotTopics, total } = await hotForumTopicsService({
      skip: 0,
      size: 10,
      filter: {},
    });

    io.emit("hotForumTopics", {
      page: 1,
      size: 10,
      hotTopics,
      total,
    });

    io.emit("commentCategoryPage", {
      forumId,
      action: "ADD",
    });

    await UserStat.findOneAndUpdate(
      { userId: Forum.userId },
      { $inc: { totalCommentReceived: 1 } },
      { upsert: true }
    );

    await UserStat.findOneAndUpdate(
      { userId },
      { $inc: { totalCommentGiven: 1 } },
      { upsert: true }
    );

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

    await UserStat.findOneAndUpdate(
      { userId: Forum.userId },
      { $inc: { totalCommentReceived: -1 } },
      { upsert: true }
    );

    await UserStat.findOneAndUpdate(
      { userId },
      { $inc: { totalCommentGiven: -1 } },
      { upsert: true }
    );

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
    let { forumId, commentId, emoji } = req.body;
    const userId = req.userId;

    emoji = emoji ? normalizeEmoji(emoji) : "";

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

      io.to(forumId).emit("reactToComment", {
        commentId,
        userId,
        emoji: "👍",
        action: "Added",
      });

      return res.status(201).json({ message: "Reaction added.", reaction });
    }

    if (!emoji) {
      if (existing.emoji === "👍") {
        const removedEmoji = existing.emoji;
        await CommentReaction.deleteOne({ _id: existing._id });

        await Comment.findByIdAndUpdate(commentId, {
          $inc: { [`reactions.${removedEmoji}`]: -1 },
        });

        await Comment.updateOne(
          { _id: commentId, [`reactions.${removedEmoji}`]: { $lte: 0 } },
          { $unset: { [`reactions.${removedEmoji}`]: "" } }
        );

        io.to(forumId).emit("reactToComment", {
          commentId,
          userId,
          emoji: "👍",
          action: "Remove",
        });

        return res.status(200).json({ message: "Reaction removed." });
      } else {
        const oldEmoji = existing.emoji;

        existing.emoji = "👍";
        await existing.save();

        await Comment.findByIdAndUpdate(commentId, {
          $inc: {
            [`reactions.${oldEmoji}`]: -1,
            [`reactions.${"👍"}`]: 1,
          },
        });

        await Comment.updateOne(
          { _id: commentId, [`reactions.${oldEmoji}`]: { $lte: 0 } },
          { $unset: { [`reactions.${oldEmoji}`]: "" } }
        );

        io.to(forumId).emit("reactToComment", {
          commentId,
          userId,
          emoji: "👍",
          oldEmoji: "👎",
          action: "Updated",
        });

        return res
          .status(200)
          .json({ message: "Reaction updated.", reaction: existing });
      }
    }
  } catch (error) {
    console.error("React to comment error:", error);
    res.status(500).json({ message: "Failed to react to comment." });
  }
};

const reactToCommentDislike = async (req, res) => {
  try {
    let { forumId, commentId, emoji } = req.body;
    const userId = req.userId;

    emoji = normalizeEmoji(emoji);

    if (!userId)
      return res
        .status(403)
        .json({ status: false, message: "Sign in to react" });

    const existing = await CommentReaction.findOne({ commentId, userId });

    if (!existing) {
      const newEmoji = emoji || "👎";
      const reaction = new CommentReaction({
        commentId,
        userId,
        emoji: newEmoji,
      });
      await reaction.save();

      await Comment.findByIdAndUpdate(commentId, {
        $inc: { [`reactions.${newEmoji}`]: 1 },
      });

      io.to(forumId).emit("reactToCommentDislike", {
        commentId,
        userId,
        emoji: "👎",
        action: "Added",
      });

      return res
        .status(201)
        .json({ message: "Reaction dislike added.", reaction });
    }

    if ("👎" === emoji) {
      if (existing.emoji === "👎") {
        const removedEmoji = existing.emoji;
        await CommentReaction.deleteOne({ _id: existing._id });

        await Comment.findByIdAndUpdate(commentId, {
          $inc: { [`reactions.${removedEmoji}`]: -1 },
        });

        await Comment.updateOne(
          { _id: commentId, [`reactions.${removedEmoji}`]: { $lte: 0 } },
          { $unset: { [`reactions.${removedEmoji}`]: "" } }
        );

        io.to(forumId).emit("reactToCommentDislike", {
          commentId,
          userId,
          emoji: "👎",
          action: "Remove",
        });

        return res.status(200).json({ message: "Reaction dislike removed." });
      } else {
        const oldEmoji = existing.emoji;

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

        io.to(forumId).emit("reactToCommentDislike", {
          commentId,
          userId,
          emoji: "👎",
          oldEmoji: "👍",
          action: "Updated",
        });

        return res
          .status(200)
          .json({ message: "Reaction dislike updated.", reaction: existing });
      }
    }
  } catch (error) {
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
      }).select("commentId emoji");

      comments.forEach((c) => {
        const userReaction = userReactions.find(
          (r) => r.commentId.toString() === c._id.toString()
        );

        if (userReaction) {
          c.isReact = userReaction.emoji !== "👎";
          c.isDislike = userReaction.emoji === "👎";
        } else {
          c.isReact = false;
          c.isDislike = false;
        }
      });
    } else {
      comments.forEach((c) => {
        c.isReact = false;
        c.isDislike = false;
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

const getCommentsByUserId = async (req, res) => {
  let { forumId, page, size } = req.query;
  const { userId } = req.params;
  page = page ? parseInt(page) : 1;
  size = size ? parseInt(size) : 50;
  try {
    if (forumId) {
      if (!mongoose.Types.ObjectId.isValid(forumId))
        return res
          .status(400)
          .json({ status: false.valueOf, message: "Invalid category" });
      const userComments = await Comment.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId.createFromHexString(userId),
          },
        },
        {
          $lookup: {
            from: "forums",
            localField: "forumId",
            foreignField: "_id",
            as: "forumId",
          },
        },
        {
          $unwind: "$forumId",
        },
        {
          $match: {
            "forumId._id": mongoose.Types.ObjectId.createFromHexString(forumId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userId",
          },
        },
        {
          $unwind: "$userId",
        },
        {
          $lookup: {
            from: "forumcomments",
            localField: "quotedCommentedId",
            foreignField: "_id",
            as: "quotedCommentedId",
          },
        },
        {
          $unwind: {
            path: "$quotedCommentedId",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            forumId: {
              _id: 1,
              title: 1,
            },
            text: 1,
            username: 1,
            userId: {
              profileImg: 1,
              _id: 1,
              userName: 1,
            },
            quotedCommentedId: {
              _id: 1,
              text: 1,
              username: 1,
            },
            isReported: 1,
            reportCount: 1,
            reactions: 1,
            createdAt: 1,
            updatedAt: 1,
            __v: 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * size },
        { $limit: size },
      ]);
      return res.status(200).json({ status: true, userComments });
    }
    const userComments = await Comment.find({ userId })
      .populate({
        path: "forumId",
        select: "title",
      })
      .populate({ path: "userId", select: "userName profileImg" })
      .populate({ path: "quotedCommentedId", select: "text username" })
      .sort({ createdAt: -1 })
      .skip((page - 1) * size)
      .limit(size);

    const total = await Comment.countDocuments({ userId });
    return res.status(200).json({ status: true, userComments, total });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later",
      error: err.message,
    });
  }
};

module.exports = {
  addComment,
  editComment,
  deleteComment,
  reactToComment,
  getCommentsByForumId,
  reactToCommentDislike,
  getCommentsByUserId,
};
