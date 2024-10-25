const Blog = require("../models/blogModel");
const { capitalizeAfterSpace } = require("../../helper/capitalize");

const getBlogs = async (req, res) => {
  try {
    let { page = 1, size = 10, filter } = req.query;
    page = parseInt(page);
    size = parseInt(size);

    if (filter === "" || !filter) {
      const getBlogs = await Blog.find()
        .skip((page - 1) * size)
        .limit(size)
        .sort({ publishDate: -1 });

      const total = await Blog.countDocuments();

      return res.status(200).json({ status: true, blogs: getBlogs, total });
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
      .sort({ publishDate: -1 });

    const total = await Blog.countDocuments({
      $or: [
        { title: { $regex: filter, $options: "i" } },
        { subTitle: { $regex: filter, $options: "i" } },
        { category: { $regex: filter, $options: "i" } },
        { author: { $regex: filter, $options: "i" } },
      ],
    });

    return res.status(200).json({ status: true, blogs: getBlogs, total });
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
    const {
      slug,
      title,
      subTitle,
      thumbnail,
      author = "admin",
      category,
      sections,
      blockQuote,
      conclusion,
    } = req.body;

    if (!slug || !title || !subTitle || !thumbnail || !category)
      return res
        .status(400)
        .json({ status: false, message: "Fill up all the important field" });

    const checkSlug = await Blog.findOne({ slug });

    if (checkSlug)
      return res
        .status(400)
        .json({ status: 400, message: "Slug must be unique" });

    const capitalizeAuthor = capitalizeAfterSpace(author);

    const { cite, text } = blockQuote;

    const capitalizeCite = capitalizeAfterSpace(cite);

    const addBlog = new Blog({
      slug,
      title,
      subTitle,
      thumbnail,
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
  const { slug } = req.params;

  const { author, blockQuote } = req.body;

  let updateBlog = JSON.parse(JSON.stringify(req.body));

  if (author) {
    const capitalizeAuthor = capitalizeAfterSpace(author);
    updateBlog = { ...updateBlog, author: capitalizeAuthor };
  }

  if (blockQuote) {
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

  const updateBlogs = await Blog.findOneAndUpdate({ slug }, updateBlog, {
    new: true,
  });

  if (!updateBlogs)
    return res.status(400).json({ status: false, message: "Blog not found" });

  return res
    .status(200)
    .json({ status: true, message: "Blog updated successfully" });
};

const deleteBlogs = async (req, res) => {
  const { slug } = req.params;

  const deleteBlogs = await Blog.findOneAndDelete({ slug });

  if (!deleteBlogs)
    return res.status(400).json({ status: false, message: "Blog not found" });

  return res
    .status(200)
    .json({ status: true, message: "Blog deleted successfully" });
};

module.exports = { getBlogs, addBlogs, updateBlogs, deleteBlogs };
