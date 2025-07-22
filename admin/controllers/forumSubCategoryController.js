const mongoose = require("mongoose");
const ForumSubCategory = require("../models/forumSubCategoryModel");
const Forum = require("../../models/forumModel");
const { SUPERADMIN } = require("../../constant/role");
const cloudinary = require("../../config/cloudinary");

const addForumSubCategory = async (req, res) => {
  try {
    const role = req.role;
    const { name, description, categoryId } = req.body;

    if (role !== SUPERADMIN)
      return res
        .status(403)
        .json({ status: false, message: "Unauthorized user" });

    if (!categoryId) return res.status(400).json("Category is required");

    const checkCategory = await ForumSubCategory.findOne({
      name: { $regex: name, $options: "i" },
    });

    if (checkCategory)
      return res
        .status(400)
        .json({ status: false, message: `${name} sub-category already exist` });

    if (!req.file)
      return res
        .status(400)
        .json({ status: false, message: "Image is required" });

    const subCategoryImage = await cloudinary.uploader.upload(req.file.path, {
      use_filename: true,
      folder: "rwa/forum/subCategory",
    });

    if (!subCategoryImage)
      return res
        .status(500)
        .json({ status: false, message: "Error in uploading image" });

    const newCategory = new ForumSubCategory({
      name,
      description,
      subCategoryImage: subCategoryImage.secure_url,
      categoryId,
    });
    await newCategory.save();

    return res
      .status(200)
      .json({ status: true, message: `${name} category added successfully` });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later",
    });
  }
};

const getForumSubCategory = async (req, res) => {
  try {
    const { filter, category } = req.query;

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: "Invalid categoryId" });
    }

    if (!category)
      return res
        .status(400)
        .json({ status: false, message: "Category is required" });
    let filters = {};
    if (filter) filters.name = { $regex: filter, $options: "i" };
    if (category) filters.categoryId = category;

    const subCategories = await ForumSubCategory.find(filters).sort({
      updatedAt: -1,
    });

    const stats = await Forum.aggregate([
      {
        $match: {
          categoryId: mongoose.Types.ObjectId.createFromHexString(category),
        },
      },
      {
        $group: {
          _id: null,
          totalCommentsCount: { $sum: "$commentsCount" },
          totalLikes: { $sum: { $ifNull: ["$reactions.👍", 0] } },
          totalDislikes: { $sum: { $ifNull: ["$reactions.👎", 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          totalCommentsCount: 1,
          totalLikes: 1,
          totalDislikes: 1,
        },
      },
    ]);

    return res
      .status(200)
      .json({
        status: true,
        subCategories,
        totalCommentsCount: stats[0].totalCommentsCount,
        totalLikes: stats[0].totalLikes,
        totalDislikes: stats[0].totalDislikes,
      });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: "Something went wrong try again later" });
  }
};

const updateForumSubCategory = async (req, res) => {
  try {
    const role = req.role;
    const { subCategoryId } = req.params;
    const { name, description, categoryId } = req.body;

    console.log("name", name, description, subCategoryId, req.body);

    if (!mongoose.Types.ObjectId.isValid(subCategoryId))
      return res
        .status(400)
        .json({ status: false, message: "Invalid sub-category" });

    if (!role)
      return res.status(404).json({ status: false, message: "User not found" });

    if (role !== SUPERADMIN)
      return res
        .status(403)
        .json({ status: false, message: "Unauthorized user" });

    const checkCategory = await ForumSubCategory.findOne({
      _id: subCategoryId,
    });

    if (!checkCategory)
      return res
        .status(404)
        .json({ status: false, message: "Could not found sub-category" });

    if (name) checkCategory.name = name;
    if (description) checkCategory.description = description;
    if (categoryId) checkCategory.categoryId = categoryId;

    if (req.file) {
      const categoryImage = await cloudinary.uploader.upload(req.file.path, {
        use_filename: true,
        folder: "rwa/forum/subCategory",
      });
      checkCategory.subCategoryImage = categoryImage.secure_url;
    }

    await checkCategory.save();

    console.log("checkCategory", checkCategory);
    return res
      .status(200)
      .json({ status: true, message: "Category updated successfully" });
  } catch (err) {
    console.log("ERROR::", err.message);
    return res
      .status(500)
      .json({ status: false, message: "Something went wrong try again later" });
  }
};

const deleteForumSubCategory = async (req, res) => {
  try {
    const role = req.role;
    const { subCategoryId } = req.params;

    if (!role)
      return res.status(404).json({ status: false, message: "User not found" });

    if (role !== SUPERADMIN)
      return res
        .status(403)
        .json({ status: false, message: "Unauthorized user" });

    const checkCategory = await ForumSubCategory.findOneAndDelete({
      _id: subCategoryId,
    });

    if (!checkCategory)
      return res
        .status(404)
        .json({ status: false, message: "Could not find category" });

    return res.status(200).json({
      status: true,
      message: `Deleted ${checkCategory.name} category`,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: "Something went wrong try again later" });
  }
};

module.exports = {
  addForumSubCategory,
  getForumSubCategory,
  updateForumSubCategory,
  deleteForumSubCategory,
};
