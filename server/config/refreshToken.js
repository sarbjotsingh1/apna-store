const jwt = require("jsonwebtoken");

const genrateRefreshToken = (id) => {
  const payload = { id };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "3d" });
};

module.exports = genrateRefreshToken;
