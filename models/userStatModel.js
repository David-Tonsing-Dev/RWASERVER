const mongoose = require("mongoose");

const userStatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    required: true,
  },
  totalFollower: { type: Number, default: 0 },
  totalFollowing: { type: Number, default: 0 },
  totalThreadPosted: { type: Number, default: 0 },
  totalCommentReceived: { type: Number, default: 0 },
  totalLikeReceived: { type: Number, default: 0 },
  totalViewReceived: { type: Number, default: 0 },
  totalCommentGiven: { type: Number, default: 0 },
  rwaprosStaff: {
    type: Boolean,
    default: false,
  },
  communityAdmin: {
    type: Boolean,
    default: false,
  },
  moderator: {
    type: Boolean,
    default: false,
  },
  officialPartner: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("UserStat", userStatSchema);
