const mongoose = require("mongoose");
const Follow = require("../models/followModel");
const UserStat = require("../models/userStatModel");
const sendPushNotificationForum = require("../helper/notifications/sendPushNotificationForum");

const getAllFollower = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, size = 50 } = req.query;

    if (!userId)
      return res
        .status(403)
        .json({ status: false, message: "Could not find user" });

    const followers = await Follow.find({ userId })
      .populate({ path: "followerId", select: "userName profilePic" })
      .skip((page - 1) * size)
      .limit(size)
      .sort({ createdAt: -1 });

    return res.status(200).json({ status: true, followers });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later!",
    });
  }
};

const getAllFollowing = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, size = 50 } = req.query;

    if (!userId)
      return res
        .status(403)
        .json({ status: false, message: "Could not find user" });

    const followings = await Follow.find({ followerId: userId })
      .populate({ path: "userId", select: "userName profilePic" })
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
