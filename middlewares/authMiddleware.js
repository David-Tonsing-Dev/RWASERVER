const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      token = token.split(" ")[1];

      let user = jwt.verify(token, process.env.SECRET_KEY);

      req.userId = user.id;
    } else {
      return res.status(400).json(errorMsg.EBO_009);
    }
    next();
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({
        success: false,
        message: "Something went wrong!",
        error: err.message,
      });
  }
};

module.exports = authMiddleware;
