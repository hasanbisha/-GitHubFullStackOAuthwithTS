const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    length: 255
  },
  id: {
    type: Number,
    required: true,
    length: 255
  },
  url: {
    type: String,
    required: true,
    length: 255
  },
  email: {
    type: String,
    length: 255
  },
  avatar_url: {
    type: String,
    required: true,
    length: 255
  },
  created_at: {
    type: String,
    required: true,
    length: 155
  }
});

const User = (module.exports = mongoose.model("User", UserSchema));
