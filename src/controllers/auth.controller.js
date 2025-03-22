import bcrypt from "bcrypt";

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
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.logo.tempFilePath);

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

const loginUser = async (req, res) => {};

const logoutUser = async (req, res) => {};

export { registerUser };
