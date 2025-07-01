const Category = require("../models/categoryModel");
const CoingeckoToken = require("../../models/coinTokenModel");

const mongoose = require("mongoose");

const assignTokensToNewCategory = async (req, res) => {
  try {
    const { categoryName, tokenIds } = req.body;
    const role = req.role;

    if (role !== "SUPERADMIN") {
      return res.status(401).json({
        status: false,
        message: "Only Super admin is allowed to perform this action.",
      });
    }

    if (!categoryName || !Array.isArray(tokenIds) || tokenIds.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Category name and token are required.",
      });
    }

    let category = await Category.findOne({
      categoryName,
    });

    if (category) {
      return res.status(403).json({
        status: false,
        message: "Category already exists.",
      });
    }
    category = new Category({ categoryName });
    await category.save();

    const updatePromises = tokenIds.map((tokenId) =>
      CoingeckoToken.findOneAndUpdate(
        { id: tokenId },
        { $addToSet: { category: category._id } },
        { new: true }
      )
    );

    const updatedTokens = await Promise.allSettled(updatePromises);

    return res.status(200).json({
      status: true,
      message: "Category assigned to tokens successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const assignCategoriesToToken = async (req, res) => {
  try {
    const { categoryNames, tokenId } = req.body;
    const role = req.role;

    if (role !== "SUPERADMIN") {
      return res.status(401).json({
        status: false,
        message: "Only Super admin is allowed to perform this action.",
      });
    }

    if (
      !tokenId ||
      !Array.isArray(categoryNames) ||
      categoryNames.length === 0
    ) {
      return res.status(400).json({
        status: false,
        message: "All field are required",
      });
    }

    const categoryIds = [];

    for (const name of categoryNames) {
      let category = await Category.findOne({ categoryName: name });
      if (!category) {
        return res.status(404).json({
          status: false,
          message: "Category not found",
        });
      }
      categoryIds.push(category._id);
    }

    const updatedToken = await CoingeckoToken.findOneAndUpdate(
      { id: tokenId },
      {
        $addToSet: {
          category: { $each: categoryIds },
        },
      },
      { new: true }
    );

    if (!updatedToken) {
      return res.status(404).json({
        status: false,
        message: "Token not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Categories assigned to token successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const assignMultipleCategories = async (req, res) => {
  try {
    const category = req.body;
    const role = req.role;

    if (role !== "SUPERADMIN") {
      return res.status(401).json({
        status: false,
        message: "Only Super admin is allowed to perform this action.",
      });
    }

    if (!Array.isArray(category) || category.length === 0) {
      return res.status(400).json({
        status: false,
        message: "At least one category and token is required.",
      });
    }

    const bulkOps = [];

    for (const group of category) {
      const { categoryName, tokenIds } = group;

      if (!categoryName || !Array.isArray(tokenIds) || tokenIds.length === 0) {
        return res.status(400).json({
          status: false,
          message: "Each item must include a categoryName and tokens.",
        });
      }

      const checkCategory = await Category.findOne({ categoryName });
      if (!checkCategory) {
        return res.status(404).json({
          status: false,
          message: `Category '${categoryName}' does not exist.`,
        });
      }

      tokenIds.forEach((tokenId) => {
        bulkOps.push({
          updateOne: {
            filter: { id: tokenId },
            update: { $addToSet: { category: checkCategory._id } },
          },
        });
      });
    }

    const result = await CoingeckoToken.bulkWrite(bulkOps);

    return res.status(200).json({
      status: true,
      message: "Categories assigned to tokens successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const { filter } = req.query;

    const categoryQuery = filter
      ? { categoryName: { $regex: filter, $options: "i" } }
      : {};

    const categories = await Category.find(categoryQuery);

    const results = await Promise.allSettled(
      categories.map(async (cat) => {
        const tokens = await CoingeckoToken.find({ category: cat._id })
          .select("price_change_percentage_24h_in_currency image rank")
          .lean();

        const validTokens = tokens.filter(
          (t) => t.price_change_percentage_24h_in_currency != null
        );

        const totalPercentage = validTokens.reduce(
          (sum, t) => sum + t.price_change_percentage_24h_in_currency,
          0
        );

        const avg =
          validTokens.length > 0 ? totalPercentage / validTokens.length : 0;

        const topTokens = tokens
          .sort((a, b) => (b.rank || 0) - (a.rank || 0))
          .slice(0, 3)
          .map((t) => t.image);
        return {
          _id: cat._id,
          categoryName: cat.categoryName,
          avg24hPercent: avg,
          topTokenImages: topTokens,
        };
      })
    );

    const detailCategories = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);

    const failedCategories = results
      .filter((r) => r.status === "rejected")
      .map((r) => r.reason);

    if (failedCategories.length > 0) {
      console.log("Some categories failed to process:", failedCategories);
    }

    return res.status(200).json({
      status: true,
      message: "Categories with token data fetched successfully",
      categories: detailCategories,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const categoryUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName } = req.body;
    const role = req.role;

    if (role !== "SUPERADMIN") {
      return res.status(401).json({
        status: false,
        message: "Only Super admin is allowed to perform this action.",
      });
    }

    if (!categoryName) {
      return res.status(400).json({
        status: false,
        message: "Category name is required",
      });
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: id },
      { categoryName },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        status: false,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Category updated successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteCategoryAndUnlinkTokens = async (req, res) => {
  try {
    const { id } = req.params;

    const role = req.role;

    if (role !== "SUPERADMIN") {
      return res.status(401).json({
        status: false,
        message: "Only Super admin can delete",
      });
    }

    await CoingeckoToken.updateMany(
      { category: id },
      { $pull: { category: id } }
    );

    const deleted = await Category.findOneAndDelete({ _id: id });

    if (!deleted) {
      return res.status(404).json({
        status: false,
        message: "Category not found",
      });
    }
    return res.status(200).json({
      status: true,
      message: "Category deleted and tokens updated successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteCategoryFromSpecificToken = async (req, res) => {
  try {
    const { categoryId, tokenId } = req.params;

    const role = req.role;

    if (role !== "SUPERADMIN") {
      return res.status(401).json({
        status: false,
        message: "Only Super admin can delete",
      });
    }

    const token = await CoingeckoToken.findOne({ id: tokenId });
    if (!token) {
      return res
        .status(404)
        .json({ status: false, message: "Token not found" });
    }

    token.category = token.category.filter(
      (catId) => catId.toString() !== categoryId.toString()
    );

    await token.save();

    return res.status(200).json({
      status: true,
      message: "Category has been removed from the token successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  assignTokensToNewCategory,
  assignCategoriesToToken,
  getAllCategories,
  categoryUpdate,
  deleteCategoryAndUnlinkTokens,
  deleteCategoryFromSpecificToken,
  assignMultipleCategories,
};
