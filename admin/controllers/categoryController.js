const Category = require("../models/categoryModel");
const CoingeckoToken = require("../../models/coinTokenModel");

// const getCategory = async (req, res) => {
//   try {
//     const category = await Category.find();

//     return res.status(200).json({
//       status: true,
//       categories: category,
//       message: "Category add successfully.",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// const addCategory = async (req, res) => {
//   try {
//     const role = req.role;
//     const { categoryName } = req.body;

//     if (role !== "SUPERADMIN")
//       return res.status(401).json({
//         status: false,
//         message: "Only Super admin can add category",
//       });

//     const newCategory = new Category({
//       categoryName,
//     });
//     await newCategory.save();

//     return res.status(200).json({
//       status: true,
//       message: "Category add successfully.",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// const updateCategory = async (req, res) => {
//   try {
//     const { categoryName } = req.body;
//     const role = req.role;
//     const { id } = req.params;

//     if (role !== "SUPERADMIN")
//       return res.status(401).json({
//         status: false,
//         message: "Only Super admin can add airdrop",
//       });

//     const updateCategory = await Category.findOneAndUpdate(
//       { _id: id },
//       {
//         $set: {
//           categoryName,
//         },
//       }
//     );
//     if (!updateCategory) {
//       return res
//         .status(404)
//         .json({ message: "Category not found", status: false });
//     }

//     return res.status(200).json({
//       message: "Category updated successfully",
//       status: true,
//     });
//   } catch (err) {
//     return res.status(500).json({
//       message: "Internal server error",
//       status: false,
//       error: err.message,
//     });
//   }
// };

// const deleteCategory = async (req, res) => {
//   try {
//     const role = req.role;
//     const { id } = req.params;

//     if (role !== "SUPERADMIN")
//       return res.status(401).json({
//         status: false,
//         message: "Only Super admin can delete.",
//       });

//     const deleteCategory = await Category.findOneAndDelete({ _id: id });
//     if (!deleteCategory) {
//       return res
//         .status(404)
//         .json({ message: "Category not found", status: false });
//     }
//     return res.status(200).json({
//       status: true,
//       message: "Category deleted successfully.",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// controllers/assignTokenToCategories.js

const assignTokenToCategories = async (req, res) => {
  try {
    const { categoryNames, tokenId } = req.body;
    const role = req.role;

    if (role !== "SUPERADMIN")
      return res.status(401).json({
        status: false,
        message: "Only Super admin can add category",
      });

    if (!tokenId || !categoryNames) {
      return res.status(400).json({
        status: false,
        message: "tokenId and categoryName are required.",
      });
    }

    // const categoryIds = [];
    // for (const name of categoryNames) {
    //   const category = await Category.findOneAndUpdate(
    //     { categoryName: name },
    //     { $setOnInsert: { categoryName: name } },
    //     { upsert: true, new: true, setDefaultsOnInsert: true }
    //   );
    //   categoryIds.push(category._id);
    // }

    const categoryIds = [];

    for (const name of categoryNames) {
      let category = await Category.findOne({ categoryName: name });

      if (!category) {
        category = new Category({ categoryName: name });
        await category.save();
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
      message: "Token assigned to categories successfully",
      token: updatedToken,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const getTokenCategories = async (req, res) => {
  try {
    const { tokenId } = req.params;

    const token = await CoingeckoToken.findOne({ id: tokenId }).populate(
      "category",
      "categoryName"
    );

    if (!token) {
      return res.status(404).json({
        status: false,
        message: "Token not found",
      });
    }

    return res.status(200).json({
      status: true,
      categories: token.category,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getAllTokensWithCategories = async (req, res) => {
  try {
    const tokens = await CoingeckoToken.find()
      .populate("category", "categoryName")
      .lean();

    return res.status(200).json({
      status: true,
      tokens,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const removeCategoryFromToken = async (req, res) => {
  try {
    const { tokenId, categoryId } = req.params;

    const role = req.role;

    if (role !== "SUPERADMIN")
      return res.status(401).json({
        status: false,
        message: "Only Super admin can delete",
      });

    const updatedToken = await CoingeckoToken.findOneAndUpdate(
      { id: tokenId },
      { $pull: { category: categoryId } },
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
      message: "Category removed from token successfully",
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
  assignTokenToCategories,
  getTokenCategories,
  removeCategoryFromToken,
  getAllTokensWithCategories,
};
