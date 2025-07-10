const mongoose = require("mongoose");
const ForumCategory = require("../models/forumCategoryModel");
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
    const { category } = req.query;

    let filter = {};
    if (category) filter.name = { $regex: category, $options: "i" };

    const categories = await ForumCategory.find(filter).sort({ updatedAt: -1 });

    return res.status(200).json({ status: true, categories });
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

    console.log("name", name, description, categoryId, req.body);

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

    if (res.file) {
      const categoryImage = await cloudinary.uploader.upload(req.file.path, {
        use_filename: true,
        folder: "rwa/forum/category",
      });
      checkCategory.categoryImage = categoryImage.secure_url;
    }

    await checkCategory.save();

    console.log("checkCategory", checkCategory);
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
