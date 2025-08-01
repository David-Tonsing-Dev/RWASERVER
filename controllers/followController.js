const mongoose = require("mongoose");
const Follow = require("../models/followModel");
const UserStat = require("../models/userStatModel");
const sendPushNotificationForum = require("../helper/notifications/sendPushNotificationForum");

const getAllFollower = async (req, res) => {
  try {
    const userId = req.userId;
    let { page, size, filter } = req.query;

    page = !page ? 1 : parseInt(page);
    size = !size ? 50 : parseInt(size);

    if (!userId)
      return res
        .status(403)
        .json({ status: false, message: "Could not find user" });

    if (filter) {
      const followers = await Follow.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId.createFromHexString(userId),
          },
        },
        {
          $lookup: {
            from: "users", // Collection name
            localField: "followerId",
            foreignField: "_id",
            as: "followerId",
          },
        },
        { $unwind: "$followerId" },
        {
          $match: {
            "followerId.userName": { $regex: filter, $options: "i" },
          },
        },
        {
          $project: {
            _id: 1,
            createdAt: 1,
            followerId: {
              userName: 1,
              profileImg: 1,
              _id: 1,
            },
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * size },
        { $limit: size },
      ]);

      return res.status(200).json({ status: true, followers });
    }

    const followers = await Follow.find({ userId })
      .populate({ path: "followerId", select: "userName profileImg" })
      .select("-userId -updatedAt -__v")
      .skip((page - 1) * size)
      .limit(size)
      .sort({ createdAt: -1 });

    return res.status(200).json({ status: true, followers });
  } catch (err) {
    console.log("ERROR::", err.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later!",
    });
  }
};

const getAllFollowing = async (req, res) => {
  try {
    const userId = req.userId;
    let { page, size, filter } = req.query;

    page = !page ? 1 : parseInt(page);
    size = !size ? 50 : parseInt(size);

    if (!userId)
      return res
        .status(403)
        .json({ status: false, message: "Could not find user" });

    if (filter) {
      const followings = await Follow.aggregate([
        {
          $match: {
            followerId: mongoose.Types.ObjectId.createFromHexString(userId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userId",
          },
        },
        {
          $unwind: "$userId",
        },
        {
          $match: {
            "userId.userName": { $regex: filter, $options: "i" },
          },
        },
        {
          $project: {
            _id: 1,
            createdAt: 1,
            userId: {
              userName: 1,
              profileImg: 1,
              _id: 1,
            },
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * size },
        { $limit: size },
      ]);

      return res.status(200).json({ status: true, followings });
    }

    const followings = await Follow.find({ followerId: userId })
      .populate({ path: "userId", select: "userName profileImg" })
      .select("-followerId -updatedAt -__v")
      .skip((page - 1) * size)
      .limit(size)
      .sort({ createdAt: -1 });

    return res.status(200).json({ status: true, followings });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later!",
    });
  }
};

const followUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { followId } = req.params;

    if (!userId)
      return res
        .status(403)
        .json({ status: false, message: "Could not find user" });

    if (!followId)
      return res
        .status(404)
        .json({ status: false, message: "Following user not found" });

    if (!mongoose.Types.ObjectId.isValid(followId))
      return res
        .status(400)
        .json({ status: false, message: "Following user invalid" });

    const checkAlreadyFollow = await Follow.findOne({
      userId: followId,
      followerId: userId,
    }).populate({ path: "userId", select: "userName" });

    if (checkAlreadyFollow)
      return res.status(200).json({
        status: true,
        message: `You already followed ${checkAlreadyFollow.userId.userName}`,
      });

    const follow = await Follow.create({
      userId: followId,
      followerId: userId,
    });
    await follow.save();

    await follow.populate([
      { path: "userId", select: "userName fcmToken" },
      { path: "followerId", select: "userName" },
    ]);

    if (follow.userId.fcmToken && follow.userId.fcmToken.length >= 1) {
      await sendPushNotificationForum({
        userId: follow.userId.fcmToken,
        title: "New follower",
        body: `${follow.followerId.userName} follows you`,
        image: "https://avatar.iran.liara.run/public/boy",
      });
    }

    await UserStat.findOneAndUpdate(
      { userId },
      { $inc: { totalFollowing: 1 } },
      { upsert: true }
    );

    await UserStat.findOneAndUpdate(
      { userId: followId },
      { $inc: { totalFollower: 1 } },
      { upsert: true }
    );

    return res.status(201).json({
      status: true,
      message: `You followed ${follow.userId.userName}`,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later!",
    });
  }
};

const unFollowUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { followId } = req.params;

    if (!userId)
      return res
        .status(403)
        .json({ status: false, message: "Could not find user" });

    if (!followId)
      return res
        .status(404)
        .json({ status: false, message: "Following user not found" });

    if (!mongoose.Types.ObjectId.isValid(followId))
      return res
        .status(400)
        .json({ status: false, message: "Following user invalid" });

    const checkAlreadyUnfollow = await Follow.findOne({
      userId: followId,
      followerId: userId,
    });

    if (!checkAlreadyUnfollow)
      return res.status(200).json({
        status: true,
        message: "Not followed",
      });

    const unFollow = await Follow.findOneAndDelete({
      userId: followId,
      followerId: userId,
    }).populate({ path: "userId", select: "userName" });

    await UserStat.findOneAndUpdate(
      { userId },
      { $inc: { totalFollowing: -1 } },
      { upsert: true }
    );

    await UserStat.findOneAndUpdate(
      { userId: followId },
      { $inc: { totalFollower: -1 } },
      { upsert: true }
    );

    return res.status(200).json({
      status: true,
      message: `You unfollow ${unFollow.userId.userName}`,
    });
  } catch (err) {
    console.log("ERROR::", err.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later!",
    });
  }
};

module.exports = {
  getAllFollower,
  getAllFollowing,
  followUser,
  unFollowUser,
};
