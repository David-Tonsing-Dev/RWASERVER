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
    const { category } = req.query;

    if (category && !mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ error: "Invalid  categoryId" });
    }

    const filter = {};
    if (category) filter.categoryId = category;

    const subCategories = await ForumSubCategory.find(filter);

    const subCategoryIds = subCategories.map((cat) => cat._id);

    const forumStats = await Forum.aggregate([
      {
        $match: {
          categoryId: { $in: subCategoryIds },
        },
      },
      {
        $group: {
          _id: "$categoryId",
          totalComments: { $sum: "$commentsCount" },
          totalLikes: {
            $sum: {
              $ifNull: [{ $getField: { field: "👍", input: "$reactions" } }, 0],
            },
          },
          totalDislikes: {
            $sum: {
              $ifNull: [{ $getField: { field: "👎", input: "$reactions" } }, 0],
            },
          },
        },
      },
    ]);

    const statsMap = {};
    forumStats.forEach((stat) => {
      statsMap[stat._id.toString()] = {
        totalComments: stat.totalComments,
        totalLikes: stat.totalLikes,
        totalDislikes: stat.totalDislikes,
      };
    });

    // Step 5: Combine stats with subcategories
    const result = subCategories.map((category) => {
      const stats = statsMap[category._id.toString()] || {
        totalComments: 0,
        totalLikes: 0,
        totalDislikes: 0,
      };

      return {
        ...category.toObject(),
        ...stats,
      };
    });

    return res.status(200).json(result);
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
