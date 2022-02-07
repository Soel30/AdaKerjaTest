const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fbId: {
      type: String,
      required: true,
    },

    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
    },

    profilePic: {
      type: String,
    },

    locale: {
      type: String,
    },

    timezone: {
      type: Date,
    },

    psid: {
      type: String,
    },
    
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
