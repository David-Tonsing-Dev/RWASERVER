const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const Review = require("../models/reviewModel");

const addReview = async (req, res) => {
  try {
    const userId = req.userId;
    const role = req.role;
    console.log("req", req.role, role);
    const { tokenId } = req.params;
    const { review, rating } = req.body;

    if (role !== "ADMIN" && role !== "SUPERADMIN")
      return res.status(401).json({
        status: false,
        message: "Only Admin or Super admin can add review",
      });

    if (!userId)
      return res
        .status(401)
        .json({ status: false, message: "Unauthorized user" });

    if (!review)
      return res
        .status(400)
        .json({ status: false, message: "Review cannot be empty" });

    let checkTokenReview = await Review.findOne({ tokenId });

    if (!checkTokenReview) {
      checkTokenReview = await Review.create({
        tokenId,
        review: [{ userId, value: review, rating }],
      });
    } else {
      const existingRatingIndex = checkTokenReview.review.findIndex((r) =>
        r.userId.equals(userId)
      );

      if (existingRatingIndex === -1) {
        checkTokenReview.review.push({ userId, value: review, rating });
      } else {
        checkTokenReview.review[existingRatingIndex].value = review;
        checkTokenReview.review[existingRatingIndex].rating = rating;
      }

      await checkTokenReview.save();
    }

    return res
      .status(200)
      .json({ status: true, message: "Review added successfully" });
  } catch (err) {
    console.log("err", err.message);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

const getReview = async (req, res) => {
  const role = req.role;

  try {
    if (role !== "ADMIN" && role !== "SUPERADMIN")
      return res
        .status(401)
        .json({ status: false, message: "Unauthorized user" });

    const getAllReview = await Review.find()
      .populate({
        path: "review.userId",
        select: "username",
      })
      .lean();

    const transformed = getAllReview.map((item) => {
      const newReviews = item.review.map((r) => {
        const user = r.userId;
        return {
          ...r,
          userId: user?._id ?? null,
          username: user?.username ?? null,
        };
      });

      return {
        _id: item._id,
        tokenId: item.tokenId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        __v: item.__v,
        review: newReviews,
      };
    });

    return res.status(200).json({ status: true, review: transformed });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Interval server error",
      error: err.message,
    });
  }
};

const getReviewById = async (req, res) => {
  const role = req.role;
  const { tokenId } = req.params;

  try {
    if (role !== "ADMIN" && role !== "SUPERADMIN")
      return res
        .status(401)
        .json({ status: false, message: "Unauthorized user" });

    const getAllReview = await Review.findOne({ tokenId }).populate({
      path: "review.userId",
      select: "username",
    });

    return res.status(200).json({ status: true, review: getAllReview.review });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Interval server error",
      error: err.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const userId = req.userId;
    const { tokenId } = req.params;

    const checkReview = await Review.findOne({
      tokenId,
      "review.userId": userId,
    });

    if (!checkReview)
      return res
        .status(400)
        .json({ status: false, message: "User's review or token not found" });

    const newCheckReview = checkReview.review.filter(
      (item) => item.userId.toString() !== userId
    );

    checkReview.review = newCheckReview;
    await checkReview.save();

    if (checkReview.review.length <= 0) {
      await Review.findOneAndDelete({ tokenId });
    }

    return res
      .status(200)
      .json({ status: true, message: "Review deleted successfully" });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports = { addReview, deleteReview, getReview };
