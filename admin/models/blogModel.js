const mongoose = require("mongoose");

const sectionSchema = [
  {
    title: {
      type: String,
    },
    content: [
      {
        subTitle: {
          type: String,
        },
        details: {
          type: String,
        },
      },
    ],
  },
];

const blogSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    subTitle: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      default: "admin",
    },
    blockQuote: {
      text: {
        type: String,
      },
      cite: {
        type: String,
        default: "admin",
      },
    },
    sections: {
      type: String,
    },
    conclusion: {
      type: String,
    },
    publishDate: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Blog", blogSchema);
