import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import cloudinary from "../utils/cloudinary.js";
import User from "../models/user.model.js";
import Video from "../models/video.model.js";
import Comment from "../models/comments.model.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registerUser = async (req, res) => {
  // get all the info from body
  const { email, phone, password, channelName } = req.body;

  // get file path from req.file
  const filePath = req.files.logo.tempFilePath;

  // check for empty fields
  if (!email || !phone || !password || !channelName || !filePath) {
    return res.status(409).json({ message: "Empty Fields, All fields are required", success: false });
  }

  // test email using regex
  if (!emailRegex.test(email)) {
    return res.status(409).json({ message: "Invalid Email Format Received", success: false });
  }

  try {
    // check if email or phone is taken
    const isTaken = await User.findOne({
      $or: [{ email }, { phone }, { channelName }],
    });
    if (isTaken) return res.status(400).json({ message: "Credentials are already taken", success: false });

    // hash the password
    if (password.length < 6)
      return res.status(400).json({ message: "Password should be atleast 6 charcters long", success: false });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // upload the logo to cloudinary
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.logo.tempFilePath, {
      resource_type: "image",
      folder: "video-streaming-service-api/pfps",
    });

    // create the new user
    const newUSer = await User.create({
      email,
      phone,
      channelName,
      logoID: public_id,
      logoUrl: secure_url,
      password: hashedPassword,
    });

    if (!newUSer) return res.status(500).json({ message: "Failed to Create New User", success: false });

    res.status(201).json({ message: "New User Created Successfully", userData: newUSer, success: true });
  } catch (error) {
    console.log(`Error in Registering User ${error.message || error}`);
    res.status(500).json({ message: "Unable to Register User Right Now Try Again Later", success: false });
  }
};

const loginUser = async (req, res) => {
  // get all the info from body
  const { email, password } = req.body;

  // check for empty fields
  if (!email || !password) {
    return res.status(409).json({ message: "Empty Fields, All fields are required", success: false });
  }

  // test email using regex
  if (!emailRegex.test(email)) {
    return res.status(409).json({ message: "Invalid Email Format Received", success: false });
  }

  try {
    // check if this user exist
    const findUser = await User.findOne({ email });
    if (!findUser) return res.status(404).json({ message: "User does not exist", success: false });

    // compare the passwords
    const isPassValid = await bcrypt.compare(password, findUser.password);
    if (!isPassValid) return res.status(409).json({ message: "Incorrect Email or Password", success: false });

    // create a token/cookie if above all checks passed
    const token = jwt.sign({ ID: findUser._id, email: findUser.email }, process.env.JWT_SECRET, { expiresIn: "10d" });

    // set the cookie in users browser
    res.cookie("jwt", token, { httpOnly: true, maxAge: 10 * 24 * 60 * 60 * 1000 });

    // send the final response
    res.status(200).json({
      message: "User Logged In Successfully",
      userData: { ...findUser._doc, password: null },
      token,
      success: true,
    });
  } catch (error) {
    console.log(`Error in Login User ${error.message || error}`);
    res.status(500).json({
      message: "Unable to Login User Right Now Try Again Later",
      error: error.message || error,
      success: false,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.cookie("jwt", null, {
      maxAge: 0,
      httpOnly: true,
    });

    res.status(200).json({ message: "User Logged Out Successfully", success: true });
  } catch (error) {
    console.log(`Error in Logout User ${error.message || error}`);
    res.status(500).json({
      message: "Unable to Logout User Right Now Try Again Later",
      error: error.message || error,
      success: false,
    });
  }
};

const updateUserProfile = async (req, res) => {
  const { channelName, password, email } = req.body;
  // no empty field check if empty put the old fields

  try {
    // find the user
    const findUser = await User.findById(req.user.ID);
    if (!findUser) return res.status(404).json({ message: "User Not Found", success: false });

    // verify email format
    if (!emailRegex.test(email)) return res.status(409).json({ message: "Invalid Email Provided", success: false });

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // create the object of updated data
    const updateData = { email, password: hashPassword, channelName };

    // if new image provided update and cleanup the cloud strage
    if (req.files && req.files.logo) {
      const newLogo = await cloudinary.uploader.upload(req.files.logo.tempFilePath, {
        resource_type: "image",
        folder: "video-streaming-service-api/pfps",
      });

      updateData.logoUrl = newLogo.secure_url;
      updateData.logoID = newLogo.public_id;

      // destroy the old image
      await cloudinary.uploader.destroy(findUser.logoID, { resourse_type: "image" });
    }

    // save the changes and send the updated data in response
    const updatedUser = await User.findByIdAndUpdate(req.user.ID, { updateData }, { new: true });

    res.status(200).json({ message: "User Updated Successfully", success: true, data: updatedUser });
  } catch (error) {
    console.log(`Error in Updatinng User ${error.message || error}`);
    res.status(500).json({
      message: "Unable to Update User Right Now Try Again Later",
      error: error.message || error,
      success: false,
    });
  }
};

const deleteUser = async (req, res) => {
  const userID = req.user.ID;

  try {
    // find the USer
    const findUser = await User.findById(userID);
    if (!findUser) return res.status(404).json({ message: "User not found", success: false });

    // remove the pfp of user from cloud
    await cloudinary.uploader.destroy(findUser.logoID, { resource_type: "image" });

    // find all videos uploaded by the user and delete them from cloud
    const videosUploaded = await Video.find({ userID });
    for (const video of videosUploaded) {
      await cloudinary.uploader.destroy(video.thumbnailID, { resource_type: "image" });
      await cloudinary.uploader.destroy(video.videoID, { resource_type: "video" });
    }

    // remove all videos entry from DB
    await Video.deleteMany({ userID });

    // Remove likes/dislikes from all videos
    await Video.updateMany({ likedBy: userID }, { $pull: { likedBy: userID } });
    await Video.updateMany({ dislikedBy: userID }, { $pull: { dislikedBy: userID } });

    // Remove all comments done by this user
    await Comment.deleteMany({ userID });

    // Remove subscriptions where this user was subscribed to others
    await User.updateMany({ subscribedChannels: userID }, { $pull: { subscribedChannels: userID } });

    // Remove all subscribers from this user's channel
    await User.updateMany(
      { _id: { $in: findUser.subscribedChannels } }, // Finds all users in his subscribed channels array
      { $inc: { subscriber: -1 } }, // Decrease subscriber count by 1 for each channel in his array
    );

    // Delete user from DB
    await User.findByIdAndDelete(userID);

    res.status(200).json({ message: "User deleted successfully", success: true });
  } catch (error) {
    console.log(`Error in Deleting User ${error.message || error}`);
    res.status(500).json({
      message: "Unable to Delete User Right Now Try Again Later",
      error: error.message || error,
      success: false,
    });
  }
};

const subscribeToChannel = async (req, res) => {
  try {
    // userID -> current user && channnelId -> userID of that channel's owner
    const userID = req.user.ID;
    const { channelID } = req.params;

    // u cant subscribe to yourself
    if (userID == channelID)
      return res.status(403).json({ messsage: "You Cant Subscribe To Yourself", success: false });

    // check if already subscribed
    const check = await User.findById(userID);
    if (check.subscribedChannels.some((id) => id.toString() === channelID)) {
      return res.status(403).json({ message: "Already Subscribed", success: false });
    }

    // add to the subscribe array
    const currentUser = await User.findByIdAndUpdate(
      userID,
      { $addToSet: { subscribedChannels: channelID } },
      { new: true },
    ).select("-password");

    // inc the sub count
    const subscribedChannel = await User.findByIdAndUpdate(
      channelID,
      { $inc: { subscriber: 1 } },
      { new: true },
    ).select("-password");

    //final response
    res.status(200).json({
      message: `Subscribed to ${subscribedChannel.channelName} successfully`,
      success: true,
      data: { user: currentUser, channel: subscribedChannel },
    });
  } catch (error) {
    console.log(`Error in Subscribing to Channel ${error.message || error}`);
    res.status(500).json({
      message: "Unable to Subscribe Right Now Try Again Later",
      error: error.message || error,
      success: false,
    });
  }
};

const unsubscribeToChannel = async (req, res) => {
  try {
    const userID = req.user.ID;
    const { channelID } = req.params;

    const findUser = await User.findById(userID).select("-password");
    if (!findUser) return res.status(403).json({ message: "Request Denied", success: false });

    // check if they are already subscribed
    if (!findUser.subscribedChannels.includes(channelID)) {
      return res.status(400).json({ message: "Not Subscribed to This Channel", success: false });
    }

    // Remove from subscribedChannels array
    await User.findByIdAndUpdate(userID, { $pull: { subscribedChannels: channelID } });

    // Decrease the subscriber count
    await User.findByIdAndUpdate(channelID, { $inc: { subscriber: -1 } });

    // final response
    res.status(200).json({ message: `Unsubscribed successfully`, success: true });
  } catch (error) {
    console.log(`Error in Unsubscribing to Channel ${error.message || error}`);
    res.status(500).json({
      message: "Unable to Unsubscribe Right Now Try Again Later",
      error: error.message || error,
      success: false,
    });
  }
};

export { registerUser, loginUser, logoutUser, updateUserProfile, subscribeToChannel, unsubscribeToChannel, deleteUser };
