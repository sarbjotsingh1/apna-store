const mongoose = require("mongoose");

const dbConnect = () => {
  try {
    const connect = mongoose.connect("mongodb://localhost:27017/apna-store");
    console.log("Database is connected");
  } catch (err) {
    console.log("Database Error");
  }
};

module.exports = dbConnect;
