const mongoose = require("mongoose");
const { Schema } = mongoose;

const chatRoomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isDefault: {
      type: Boolean,
      required: true,
    },
    clicks: {
      type: Number,
      required: false,
    },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    applicants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);
module.exports = mongoose.model("ChatRoom", chatRoomSchema);
