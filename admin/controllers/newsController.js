const News = require("../models/newsModel");
const { capitalizeAfterSpace } = require("../../helper/capitalize");
const cloudinary = require("../../config/cloudinary");

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
