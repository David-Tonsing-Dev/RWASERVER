const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 100,
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 1024,
  },
  username: {
    type: String,
    required: true,
  },
  profileImg: {
    type: String,
    default: null,
  },
  description: {
    type: String,
  },
  link: {
    type: [String],
  },
  role: {
    type: String,
    enum: ["SUPERADMIN", "ADMIN", "USER", "REVIEWER"],
    default: "ADMIN",
  },
});

module.exports = mongoose.model("AdminUser", userSchema);
