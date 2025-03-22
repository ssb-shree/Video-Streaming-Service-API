import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import cloudinary from "../utils/cloudinary.js";

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

export { registerUser, loginUser, logoutUser };
