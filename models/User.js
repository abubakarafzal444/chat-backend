const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    userName: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: false },
    bio: { type: String, required: false },
    about: { type: String, required: false },
    gender: { type: String, required: false },
    prfilePhoto: { type: String, required: false },
    profession: { type: String, required: false },
    bodyType: { type: String, required: false },
    city: { type: String, required: false },
    country: { type: String, required: false },
    lookingFor: { type: String, required: false },
    interests: { type: Array, required: false },
    profileClicks: { type: Number, required: false },
    lastOnline: { type: String, required: false },
    isOnApp: { type: Boolean, required: false },
    friendRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
    sentRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    //groups:{type:Schema.Types.ObjectId,ref:'Group'}
  },
  { timestamps: true }
);
module.exports = mongoose.model("User", userSchema);
