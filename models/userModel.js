const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
    },
    userName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 100,
    },
    password: {
      type: String,
      default: null,
      minlength: 4,
      maxlength: 1024,
    },
    subscribe: {
      type: Boolean,
      default: false,
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["SUPERADMIN", "ADMIN", "USER", "REVIEWER"],
      default: "USER",
    },
    profileImg: {
      type: String,
      default: null,
    },
    bannerImg: {
      type: String,
      default: null,
    },
    link: [
      {
        platform: { type: String },
        url: { type: String },
      },
    ],
    fcmToken: {
      type: [String],
      default: [],
    },
    notification: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
