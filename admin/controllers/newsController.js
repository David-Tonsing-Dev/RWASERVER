const News = require("../models/newsModel");
const { capitalizeAfterSpace } = require("../../helper/capitalize");
const cloudinary = require("../../config/cloudinary");
const sendPushNotification = require("../../helper/sendPushNotification");
const User = require("../../models/userModel");
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");

const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  },
};

const addNews = async (req, res) => {
  try {
    const {
      title,
      subTitle,
      // thumbnail,
      author = "admin",
      content,
      tags = [],
      slug,
    } = req.body;

    const role = req.role;
    const userId = req.userId;

    if (role !== "ADMIN" && role !== "SUPERADMIN")
      return res.status(401).json({
        status: false,
        message: "Only Admin or Super admin can add news",
      });

    if (!title || !req.file || !content || !slug || !subTitle)
      return res
        .status(400)
        .json({ status: false, message: "All field are required" });

    // const checkSlug = await News.findOne({ slug });

    // if (checkSlug)
    //   return res
    //     .status(400)
    //     .json({ status: false, message: "Slug must be unique" });

    const uploadImg = await cloudinary.uploader.upload(req.file.path, {
      use_filename: true,
      folder: "rwa/news",
    });

    if (!uploadImg)
      return res
        .status(500)
        .json({ status: false, message: "Erro in uploading image" });

    const capitalizeAuthor = capitalizeAfterSpace(author);

    const addNew = new News({
      userId,
      title,
      subTitle,
      thumbnail: uploadImg.secure_url,
      author: capitalizeAuthor,
      content,
      publishDate: new Date(),
      tags,
      slug,
    });
    await addNew.save();

    await sendPushNotification({
      title: "News",
      link: "",
      body: addNew.title,
      image: addNew.thumbnail,
      id: addNew._id.toString(),
      slug: addNew.slug,
    }).catch((err) => console.error("Error sending notification:", err));

    const nodemailerMailgun = nodemailer.createTransport(mg(auth));

    const subscribers = await User.find({ subscribe: true }).select("email");
    const recipientEmails = subscribers.map((sub) => sub.email);

    if (recipientEmails.length > 0) {
      const newsUrl = `${process.env.CLIENT_URL}/newsdetails/${addNew.slug}`;
      const subject = `Latest News: ${addNew.title}`;

      const html = `
  <head>
    <meta charset="UTF-8" />
    <title>News Update</title>
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
      .news-title {
        font-size: 20px;
        font-weight: bold;
        color: #0f1132;
      }
      .news-subtitle {
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
      <div class="header">Latest News Notification</div>
      <div class="content">
        <div class="news-title">${addNew.title}</div>
        <div class="news-subtitle">${addNew.subTitle || ""}</div>
        <p>We’ve published a new update we think you'll find important.</p>
        <a href="${newsUrl}" class="read-more" target="_blank">Read Full News</a>
        <p style="margin-top: 30px;">Best regards,<br/>Condo Team</p>
      </div>
      <div class="footer">
        © 2025 Condo-RWAHedgefund. All rights reserved.
      </div>
    </div>
  </body>
  `;

      const sendEmails = recipientEmails.map((email) =>
        nodemailerMailgun.sendMail({
          from: "service@rwacamp.com",
          to: email,
          subject,
          html,
        })
      );

      const results = await Promise.allSettled(sendEmails);

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(
            `Failed to send to ${recipientEmails[index]}:`,
            result.reason
          );
        } else {
          console.log(`Email sent to ${recipientEmails[index]}`);
        }
      });
    }

    return res.status(200).json({ status: true, message: "News added" });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

const getNews = async (req, res) => {
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
      const getNews = await News.find()
        .skip((page - 1) * size)
        .limit(size)
        .sort(sortOptions);

      const totalNews = await News.countDocuments();

      return res.status(200).json({
        status: true,
        message: "News retrieved successfully.",
        news: getNews,
        total: totalNews,
      });
    }

    const getNews = await News.find({
      $or: [
        { title: { $regex: filter, $options: "i" } },
        { content: { $regex: filter, $options: "i" } },
        { author: { $regex: filter, $options: "i" } },
      ],
    })
      .skip((page - 1) * size)
      .limit(size)
      .sort(sortOptions);

    const totalFilter = await News.countDocuments({
      $or: [
        { title: { $regex: filter, $options: "i" } },
        { content: { $regex: filter, $options: "i" } },
        { author: { $regex: filter, $options: "i" } },
      ],
    });

    return res.status(200).json({
      status: true,
      message: "News retrieved successfully.",
      news: getNews,
      total: totalFilter,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.role;
    const userId = req.userId;

    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      return res.status(401).json({
        status: false,
        message: "Only Admin or Super admin can delete",
      });
    }

    if (role !== "SUPERADMIN") {
      const checkAdmin = await News.findOne({ _id: id, userId });
      if (!checkAdmin)
        return res.status(401).json({
          status: false,
          message: "You can only delete your own news",
        });
    }

    const deleteNews = await News.findOneAndDelete({ _id: id });

    if (!deleteNews)
      return res.status(400).json({ status: false, message: "News not found" });

    return res
      .status(200)
      .json({ status: true, message: "News deleted successfully" });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

const updateNews = async (req, res) => {
  try {
    const { id } = req.params;

    const role = req.role;
    const userId = req.userId;

    console.log("role", role, "id", id);

    let updatedNews = JSON.parse(JSON.stringify(req.body));

    if (role !== "ADMIN" && role !== "SUPERADMIN")
      return res.status(401).json({
        status: false,
        message: "Only Admin or Super admin can update news",
      });

    if (role !== "SUPERADMIN") {
      const checkAdmin = await News.findOne({ _id: id, userId });
      if (!checkAdmin)
        return res.status(401).json({
          status: false,
          message: "You can only update your own news",
        });
    }

    // if (!title || !req.file || !content || !slug || !subTitle)
    //   return res
    //     .status(400)
    //     .json({ status: false, message: "All field are required" });

    if (updatedNews.author) {
      const capitalizeAuthor = capitalizeAfterSpace(updatedNews.author);
      updatedNews = { ...updatedNews, author: capitalizeAuthor };
    }

    if (req.file) {
      await cloudinary.uploader.upload(
        req.file.path,
        {
          use_filename: true,
          folder: "rwa/news",
        },
        (err, result) => {
          if (err)
            return res
              .status(500)
              .json({ status: false, message: "Error in updating image" });

          updatedNews = { ...updatedNews, thumbnail: result.secure_url };
        }
      );
    }

    const updateNews = await News.findOneAndUpdate({ _id: id }, updatedNews, {
      new: true,
      runValidators: true,
    });

    if (!updateNews)
      return res.status(400).json({ status: false, message: "News not found" });

    return res
      .status(200)
      .json({ status: true, message: "News updated successfully" });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

module.exports = {
  addNews,
  getNews,
  deleteNews,
  updateNews,
};
