const Forum = require("../models/forumModel");

const hotForumTopicsService = async ({ skip, size, filter }) => {
  try {
    const hotTopics = await Forum.find(filter)
      .populate({ path: "userId", select: "userName" })
      .populate({ path: "categoryId", select: "name" })
      .sort({ commentsCount: -1 })
      .skip(skip)
      .limit(size)
      .lean();

    const total = await Forum.countDocuments(filter);

    return { hotTopics, total };
  } catch (err) {
    return err.message;
  }
};

module.exports = hotForumTopicsService;
