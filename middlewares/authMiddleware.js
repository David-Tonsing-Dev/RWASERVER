const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (token)
      return res
        .status(400)
        .json({ status: false, message: "Access token not found!" });

    token = token.split(" ")[1];
    let user = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userId = user.id;
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: false,
      message: "Token expired, logout and login again!",
      error: err.message,
    });
  }
};

const nonAuthMiddleware = (req, res, next) => {
  try {
    let token = req.headers?.authorization;
    if (token) {
      token = token.split(" ")[1];

      let user = jwt.verify(token, process.env.JWT_SECRET_KEY);

      req.userId = user.id;
    }
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json(err.message);
  }
};

const adminAuthMiddleware = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token)
      return res
        .status(401)
        .json({ status: false, message: "Access token not found" });

    token = token.split(" ")[1];
    let user = jwt.verify(token, process.env.JWT_SECRET_KEY_ADMIN);
    req.userId = user.id;
    next();
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Invalid token",
      error: err.message,
    });
  }
};

module.exports = { authMiddleware, nonAuthMiddleware, adminAuthMiddleware };
