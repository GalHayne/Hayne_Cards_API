const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) {
    res.status(401).send("Access denied. No token provided.");
    return;
  }

  try {
    const decode = jwt.verify(token, "MYSECRET");
    req.user = decode;
    next();
  } catch (err) {
    res.status(400).send("Invalid token.");
  }
};
