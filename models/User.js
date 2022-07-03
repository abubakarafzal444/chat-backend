const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  userName: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: false },
  bio: { type: String, required: false },
  about: { type: String, required: false },
  gender: { type: String, required: false },
});
module.exports = mongoose.model("User", userSchema);
