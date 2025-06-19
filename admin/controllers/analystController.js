const AdminUser = require("../models/userModel");
const User = require("../../models/userModel");

const getRoleCounts = async (req, res) => {
  try {
    const role = req.role;

    if (role !== "ADMIN" && role !== "SUPERADMIN")
      return res.status(401).json({
        status: false,
        message: "Only Admin or Super admin can access",
      });

    const adminStats = await AdminUser.aggregate([
      {
        $match: { role: { $in: ["ADMIN", "REVIEWER"] } },
      },
      {
        $group: {
          _id: { $toLower: "$role" },
          total: { $sum: 1 },
        },
      },
    ]);

    const userCount = await User.countDocuments();

    const getTotals = [
      ...adminStats.map((stat) => ({
        type: stat._id.charAt(0).toUpperCase() + stat._id.slice(1),
        total: stat.total,
      })),
      { type: "User", total: userCount },
    ];

    return res.status(200).json({
      success: true,
      message: "Role counts fetched successfully",
      counts: getTotals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getAdminLists = async (req, res) => {
  try {
    const role = req.role;
    let { page = 1, size = 10, filter = "" } = req.query;
    page = parseInt(page);
    size = parseInt(size);
    const skip = (page - 1) * size;

    if (role !== "ADMIN" && role !== "SUPERADMIN")
      return res.status(401).json({
        status: false,
        message: "Only Admin or Super admin can access",
      });

    const searchQuery =
      filter.trim() !== ""
        ? {
            $or: [
              { email: { $regex: filter, $options: "i" } },
              { username: { $regex: filter, $options: "i" } },
            ],
          }
        : {};

    const getAdmins = await AdminUser.find({ role: "ADMIN", ...searchQuery })
      .select("username email")
      .skip(skip)
      .limit(size)
      .sort({ createdAt: -1 });

    const count = await AdminUser.countDocuments({
      role: "ADMIN",
      ...searchQuery,
    });

    return res.status(200).json({
      message: "Role-based users fetched successfully",
      status: true,
      admins: getAdmins,
      total: count,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};
const getReviewerLists = async (req, res) => {
  try {
    const role = req.role;
    let { page = 1, size = 10, filter = "" } = req.query;
    page = parseInt(page);
    size = parseInt(size);
    const skip = (page - 1) * size;

    if (role !== "ADMIN" && role !== "SUPERADMIN")
      return res.status(401).json({
        status: false,
        message: "Only Admin or Super admin can access",
      });

    const searchQuery =
      filter.trim() !== ""
        ? {
            $or: [
              { email: { $regex: filter, $options: "i" } },
              { username: { $regex: filter, $options: "i" } },
            ],
          }
        : {};

    const getReviewers = await AdminUser.find({
      role: "REVIEWER",
      ...searchQuery,
    })
      .select("username email")
      .skip(skip)
      .limit(size)
      .sort({ createdAt: -1 });

    const count = await AdminUser.countDocuments({
      role: "REVIEWER",
      ...searchQuery,
    });

    return res.status(200).json({
      message: "Reviewers fetched successfully",
      status: true,
      reviewers: getReviewers,
      total: count,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};
const getUsersLists = async (req, res) => {
  try {
    const role = req.role;
    let { page = 1, size = 10, filter = "" } = req.query;
    page = parseInt(page);
    size = parseInt(size);
    const skip = (page - 1) * size;

    if (role !== "ADMIN" && role !== "SUPERADMIN")
      return res.status(401).json({
        status: false,
        message: "Only Admin or Super admin can access",
      });

    const searchQuery =
      filter.trim() !== ""
        ? {
            $or: [
              { email: { $regex: filter, $options: "i" } },
              { username: { $regex: filter, $options: "i" } },
            ],
          }
        : {};

    const getUsers = await User.find(searchQuery)
      .select("userName email profileImg")
      .skip(skip)
      .limit(size)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(searchQuery);

    return res.status(200).json({
      message: "Users fetched successfully",
      status: true,
      users: getUsers,
      total: count,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};

module.exports = {
  getRoleCounts,
  getAdminLists,
  getReviewerLists,
  getUsersLists,
};
