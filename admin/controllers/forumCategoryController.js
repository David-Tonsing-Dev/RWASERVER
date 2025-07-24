const mongoose = require("mongoose");
const ForumCategory = require("../models/forumCategoryModel");
const ForumSubCategory = require("../models/forumSubCategoryModel");
const Forum = require("../../models/forumModel");
const { SUPERADMIN } = require("../../constant/role");
const cloudinary = require("../../config/cloudinary");

const addForumCategory = async (req, res) => {
  try {
    const role = req.role;
    const { name, description } = req.body;

    if (role !== SUPERADMIN)
      return res
        .status(403)
        .json({ status: false, message: "Unauthorized user" });

    const checkCategory = await ForumCategory.findOne({
      name: { $regex: name, $options: "i" },
    });

    if (checkCategory)
      return res
        .status(400)
        .json({ status: false, message: `${name} category already exist` });

    if (!req.file)
      return res
        .status(400)
        .json({ status: false, message: "Image is required" });

    const categoryImage = await cloudinary.uploader.upload(req.file.path, {
      use_filename: true,
      folder: "rwa/forum/category",
    });

    if (!categoryImage)
      return res
        .status(500)
        .json({ status: false, message: "Error in uploading image" });

    const newCategory = new ForumCategory({
      name,
      description,
      categoryImage: categoryImage.secure_url,
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

const getForumCategory = async (req, res) => {
  try {
    const { categoryName, subCategoryName } = req.query;

    let filter = {};
    let subFilter = {};
    if (categoryName) filter.name = { $regex: categoryName, $options: "i" };

    if (subCategoryName)
      subFilter.name = { $regex: subCategoryName, $options: "i" };

    let allCategories, subCategories;

    if (categoryName && subCategoryName) {
      const categories = await ForumCategory.find(filter).sort({
        updatedAt: -1,
      });

      if (!categories)
        return res
          .status(400)
          .json({ status: false, message: "Could not fetch category name" });

      const allCategories = await Promise.all(
        categories.map(async (category) => {
          const subCategoriesWithForums = await Promise.all(
            (
              await ForumSubCategory.find({ categoryId: category._id }).sort({
                updatedAt: -1,
              })
            ).map(async (subCategory) => {
              const forum = await Forum.find({ categoryId: subCategory._id })
                .sort({ updatedAt: -1 })
                .limit(3);
              return {
                ...subCategory.toObject(),
                forum,
              };
            })
          );

          return {
            ...category.toObject(),
            subCategories: subCategoriesWithForums,
          };
        })
      );

      if (!allCategories)
        return res
          .status(400)
          .json({ status: false, message: "Could not fetch sub-category" });

      const getSubCategories = await ForumSubCategory.find(subFilter).sort({
        updatedAt: -1,
      });

      if (!getSubCategories)
        return res
          .status(400)
          .json({ status: false, message: "Could not found sub-category" });

      subCategories = await Promise.all(
        getSubCategories.map(async (data) => {
          const forum = await Forum.find({ categoryId: data._id })
            .sort({ updatedAt: -1 })
            .limit(3)
            .populate({ path: "userId", select: "userName" });
          return {
            ...data.toObject(),
            forum,
          };
        })
      );

      if (!subCategories)
        return res
          .status(400)
          .json({ status: false, message: "Could not fetch sub-category" });

      return res
        .status(200)
        .json({ status: true, allCategories, subCategories });
    }

    if (subCategoryName) {
      const getSubCategories = await ForumSubCategory.find(subFilter).sort({
        updatedAt: -1,
      });

      if (!getSubCategories)
        return res
          .status(400)
          .json({ status: false, message: "Could not found sub-category" });

      subCategories = await Promise.all(
        getSubCategories.map(async (data) => {
          const forum = await Forum.find({ categoryId: data._id })
            .sort({ updatedAt: -1 })
            .limit(3)
            .populate({ path: "userId", select: "userName" });
          return {
            ...data.toObject(),
            forum,
          };
        })
      );

      if (!subCategories)
        return res
          .status(400)
          .json({ status: false, message: "Could not fetch sub-category" });

      return res
        .status(200)
        .json({ status: true, allCategories: [], subCategories });
    }

    const categories = await ForumCategory.find(filter).sort({ updatedAt: -1 });

    if (!categories)
      return res
        .status(400)
        .json({ status: false, message: "Could not fetch category" });

    allCategories = await Promise.all(
      categories.map(async (category) => {
        const subCategoriesWithForums = await Promise.all(
          (
            await ForumSubCategory.find({ categoryId: category._id }).sort({
              updatedAt: -1,
            })
          ).map(async (subCategory) => {
            const forum = await Forum.find({ categoryId: subCategory._id })
              .sort({ updatedAt: -1 })
              .limit(3)
              .populate({ path: "userId", select: "userName" });
            return {
              ...subCategory.toObject(),
              forum,
            };
          })
        );

        return {
          ...category.toObject(),
          subCategories: subCategoriesWithForums,
        };
      })
    );

    return res
      .status(200)
      .json({ status: true, allCategories, subCategories: [] });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: "Something went wrong try again later" });
  }
};

const updateForumCategory = async (req, res) => {
  try {
    const role = req.role;
    const { categoryId } = req.params;
    const { name, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(categoryId))
      return res
        .status(400)
        .json({ status: false, message: "Invalid category" });

    if (!role)
      return res.status(404).json({ status: false, message: "User not found" });

    const checkCategory = await ForumCategory.findOne({ _id: categoryId });

    if (!checkCategory)
      return res
        .status(404)
        .json({ status: false, message: "Could not found category" });

    if (name) checkCategory.name = name;
    if (description) checkCategory.description = description;

    if (req.file) {
      const categoryImage = await cloudinary.uploader.upload(req.file.path, {
        use_filename: true,
        folder: "rwa/forum/category",
      });
      checkCategory.categoryImage = categoryImage.secure_url;
    }

    await checkCategory.save();

    return res
      .status(200)
      .json({ status: true, message: "Category updated successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: "Something went wrong try again later" });
  }
};

const deleteForumCategory = async (req, res) => {
  try {
    const role = req.role;
    const { categoryId } = req.params;

    const checkCategory = await ForumCategory.findOneAndDelete({
      _id: categoryId,
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
  addForumCategory,
  getForumCategory,
  updateForumCategory,
  deleteForumCategory,
};
