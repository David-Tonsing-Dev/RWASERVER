function getClientIP(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded
    ? forwarded.split(",")[0]
    : req.socket?.remoteAddress || null;

  return ip;
}

module.exports = { getClientIP };
