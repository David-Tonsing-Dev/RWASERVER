const Category = require("../models/categoryModel");
const CoingeckoToken = require("../../models/coinTokenModel");

// const assignTokenToCategories = async (req, res) => {
//   try {
//     const { categoryNames, tokenId } = req.body;
//     const role = req.role;

//     if (role !== "SUPERADMIN")
//       return res.status(401).json({
//         status: false,
//         message: "Only Super admin can add category",
//       });

//     if (!tokenId || !categoryNames) {
//       return res.status(400).json({
//         status: false,
//         message: "tokenId and categoryName are required.",
//       });
//     }

//     const categoryIds = [];

//     for (const name of categoryNames) {
//       let category = await Category.findOne({ categoryName: name });

//       if (!category) {
//         category = new Category({ categoryName: name });
//         await category.save();
//       }

//       categoryIds.push(category._id);
//     }

//     const updatedToken = await CoingeckoToken.findOneAndUpdate(
//       { id: tokenId },
//       {
//         $addToSet: {
//           category: { $each: categoryIds },
//         },
//       },
//       { new: true }
//     );

//     if (!updatedToken) {
//       return res.status(404).json({
//         status: false,
//         message: "Token not found",
//       });
//     }

//     return res.status(200).json({
//       status: true,
//       message: "Token assigned to categories successfully",
//       token: updatedToken,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// const removeCategoryFromToken = async (req, res) => {
//   try {
//     const { tokenId, categoryId } = req.params;

//     const role = req.role;

//     if (role !== "SUPERADMIN")
//       return res.status(401).json({
//         status: false,
//         message: "Only Super admin can delete",
//       });

//     const updatedToken = await CoingeckoToken.findOneAndUpdate(
//       { id: tokenId },
//       { $pull: { category: categoryId } },
//       { new: true }
//     );

//     if (!updatedToken) {
//       return res.status(404).json({
//         status: false,
//         message: "Token not found",
//       });
//     }

//     return res.status(200).json({
//       status: true,
//       message: "Category removed from token successfully",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

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
        message: "categoryName and tokenIds are required.",
      });
    }

    let category = await Category.findOne({ categoryName });
    if (!category) {
      category = new Category({ categoryName });
      await category.save();
    }

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
        message: "tokenId and categoryNames are required.",
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

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().select("-__v");

    return res.status(200).json({
      status: true,
      message: "Categories fetched successfully",
      categories: categories,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.role;

    if (role !== "SUPERADMIN") {
      return res.status(401).json({
        status: false,
        message: "Only Super admin can delete",
      });
    }

    const tokensUsingCategory = await CoingeckoToken.find({ category: id });

    if (tokensUsingCategory.length > 0) {
      return res.status(400).json({
        status: false,
        message:
          "Category is assigned to one or more tokens and cannot be deleted",
      });
    }

    const deleted = await Category.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        status: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Category deleted successfully",
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

    const deleted = await Category.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        status: false,
        message: "Category not found",
      });
    }
    return res.status(200).json({
      status: true,
      message: "Category deleted and tokens updated",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const unlinkCategoryFromSpecificToken = async (req, res) => {
  try {
    const { categoryId, tokenId } = req.params;

    const role = req.role;

    if (role !== "SUPERADMIN") {
      return res.status(401).json({
        status: false,
        message: "Only Super admin can delete",
      });
    }

    const token = await CoingeckoToken.findOneAndUpdate(
      { id: tokenId },
      { $pull: { category: categoryId } },
      { new: true }
    );

    if (!token) {
      return res.status(404).json({
        status: false,
        message: "Token not found or category not assigned",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Category unlinked from the token successfully",
      token,
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
};
