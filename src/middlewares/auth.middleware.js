import jwt from "jsonwebtoken";

export const checkAuth = async (req, res, next) => {
  try {
    // get the token/cookie from the user
    const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No Token is provided", success: false });

    // decode the token/cookie
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedUser) return res.status(404).json({ message: "Invalid Token Provided", success: false });

    // attach the decoded info to req object
    req.user = decodedUser;

    // call the next middleware
    next();
  } catch (error) {
    console.log(`Error in Authentication User ${error.message || error}`);
    res.status(500).json({
      message: "Unable to Check Auth",
      error: error.message || error,
      success: false,
    });
  }
};
