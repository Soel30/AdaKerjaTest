const mongoose = require("mongoose");
const User = require("./User");
const Message = require("./Message");
require("dotenv").config();

const connectDb = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/bot", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const models = { User, Message };

module.exports = { connectDb, models };
