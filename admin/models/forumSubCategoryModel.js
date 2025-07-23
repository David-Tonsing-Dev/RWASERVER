const mongoose = require("mongoose");

const forumCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    subCategoryImage: {
      type: String,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumCategory",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SubForumCategory", forumCategorySchema);
