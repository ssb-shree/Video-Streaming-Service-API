import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnailID: {
      type: String,
      required: true,
      trim: true,
    },
    videoID: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

// Virtual fields for likes, dislikes, and views
videoSchema.virtual("likes").get(function () {
  return this.likedBy.length;
});

videoSchema.virtual("dislikes").get(function () {
  return this.dislikedBy.length;
});

videoSchema.virtual("views").get(function () {
  return this.viewedBy.length;
});

// Ensure virtual fields are included in JSON output
videoSchema.set("toJSON", {
  virtuals: true,
});

const Video = mongoose.model("Video", videoSchema);
export default Video;
