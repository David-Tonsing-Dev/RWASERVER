const News = require("../models/newsModel");
const { capitalizeAfterSpace } = require("../../helper/capitalize");

const addNews = async (req, res) => {
  try {
    const {
      title,
      subTitle,
      thumbnail,
      author = "admin",
      content,
      tags = [],
      slug,
    } = req.body;

    if (!title || !thumbnail || !content || !slug || !subTitle)
      return res
        .status(400)
        .json({ status: false, message: "All field are required" });

    const checkSlug = await News.findOne({ slug });

    if (checkSlug)
      return res
        .status(400)
        .json({ status: false, message: "Slug must be unique" });

    const capitalizeAuthor = capitalizeAfterSpace(author);

    const addNew = new News({
      title,
      subTitle,
      thumbnail,
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
    let { page = 1, size = 10, filter } = req.query;
    page = parseInt(page);
    size = parseInt(size);

    if (filter === "" || !filter) {
      const getNews = await News.find()
        .skip((page - 1) * size)
        .limit(size)
        .sort({ publishDate: -1 });

      const totalNews = await News.countDocuments();

      return res
        .status(200)
        .json({ status: true, news: getNews, total: totalNews });
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
      .sort({ publishDate: -1 });

    const totalFilter = await News.countDocuments({
      $or: [
        { title: { $regex: filter, $options: "i" } },
        { content: { $regex: filter, $options: "i" } },
      ],
    });

    return res
      .status(200)
      .json({ status: true, news: getNews, total: totalFilter });
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
    const { slug } = req.params;

    const deleteNews = await News.findOneAndDelete({ slug });

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
    const { slug } = req.params;

    let updatedNews = JSON.parse(JSON.stringify(req.body));

    if (updatedNews.author) {
      const capitalizeAuthor = capitalizeAfterSpace(updatedNews.author);
      updatedNews = { ...updatedNews, author: capitalizeAuthor };
    }

    const updateNews = await News.findOneAndUpdate({ slug }, updatedNews, {
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
