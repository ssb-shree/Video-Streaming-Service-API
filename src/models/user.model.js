import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    channelName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    phone: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    logoUrl: {
      type: String,
      required: true,
    },
    logoID: {
      type: String,
      required: true,
    },
    subscriber: {
      type: Number,
      default: 0,
    },
    subscribedChannels: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
