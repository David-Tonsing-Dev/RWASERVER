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
    const newsUrl = `${process.env.CLIENT_URL}/newsdetails/${addNew.slug}`;

    const htmlContent = `
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; box-shadow: 0 0 3px #b8cbe9b7;">
  <div style="max-width: 600px; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); background-color: #ffffff;">

    <!-- Header -->
    <div style="background-color: #000000; padding: 30px 20px 20px; text-align: center;">
      <img src="https://res.cloudinary.com/dbtsrjssc/image/upload/v1753419169/Group_8866_an1zkz.png" alt="RWA Pros Logo" style="max-height: 40px; display: block; margin: 0 auto 20px;" />
      <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Latest RWA News Update</h1>
    </div>

    <!-- Content -->
    <div style="padding: 30px; color: #000000; font-size: 16px; line-height: 1.5;">
      <p style="margin: 0 0 10px; color: #0f1132; font-weight: bold; font-size: 20px;">${addNew.title}</p>
      <p style="margin: 0 0 20px; color: #666666; font-size: 16px;">${addNew.subTitle}</p>
      
      <p style="margin: 0 0 20px; color: #000000;">
        We’ve published a new update we think you'll find important. Click below to read the full news article.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${newsUrl}" target="_blank" style="background-color: #ebb411; padding: 12px 24px; border-radius: 6px; color: #ffffff; font-weight: bold; font-size: 16px; text-decoration: none;">
         Read More
        </a>
      </div>

      <p style="margin: 0; color: #000000;">Best regards,<br />The RWA Pros Team</p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; font-size: 12px; color: #999999; padding: 20px; border-top: 1.5px solid #ebb411;">
      <p style="margin: 4px 0;">RWA Pros LLC, Republic of Seychelles</p>
      <p style="margin: 4px 0;">Email: <a href="mailto:admin@rwapros.com" style="color: #0f1132; text-decoration: underline;">admin@rwapros.com</a></p>

      <div style="margin: 12px 0;">
        <a href="https://x.com/RWAPROS" style="margin: 0 6px; text-decoration: none;">
          <img src="https://res.cloudinary.com/dbtsrjssc/image/upload/v1753445015/ic_baseline-telegram-2_2_vdxodc.png" alt="Twitter" width="30" style="vertical-align: middle;" />
        </a>
        <a href="https://t.me/RealWorldAssets2023" style="margin: 0 6px; text-decoration: none;">
          <img src="https://res.cloudinary.com/dbtsrjssc/image/upload/v1753445015/ic_baseline-telegram-1_2_si1z8o.png" alt="Telegram" width="30" style="vertical-align: middle;" />
        </a>
        <a href="https://medium.com" style="margin: 0 6px; text-decoration: none;">
          <img src="https://res.cloudinary.com/dbtsrjssc/image/upload/v1753445015/ic_baseline-telegram_2_yg8a4g.png" alt="Medium" width="30" style="vertical-align: middle;" />
        </a>
      </div>

      <p style="margin: 4px 0;">© 2025 RWA Pros. All rights reserved.</p>
    </div>

  </div>
</body>
`;

    const subscribers = await User.find({ subscribe: true }).select("email");
    const recipientEmails = subscribers.map((sub) => sub.email);

    if (recipientEmails.length > 0) {
      const subject = `Latest News: ${addNew.title}`;

      const sendEmails = recipientEmails.map((email) =>
        nodemailerMailgun.sendMail({
          from: "service@rwapros.com",
          to: email,
          subject,
          html: htmlContent,
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

const getFeaturedNews = async (req, res) => {
  try {
    const featureNews = await News.find({ isFeatured: true })
      .limit(10)
      .sort({ createdAt: -1 });

    if (!featureNews)
      return res.status(400).json({
        status: false,
        message: "Something went wrong, try again later",
      });

    return res.status(200).json({ status: true, newsFeatures: featureNews });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong, try again later",
      error: err.message,
    });
  }
};

module.exports = {
  addNews,
  getNews,
  deleteNews,
  updateNews,
  getFeaturedNews,
};
