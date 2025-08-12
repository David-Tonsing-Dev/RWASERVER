const mongoose = require("mongoose");
const { QuillDeltaToHtmlConverter } = require("quill-delta-to-html");
const { io } = require("../socket/socket");
const ForumSubCategory = require("../admin/models/forumSubCategoryModel");
const Forum = require("../models/forumModel");
const ForumReaction = require("../models/forumReactionModel");
const UserStat = require("../models/userStatModel");
const normalizeEmoji = require("../helper/normalizeEmoji");
const hotForumTopicsService = require("../services/hotForumTopicsService");
const { getClientIP } = require("../helper/getClientIP");

const createForum = async (req, res) => {
  try {
    /// Any changes here change, change for mobile too below controllers (createForumForMobile)
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
        .json({ status: false, message: "Select sub-category for the forum" });

    const checkSubCategory = await ForumSubCategory.findOne({
      _id: categoryId,
    }).populate({ path: "categoryId", select: "name" });

    if (!checkSubCategory)
      return res
        .status(404)
        .json({ status: false, message: "Sub-category not exist" });

    const newForum = new Forum({ title, text, categoryId, userId });

    await newForum.save();

    await newForum.populate({ path: "userId", select: "userName" });

    io.to(categoryId).emit("forumAdded", newForum);

    io.emit("forumCategoryPage", {
      categoryId: checkSubCategory.categoryId._id,
      subCategoryId: categoryId,
      newForum,
      action: "ADD",
    });

    await UserStat.findOneAndUpdate(
      { userId },
      { $inc: { totalThreadPosted: 1 } },
      { upsert: true }
    );

    return res.status(200).json({
      status: true,
      message: "New forum created successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later",
    });
  }
};

const createForumForMobile = async (req, res) => {
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

    const checkSubCategory = await ForumSubCategory.findOne({
      _id: categoryId,
    }).populate({ path: "categoryId", select: "name" });

    if (!checkSubCategory)
      return res
        .status(404)
        .json({ status: false, message: "Sub-category not exist" });

    const converterText = new QuillDeltaToHtmlConverter(text, {});
    const convertedText = converterText.convert();

    const newForum = new Forum({
      title,
      text: convertedText,
      categoryId,
      userId,
    });

    await newForum.save();

    await newForum.populate({ path: "userId", select: "userName" });

    io.to(categoryId).emit("forumAdded", newForum);

    io.emit("forumCategoryPage", {
      categoryId: checkSubCategory.categoryId._id,
      subCategoryId: categoryId,
      newForum,
      action: "ADD",
    });

    await UserStat.findOneAndUpdate(
      { userId },
      { $inc: { totalThreadPosted: 1 } },
      { upsert: true }
    );

    return res.status(200).json({
      status: true,
      message: "New forum created successfully",
    });
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
      .populate({ path: "userId", select: "userName" })
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
      }).select("forumId emoji");

      forums.forEach((c) => {
        const userReaction = userReactions.find(
          (r) => r.forumId.toString() === c._id.toString()
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
      forums.forEach((c) => {
        c.isReact = false;
        c.isDislike = false;
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
      .populate({ path: "userId", select: "userName" })
      .populate({ path: "categoryId", select: "name" })
      .lean();

    await getClientIP(req, id, userId);

    if (!forum)
      return res
        .status(404)
        .json({ status: false, message: "Forum not found" });
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const reaction = await ForumReaction.findOne({
        forumId: id,
        userId,
      }).select("_id emoji");

      if (reaction) {
        forum.isReact = reaction.emoji === "👍" ?? false;
        forum.isDislike = reaction.emoji === "👎" ?? false;
      } else {
        forum.isReact = false;
        forum.isDislike = false;
      }
    } else {
      forum.isReact = false;
      forum.isDislike = false;
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

const updateForumForMobile = async (req, res) => {
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
    if (text) {
      const converterText = new QuillDeltaToHtmlConverter(text, {});
      const convertedText = converterText.convert();
      forum.text = convertedText;
    }
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

    await UserStat.findOneAndUpdate(
      { userId },
      { $inc: { totalThreadPosted: -1 } },
      { upsert: true }
    );

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
      .populate({ path: "userId", select: "userName" })
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
    let { categoryId, subCategoryId, forumId, emoji } = req.body;
    const userId = req.userId;
    emoji = emoji ? normalizeEmoji(emoji) : "";

    if (!userId)
      return res
        .status(400)
        .json({ status: false, message: "Sign in to react" });

    const existing = await ForumReaction.findOne({ forumId, userId });

    if (!existing) {
      const newEmoji = emoji || "👍";
      const reaction = new ForumReaction({ forumId, userId, emoji: newEmoji });
      await reaction.save();

      await Forum.findByIdAndUpdate(forumId, {
        $inc: { [`reactions.${newEmoji}`]: 1 },
      });

      const socketResponse = {
        subCategoryId,
        forumId,
        userId,
        emoji: "👍",
        action: "Added",
      };

      // io.to(categoryId).emit("reactToForum", socketResponse);

      io.to(subCategoryId).emit("reactToForum", socketResponse);

      io.to(forumId).emit("reactToForumDetail", socketResponse);
      io.to(forumId).emit("reactToForum", socketResponse); // For mobile

      await UserStat.findOneAndUpdate(
        { userId: Forum.userId },
        { $inc: { totalLikeReceived: 1 } },
        { upsert: true }
      );

      return res
        .status(201)
        .json({ status: true, message: "Reaction added.", reaction });
    }

    if (!emoji) {
      if (existing.emoji === "👍") {
        const removedEmoji = existing.emoji;
        await ForumReaction.deleteOne({ _id: existing._id });

        await Forum.findByIdAndUpdate(forumId, {
          $inc: { [`reactions.${removedEmoji}`]: -1 },
        });

        await Forum.updateOne(
          { _id: forumId, [`reactions.${removedEmoji}`]: { $lte: 0 } },
          { $unset: { [`reactions.${removedEmoji}`]: "" } }
        );

        const socketResponse = {
          subCategoryId,
          forumId,
          userId,
          emoji: "👍",
          action: "Remove",
        };

        // io.to(categoryId).emit(
        //   "reactToForumForSubCategoryPage",
        //   socketResponse
        // );

        io.to(subCategoryId).emit("reactToForum", socketResponse);

        io.to(forumId).emit("reactToForumDetail", socketResponse);

        io.to(forumId).emit("reactToForum", socketResponse); // for mobile

        await UserStat.findOneAndUpdate(
          { userId: Forum.userId },
          { $inc: { totalLikeReceived: -1 } },
          { upsert: true }
        );

        return res
          .status(200)
          .json({ status: true, message: "Reaction removed." });
      } else {
        const oldEmoji = existing.emoji;

        existing.emoji = "👍";
        await existing.save();

        await Forum.findByIdAndUpdate(forumId, {
          $inc: {
            [`reactions.${oldEmoji}`]: -1,
            [`reactions.${"👍"}`]: 1,
          },
        });

        await Forum.updateOne(
          { _id: forumId, [`reactions.${oldEmoji}`]: { $lte: 0 } },
          { $unset: { [`reactions.${oldEmoji}`]: "" } }
        );

        const socketResponse = {
          subCategoryId,
          forumId,
          userId,
          emoji: "👍",
          oldEmoji: "👎",
          action: "Updated",
        };

        // io.to(categoryId).emit(
        //   "reactToForumForSubCategoryPage",
        //   socketResponse
        // );

        io.to(subCategoryId).emit("reactToForum", socketResponse);

        io.to(forumId).emit("reactToForumDetail", socketResponse);

        io.to(forumId).emit("reactToForum", socketResponse); // for mobile

        return res.status(201).json({
          status: true,
          message: "Reaction updated.",
          reaction: existing,
        });
      }
    }
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later",
    });
  }
};

const reactToForumDislike = async (req, res) => {
  try {
    let { categoryId, subCategoryId, forumId, emoji } = req.body;
    const userId = req.userId;
    emoji = normalizeEmoji(emoji);

    if (!userId)
      return res
        .status(400)
        .json({ status: false, message: "Sign in to react" });

    const existing = await ForumReaction.findOne({ forumId, userId });

    if (!existing) {
      let newEmoji = emoji || "👎";
      const reaction = new ForumReaction({ forumId, userId, emoji: newEmoji });
      await reaction.save();

      await Forum.findByIdAndUpdate(forumId, {
        $inc: { [`reactions.${newEmoji}`]: 1 },
      });

      const socketResponse = {
        subCategoryId,
        forumId,
        userId,
        emoji: "👎",
        action: "Added",
      };

      // io.to(categoryId).emit(
      //   "reactToForumDislikeForSubCategoryPage",
      //   socketResponse
      // );

      io.to(subCategoryId).emit("reactToForumDislike", socketResponse);

      io.to(forumId).emit("reactToForumDislikeDetail", socketResponse);

      io.to(forumId).emit("reactToForumDislike", socketResponse); // For mobile

      await UserStat.findOneAndUpdate(
        { userId: Forum.userId },
        { $inc: { totalLikeReceived: 1 } },
        { upsert: true }
      );

      return res
        .status(201)
        .json({ status: true, message: "Reaction dislike added.", reaction });
    }

    if ("👎" === emoji) {
      if (existing.emoji === "👎") {
        const removedEmoji = existing.emoji;
        await ForumReaction.deleteOne({ _id: existing._id });

        await Forum.findByIdAndUpdate(forumId, {
          $inc: { [`reactions.${removedEmoji}`]: -1 },
        });

        await Forum.updateOne(
          { _id: forumId, [`reactions.${removedEmoji}`]: { $lte: 0 } },
          { $unset: { [`reactions.${removedEmoji}`]: "" } }
        );

        const socketResponse = {
          subCategoryId,
          forumId,
          userId,
          emoji: "👎",
          action: "Remove",
        };

        // io.to(categoryId).emit(
        //   "reactToForumDislikeForSubCategoryPage",
        //   socketResponse
        // );

        io.to(subCategoryId).emit("reactToForumDislike", socketResponse);

        io.to(forumId).emit("reactToForumDislikeDetail", socketResponse);

        io.to(forumId).emit("reactToForumDislike", socketResponse); // For mobile

        await UserStat.findOneAndUpdate(
          { userId: Forum.userId },
          { $inc: { totalLikeReceived: -1 } },
          { upsert: true }
        );

        return res
          .status(200)
          .json({ status: true, message: "Reaction dislike removed." });
      } else {
        const oldEmoji = existing.emoji;

        existing.emoji = normalizeEmoji(emoji);
        await existing.save();

        await Forum.findByIdAndUpdate(forumId, {
          $inc: {
            [`reactions.${oldEmoji}`]: -1,
            [`reactions.${emoji}`]: 1,
          },
        });

        await Forum.updateOne(
          { _id: forumId, [`reactions.${oldEmoji}`]: { $lte: 0 } },
          { $unset: { [`reactions.${oldEmoji}`]: "" } }
        );

        const socketResponse = {
          subCategoryId,
          forumId,
          userId,
          emoji,
          oldEmoji: "👍",
          action: "Updated",
        };

        // io.to(categoryId).emit(
        //   "reactToForumDislikeForSubCategoryPage",
        //   socketResponse
        // );

        io.to(subCategoryId).emit("reactToForumDislike", socketResponse);

        io.to(forumId).emit("reactToForumDislikeDetail", socketResponse);

        io.to(forumId).emit("reactToForumDislike", socketResponse); // For mobile

        return res.status(201).json({
          status: true,
          message: "Reaction dislike updated.",
          reaction: existing,
        });
      }
    }
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later",
    });
  }
};

const getHotTopic = async (req, res) => {
  try {
    let { page, size, categoryId } = req.query;

    page = page ? parseInt(page) : 1;
    size = size ? parseInt(size) : 10;
    const skip = (page - 1) * size;

    const filter = {};

    if (categoryId) filter.categoryId = categoryId;

    const { hotTopics, total } = await hotForumTopicsService({
      skip,
      size,
      filter,
    });

    return res.status(200).json({ status: true, total, page, size, hotTopics });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later",
      error: err.message,
    });
  }
};

const getForumLikeByUser = async (req, res) => {
  try {
    let { page, size, subCategoryId } = req.query;
    let { userId } = req.params;

    page = page ? parseInt(page) : 1;
    size = size ? parseInt(size) : 50;

    const likedForum = await ForumReaction.find({
      userId,
      emoji: "👍",
    })
      .populate({
        path: "forumId",
        select: "title",
        populate: { path: "userId", select: "userName profileImg" },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * size)
      .limit(size);

    const total = await ForumReaction.countDocuments({
      userId,
      emoji: "👍",
    });

    return res.status(200).json({ status: true, likedForum, total });
  } catch (err) {
    console.log("ERROR::", err.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later",
    });
  }
};

module.exports = {
  createForum,
  createForumForMobile,
  getAllForums,
  getHotTopic,
  getForumById,
  updateForum,
  updateForumForMobile,
  deleteForum,
  getForumByUser,
  reactToForum,
  reactToForumDislike,
  getForumLikeByUser,
};
