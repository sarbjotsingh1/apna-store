const mongoose = require("mongoose");

const validateMongodb = (id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) {
    throw new Error("Invalid User");
  }
};

module.exports = validateMongodb;
