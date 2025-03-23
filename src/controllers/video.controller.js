import User from "../models/user.model.js";
import Video from "../models/video.model.js";
import cloudinary from "../utils/cloudinary.js";

const uploadVideo = async (req, res) => {
  // get the data from the body
  const { title, description, category, tags } = req.body;

  // check if all necessary media is provided by the user
  if (!req.files || !req.files.video || !req.files.thumbnail)
    return res.status(409).json({ message: "No Media Provided to upload", success: false });

  // check for empty fields
  if (!title || !description || !category || !tags)
    return res.status(409).json({ message: "All Fields are required", success: true });

  try {
    const videoUpload = await cloudinary.uploader.upload(req.files.video.tempFilePath, {
      resource_type: "video",
      folder: "video-streaming-service-api/videos",
    });

    const thumbNailUpload = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath, {
      resource_type: "image",
      folder: "video-streaming-service-api/thumbnails",
    });

    const newVideo = await Video.create({
      title,
      description,
      category,
      tags: tags ? tags.split(",") : [],
      userID: req.user.ID,
      videoID: videoUpload.public_id,
      videoUrl: videoUpload.secure_url,
      thumbnailID: thumbNailUpload.public_id,
      thumbnailUrl: thumbNailUpload.secure_url,
    });

    if (!newVideo) {
      console.log("failed to make entry in mongo db");

      // Cleanup Uploaded Files from the Cloud incase of an insertion error in DB
      await cloudinary.uploader.destroy(thumbNailUpload.public_id);
      await cloudinary.uploader.destroy(videoUpload.public_id);

      res.status(500).json({ message: "Failed to save Data in DB, Try Again Later", success: false });
    }

    res.status(201).json({ message: "New Video Uploaded", data: newVideo, success: true });
  } catch (error) {
    console.log(`Error in Uploading Video ${error.message || error}`);
    res.status(500).json({
      message: "Unable to Upload Video Right Now Try Again Later",
      error: error.message || error,
      success: false,
    });
  }
};

const updateVideo = async (req, res) => {
  const { title, description, category, tags } = req.body;
  // no empty field check if empty put the old fields

  const { videoID } = req.params;
  if (!videoID) return res.status(409).json({ message: "no video id was provided to update", success: false });

  try {
    // find the video using
    const findVideo = await Video.findById(videoID);
    if (!findVideo)
      return res.status(404).json({ message: "Video not found, invalid video id provided", success: false });

    // check if the video to be updated is uploaded by the current user
    if (findVideo.userID.toString() !== req.user.ID.toString())
      return res.status(403).json({ message: "Unauthorized request ", success: false });

    // incase new thumbnail is provided
    if (req.files && req.files.thumbnail) {
      // destroy the old thumbnail from cloud
      await cloudinary.uploader.destroy(findVideo.thumbnailID);
      // upload the new thumbnail
      const newThumbNail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath, {
        resource_type: "image",
        folder: "video-streaming-service-api/thumbnails",
      });

      // update the video doc with new url and id
      findVideo.thumbnailID = newThumbNail.public_id;
      findVideo.thumbnailUrl = newThumbNail.secure_url;
    }

    // now update the rest of meta data
    findVideo.title = title || findVideo.title;
    findVideo.description = description || findVideo.description;
    findVideo.category = category || findVideo.category;
    findVideo.tags = tags ? tags.split(",") : findVideo.tags;

    // save the changes and send a success response
    const updatedVideo = await findVideo.save();

    res.status(200).json({ message: "video updated successfully", success: true, data: updatedVideo });
  } catch (error) {
    console.log(`Error in Updating Video ${error.message || error}`);
    res.status(500).json({
      message: "Unable to Update Video Right Now Try Again Later",
      error: error.message || error,
      success: false,
    });
  }
};

const deleteVideo = async (req, res) => {
  // check if id is provided
  const { videoID } = req.params;
  if (!videoID) return res.status(409).json({ message: "Video ID was not provided", success: false });

  try {
    // find the video using video ID
    const findVideo = await Video.findById(videoID);
    if (!findVideo) return res.status(404).json({ message: "Video not found, Invalid id provided", success: false });

    // check video to be deleted is uploaded by the current user
    if (findVideo.userID.toString() !== req.user.ID.toString())
      return res.status(403).json({ message: "Unauthorized request ", success: false });

    // now clean up the cloud storage
    await cloudinary.uploader.destroy(findVideo.thumbnailID, { resource_type: "image" });
    await cloudinary.uploader.destroy(findVideo.videoID, { resource_type: "video" });

    // send the final response of succcess
    res.status(200).json({ message: "Video Deleted Successfully!", success: true });
  } catch (error) {
    console.log(`Error in Deleting Video ${error.message || error}`);
    res.status(500).json({
      message: "Unable to Delete Video Right Now Try Again Later",
      error: error.message || error,
      success: false,
    });
  }
};

const getAllVideos = async (req, res) => {
  try {
    // sorting it in newest video First order
    const videos = await Video.find().sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (error) {
    console.log(`Error in Finding All Video ${error.message || error}`);
    res.status(500).json({
      message: "Unable to Get All Video Right Now Try Again Later",
      error: error.message || error,
      success: false,
    });
  }
};

const getMyVideos = async (req, res) => {
  const userID = req.user.ID;
  try {
    // get all videos of user id = current users user id
    const video = await Video.find({ userID }).sort({ createdAt: -1 });
    res.status(200).json({ message: "found videos successfully", success: true, data: video });
  } catch (error) {
    console.log(`Error in Finding Your Video ${error.message || error}`);
    res.status(500).json({
      message: "Unable to Get Your Video Right Now Try Again Later",
      error: error.message || error,
      success: false,
    });
  }
};

const findVideoByID = async (req, res) => {
  const { videoID } = req.params;
  try {
    // find video usinng id
    const video = await Video.findById(videoID);
    if (!video) return res.status(400).json({ message: "Video Not Found, Invalid video ID", success: false });

    res.status(200).json({ messsage: "Video Found", success: true, data: video });
  } catch (error) {
    console.log(`Error in Finding Your Video ${error.message || error}`);
    res.status(500).json({
      message: "Unable to Get Your Video Right Now Try Again Later",
      error: error.message || error,
      success: false,
    });
  }
};

export { uploadVideo, updateVideo, deleteVideo, getAllVideos, getMyVideos, findVideoByID };
