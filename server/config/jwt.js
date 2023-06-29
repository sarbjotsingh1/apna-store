const jwt = require("jsonwebtoken");

const genrateToken = (id) => {
  const payload = { id };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "3d" });
};

module.exports = genrateToken;
