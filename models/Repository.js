const mongoose = require("mongoose");

const repoSchema = mongoose.Schema({
  id: {
    type: Number,
    required: true,
    length: 255
  },
  name: {
    type: String,
    required: true,
    length: 255
  },
  url: {
    type: String,
    required: true,
    length: 255
  },
  owner: {
    type: String,
    required: true,
    length: 255
  }
});

const Repository = (module.exports = mongoose.model("Repository", repoSchema));
