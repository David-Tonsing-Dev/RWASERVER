const Blog = require("../models/blogModel");
const { capitalizeAfterSpace } = require("../../helper/capitalize");
const cloudinary = require("../../config/cloudinary");

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
