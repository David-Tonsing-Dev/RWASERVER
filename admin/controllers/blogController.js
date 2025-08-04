const Blog = require("../models/blogModel");
const { capitalizeAfterSpace } = require("../../helper/capitalize");
const cloudinary = require("../../config/cloudinary");
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const User = require("../../models/userModel");

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
    const blogUrl = `${process.env.CLIENT_URL}/blogdetails/${addBlog.slug}`;

    const htmlContent = `
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; box-shadow: 0 0 3px #b8cbe9b7;">
  <div style="max-width: 600px; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); background-color: #ffffff;">

    <!-- Header -->
    <div style="background-color: #000000; padding: 30px 20px 20px; text-align: center;">
      <img src="https://res.cloudinary.com/dbtsrjssc/image/upload/v1753419169/Group_8866_an1zkz.png" alt="RWA Pros Logo" style="max-height: 40px; display: block; margin: 0 auto 20px;" />
      <h1 style="color: #ffffff; font-size: 24px; margin: 0;">New Blog Post Published</h1>
    </div>

    <!-- Content -->
        <div style="padding: 30px; color: #000000; font-size: 16px; line-height: 1.5;">
      <p style="margin: 0 0 10px; color: #0f1132; font-weight: bold; font-size: 20px;">${addBlog.title}</p>
      <p style="margin: 0 0 20px; color: #666666; font-size: 16px;">${addBlog.subTitle}</p>
      
      <p style="margin: 0 0 20px; color: #000000;">
        We’ve published a new article we think you'll find interesting. Click below to read the full blog post.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${blogUrl}" target="_blank" style="background-color: #ebb411; padding: 12px 24px; border-radius: 6px; color: #ffffff; font-weight: bold; font-size: 16px; text-decoration: none;">
          Read More
        </a>
      </div>

          <p style="margin: 0; color: #000000; ">Best regards,<br />The RWA Pros Team</p>

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

    const nodemailerMailgun = nodemailer.createTransport(mg(auth));

    const subscribers = await User.find({ subscribe: true }).select("email");
    const recipientEmails = subscribers.map((sub) => sub.email);

    if (recipientEmails.length > 0) {
      const subject = `New Blog Published: ${addBlog.title}`;

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

    return res
      .status(200)
      .json({ status: true, message: "Blog added successfully" });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

const updateBlogs = async (req, res) => {
  try {
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
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

const deleteBlogs = async (req, res) => {
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
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports = { getBlogs, addBlogs, updateBlogs, deleteBlogs };
