const Blog = require("../models/blogModel");
const { capitalizeAfterSpace } = require("../../helper/capitalize");
const cloudinary = require("../../config/cloudinary");
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const User = require("../../models/userModel");
const sendPushNotification = require("../../helper/sendPushNotification");

const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  },
};

const getBlogs = async (req, res) => {
  try {
    let { page = 1, size = 10, filter, sortBy, order } = req.query;
    page = parseInt(page);
    size = parseInt(size);

    sortBy = sortBy || "createdAt";
    order =
      order?.toLowerCase() === "asc"
        ? 1
        : order?.toLowerCase() === "desc"
        ? -1
        : -1;

    const sortOptions = { [sortBy]: order };

    if (filter === "" || !filter) {
      const getBlogs = await Blog.find()
        .skip((page - 1) * size)
        .limit(size)
        .sort(sortOptions);

      const total = await Blog.countDocuments();

      return res.status(200).json({
        status: true,
        message: "Blogs retrieved successfully.",
        blogs: getBlogs,
        total,
      });
    }

    const getBlogs = await Blog.find({
      $or: [
        { title: { $regex: filter, $options: "i" } },
        { subTitle: { $regex: filter, $options: "i" } },
        { category: { $regex: filter, $options: "i" } },
        { author: { $regex: filter, $options: "i" } },
      ],
    })
      .skip((page - 1) * size)
      .limit(size)
      .sort(sortOptions);

    const total = await Blog.countDocuments({
      $or: [
        { title: { $regex: filter, $options: "i" } },
        { subTitle: { $regex: filter, $options: "i" } },
        { category: { $regex: filter, $options: "i" } },
        { author: { $regex: filter, $options: "i" } },
      ],
    });

    return res.status(200).json({
      status: true,
      message: "Blogs retrieved successfully.",
      blogs: getBlogs,
      total,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

const addBlogs = async (req, res) => {
  try {
    let {
      slug,
      title,
      subTitle,
      // thumbnail,
      author = "admin",
      category,
      sections,
      blockQuote,
      conclusion,
    } = req.body;

    const role = req.role;
    const userId = req.userId;

    // sections = JSON.parse(sections);
    blockQuote = JSON.parse(blockQuote);

    if (role !== "ADMIN" && role !== "SUPERADMIN")
      return res.status(401).json({
        status: false,
        message: "Only Admin or Super admin can add blog",
      });

    if (!slug || !title || !subTitle || !req.file || !category)
      return res
        .status(400)
        .json({ status: false, message: "Fill up all the important field" });

    const checkSlug = await Blog.findOne({ slug });

    if (checkSlug)
      return res
        .status(400)
        .json({ status: 400, message: "Slug must be unique" });

    const capitalizeAuthor = capitalizeAfterSpace(author);

    const uploadImg = await cloudinary.uploader.upload(req.file.path, {
      use_filename: true,
      folder: "rwa/blog",
    });

    if (!uploadImg)
      return res
        .status(500)
        .json({ status: false, message: "Error in uploading image" });

    const { cite, text } = blockQuote;

    const capitalizeCite = capitalizeAfterSpace(cite);

    const addBlog = new Blog({
      userId,
      slug,
      title,
      subTitle,
      thumbnail: uploadImg.secure_url,
      author: capitalizeAuthor,
      category,
      publishDate: new Date(),
      sections,
      blockQuote: {
        text,
        cite: capitalizeCite,
      },
      conclusion,
    });

    await addBlog.save();

    sendPushNotification({
      title: "Blogs",
      link: "",
      body: addBlog.title,
      image: addBlog.thumbnail,
      id: addBlog._id.toString(),
      slug: addBlog.slug,
    }).catch((err) => console.error("Error sending notification:", err));

    const nodemailerMailgun = nodemailer.createTransport(mg(auth));

    const subscribers = await User.find({ subscribe: true }).select("email");
    const recipientEmails = subscribers.map((sub) => sub.email);

    if (recipientEmails.length > 0) {
      const blogUrl = `${process.env.CLIENT_URL}/blogdetails/${addBlog.slug}`;
      const subject = `New Blog Published: ${addBlog.title}`;

      const html = `
  <head>
    <meta charset="UTF-8" />
    <title>New Blog Alert</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
        font-family: Arial, sans-serif;
      }
      .container {
        max-width: 600px;
        margin: 30px auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
      .header {
        background-color: #0f1132;
        color: #ffffff;
        padding: 20px;
        text-align: center;
        font-size: 22px;
        font-weight: bold;
      }
      .content {
        padding: 30px;
        font-size: 16px;
        color: #333333;
      }
      .blog-title {
        font-size: 20px;
        font-weight: bold;
        color: #0f1132;
      }
      .blog-subtitle {
        font-size: 16px;
        color: #666666;
        margin-bottom: 20px;
      }
      .read-more {
        display: inline-block;
        margin-top: 15px;
        padding: 10px 20px;
        background-color: #0f1132;
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 5px;
      }
      .footer {
        text-align: center;
        font-size: 12px;
        color: #999999;
        padding: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">New Blog Notification</div>
      <div class="content">
        <div class="blog-title">${addBlog.title}</div>
        <div class="blog-subtitle">${addBlog.subTitle}</div>
        <p>We’ve published a new article we think you'll find interesting.</p>
        <a href="${blogUrl}" class="read-more" target="_blank">Read Full Blog</a>
        <p style="margin-top: 30px;">Best regards,<br/>Condo Team</p>
      </div>
      <div class="footer">
        © 2025 Condo-RWAHedgefund. All rights reserved.
      </div>
    </div>
  </body>
  `;

      nodemailerMailgun.sendMail(
        {
          from: "service@rwacamp.com",
          to: recipientEmails,
          subject,
          html,
        },
        (err, info) => {
          if (err) {
            console.error("Error sending blog email:", err);
          } else {
            console.log("Blog email sent:", JSON.stringify(info));
          }
        }
      );
    }

    return res
      .status(200)
      .json({ status: true, message: "Blog added successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

const updateBlogs = async (req, res) => {
  const { id } = req.params;
  const role = req.role;
  const userId = req.userId;

  let { author, blockQuote } = req.body;

  let updateBlog = { ...req.body };

  if (role !== "SUPERADMIN" && role !== "ADMIN")
    return res.status(401).json({
      status: false,
      message: "Only Admin or Super admin can update blog",
    });

  if (role !== "SUPERADMIN") {
    const checkAdmin = await Blog.findOne({ _id: id, userId });

    if (!checkAdmin)
      return res.status(401).json({
        status: false,
        message: "You cannot only update your own blog",
      });
  }

  if (author) {
    author = JSON.parse(JSON.stringify(author));
    const capitalizeAuthor = capitalizeAfterSpace(author);
    updateBlog = { ...updateBlog, author: capitalizeAuthor };
  }

  if (blockQuote) {
    blockQuote = JSON.parse(blockQuote);
    const { cite, text } = blockQuote;
    const capitalizeCite = capitalizeAfterSpace(cite);
    updateBlog = {
      ...updateBlog,
      blockQuote: {
        text,
        cite: capitalizeCite,
      },
    };
  }

  if (req.file) {
    await cloudinary.uploader.upload(
      req.file.path,
      {
        use_filename: true,
        folder: "rwa/blog",
      },
      (err, result) => {
        if (err)
          return res
            .status(500)
            .json({ status: false, message: "Error in updating image" });

        updateBlog = { ...updateBlog, thumbnail: result.secure_url };
      }
    );
  }

  const updateBlogs = await Blog.findOneAndUpdate({ _id: id }, updateBlog, {
    new: true,
  });

  if (!updateBlogs)
    return res.status(400).json({ status: false, message: "Blog not found" });

  return res
    .status(200)
    .json({ status: true, message: "Blog updated successfully" });
};

const deleteBlogs = async (req, res) => {
  const { id } = req.params;

  const role = req.role;
  const userId = req.userId;

  if (role !== "ADMIN" && role !== "SUPERADMIN") {
    return res
      .status(401)
      .json({ status: false, message: "Only Admin or Super admin can delete" });
  }

  if (role !== "SUPERADMIN") {
    const checkAdmin = await Blog.findOne({ _id: id, userId });
    if (!checkAdmin)
      return res.status(401).json({
        status: false,
        message: "You can only delete your own blog post",
      });
  }

  const deleteBlogs = await Blog.findOneAndDelete({ _id: id });

  if (!deleteBlogs)
    return res.status(400).json({ status: false, message: "Blog not found" });

  return res
    .status(200)
    .json({ status: true, message: "Blog deleted successfully" });
};

module.exports = { getBlogs, addBlogs, updateBlogs, deleteBlogs };
