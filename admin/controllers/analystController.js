const AdminUser = require("../models/userModel");
const User = require("../../models/userModel");

const getRoleCounts = async (req, res) => {
  try {
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

    const counts = {
      totalUsers: userCount,
    };

    for (const stat of adminStats) {
      const role = stat._id;
      const capitalized = role.charAt(0).toUpperCase() + role.slice(1);
      counts[`total${capitalized}s`] = stat.total;
    }

    return res.status(200).json({
      success: true,
      message: "Role counts fetched successfully",
      counts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getRoleUserLists = async (req, res) => {
  try {
    let { page = 1, size = 10, filter = "" } = req.query;

    page = parseInt(page);
    size = parseInt(size);
    const skip = (page - 1) * size;

    const searchQuery =
      filter.trim() !== ""
        ? {
            $or: [
              { email: { $regex: filter, $options: "i" } },
              { username: { $regex: filter, $options: "i" } },
            ],
          }
        : {};

    const [admins, reviewers, users] = await Promise.all([
      AdminUser.find({ role: "ADMIN", ...searchQuery })
        .skip(skip)
        .limit(size)
        .sort({ createdAt: -1 }),

      AdminUser.find({ role: "REVIEWER", ...searchQuery })
        .skip(skip)
        .limit(size)
        .sort({ createdAt: -1 }),

      User.find(searchQuery).skip(skip).limit(size).sort({ createdAt: -1 }),
    ]);

    return res.status(200).json({
      message: "Role-based users fetched successfully",
      status: true,
      data: {
        admins,
        reviewers,
        users,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};

module.exports = { getRoleCounts, getRoleUserLists };
