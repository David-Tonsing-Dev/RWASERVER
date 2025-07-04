const mongoose = require("mongoose");
const Forum = require("../models/forumModel");
const ForumReaction = require("../models/forumReactionModel");

const createForum = async (req, res) => {
  try {
    const userId = req.userId;

    const { title, text, categoryId } = req.body;

    if (!userId)
      return res
        .status(400)
        .json({ status: false, message: "Sign in to create new forum" });

    if (!title)
      return res.status(400).json({
        status: false,
        message: "Forum title is required and must be under 150 characters.",
      });

    if (!text)
      return res
        .status(400)
        .json({ status: false, message: "Forum text is required" });

    if (!categoryId)
      return res
        .status(404)
        .json({ status: false, message: "Select category for the forum" });

    const newForum = new Forum({ title, text, categoryId });

    await newForum.save();

    return res
      .status(200)
      .json({ status: true, message: "New forum created successfully" });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later",
    });
  }
};

const getAllForums = async (req, res) => {
  try {
    let { page = 1, size = 10, categoryId } = req.query;
    const userId = req.userId;

    page = parseInt(page);
    size = parseInt(size);
    const skip = (page - 1) * size;

    const filter = {};

    if (categoryId) filter.categoryId = categoryId;

    const forums = await Forum.find(filter)
      .populate({ path: "userId", select: "username" })
      .populate({ path: "categoryId", select: "name" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean();

    const total = await Forum.countDocuments(filter);

    if (userId) {
      const forumIds = forums.map((c) => c._id);

      const userReactions = await ForumReaction.find({
        forumId: { $in: forumIds },
        userId: userId,
      }).select("forumId");

      const reactedIds = new Set(
        userReactions.map((r) => r.forumId.toString())
      );

      forums.forEach((c) => {
        c.isReact = reactedIds.has(c._id.toString());
      });
    } else {
      forums.forEach((c) => {
        c.isReact = false;
      });
    }

    return res.status(200).json({ status: true, total, page, size, forums });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later",
    });
  }
};

const getForumById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid forum Id" });

    const forum = await Forum.findById(id)
      .populate({ path: "userId", select: "username" })
      .populate({ path: "categoryId", select: "name" })
      .lean();

    if (!forum)
      return res
        .status(404)
        .json({ status: false, message: "Forum not found" });

    if (userId && mongoose.TypesId.ObjectId.isValid(userId)) {
      const reaction = await ForumReaction.findOne({
        forumId: id,
        userId,
      }).select("_id");

      forum.isReact = !!reaction;
    } else {
      forum.isReact = false;
    }

    return res.status(200).json({ status: true, forum });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later",
    });
  }
};

const updateForum = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, text, categoryId } = req.body;

    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ status: false, message: "Invalid forum" });

    const forum = await Forum.findById(id);

    if (!forum)
      return res
        .status(404)
        .json({ status: false, message: "Forum not found" });

    if (forum.userId.toString() !== userId)
      return res
        .status(403)
        .json({ status: false, message: "Unauthorized to update this forum" });

    if (title) forum.title = title;
    if (text) forum.text = text;
    if (categoryId) forum.categoryId = categoryId;

    await forum.save();

    return res.status(200).json({ message: "Forum updated successfully" });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later",
    });
  }
};

const deleteForum = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ status: false, message: "Invalid forum id" });

    const forum = await Forum.findById(id);
    if (!forum)
      return res
        .status(404)
        .json({ status: false, message: "Forum not found" });

    if (forum.userId.toString() !== userId)
      return res
        .status(403)
        .json({ status: false, message: "Unauthorized to delete this forum" });

    await forum.deleteOne();
    return res.status(200).json({ status: true, message: "Forum deleted" });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later",
    });
  }
};

const getForumByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    let { categoryId, page = 1, size = 10 } = req.query;

    page = parseInt(page);
    size = parseInt(size);

    const skip = (page - 1) * size;

    if (!mongoose.Types.ObjectId.isValid(userId))
      return res
        .status(400)
        .json({ status: false, message: "Invalid user id" });

    const filter = { userId };
    if (categoryId) filter.categoryId = categoryId;

    const forums = await Forum.find(filter)
      .populate({ path: "userId", select: "username" })
      .populate({ path: "categoryId", select: "name" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean();

    const total = await Forum.countDocuments(filter);

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const forumIds = forums.map((c) => c._id);
      const reactions = await ForumReaction.find({
        forumId: { $in: forumIds },
        userId,
      }).select("forumId");

      const reactedIds = new Set(reactions.map((r) => r.forumId.toString()));

      forums.forEach((c) => {
        c.isReact = reactedIds.has(c._id.toString());
      });
    } else {
      forums.forEach((c) => {
        c.isReact = false;
      });
    }

    return res.status(200).json({
      status: true,
      total,
      page,
      size,
      forums,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later",
    });
  }
};

const reactToForum = async (req, res) => {
  try {
    const { forumId, emoji } = req.body;
    const userId = req.userId;

    if (!userId)
      return res
        .status(400)
        .json({ status: false, message: "Sign in to react" });

    const existing = await ForumReaction.findOne({ forumId, userId });

    if (existing) {
      const oldEmoji = existing.emoji;

      if (oldEmoji === emoji)
        return res
          .status(200)
          .json({ status: true, message: "Reaction unchanged" });

      existing.emoji = emoji;

      await existing.save();

      await Forum.findByIdAndUpdate(forumId, {
        $inc: {
          [`reactions.${oldEmoji}`]: -1,
          [`reactions.${emoji}`]: 1,
        },
      });

      return res.status(200).json({
        status: true,
        message: "Reaction updated",
        reaction: existing,
      });
    }

    const reaction = new ForumReaction({ forumId, userId, emoji });
    await reaction.save();

    await Forum.findByIdAndUpdate(forumId, {
      $inc: { [`reactions.${emoji}`]: 1 },
    });

    return res
      .status(201)
      .json({ status: true, message: "Reaction added", reaction });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later",
    });
  }
};

module.exports = {
  createForum,
  getAllForums,
  getForumById,
  updateForum,
  deleteForum,
  getForumByUser,
  reactToForum,
};
