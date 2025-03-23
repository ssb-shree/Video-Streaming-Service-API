import Comment from "../models/comments.model.js";

const createComment = async (req, res) => {
  try {
    const { videoID, text } = req.body;
    if (!videoID || !text) return res.status(403).json({ message: "Fields cant be empty", success: false });

    const newComment = await Comment.create({ videoID, userID: req.user.ID, text });
    if (!newComment) return res.status(500).json({ message: "Failed to create a new comment", success: false });

    res.status(200).json({ message: "Comment added successfully", success: true, data: newComment });
  } catch (error) {
    console.log(`Error in Commenting to Channel ${error.message || error}`);
    res.status(500).json({
      message: "Unable to Comment Right Now Try Again Later",
      error: error.message || error,
      success: false,
    });
  }
};

const editComment = async (req, res) => {
  try {
    const { commentID } = req.params;
    const { text } = req.body;

    if (!text) return res.status(403).json({ message: "Fields cant be empty", success: false });

    const updatedComment = await Comment.findByIdAndUpdate(commentID, { text }, { new: true });

    res.status(201).json({ message: "Comment Edited Successfully", success: true, data: updatedComment });
  } catch (error) {
    console.log(`Error in Editing Comment ${error.message || error}`);
    res.status(500).json({
      message: "Unable to Edit Comment Right Now Try Again Later",
      error: error.message || error,
      success: false,
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentID } = req.params;

    await Comment.findByIdAndDelete(commentID);

    res.status(201).json({ message: "Comment Deleted Successfully", success: true });
  } catch (error) {
    console.log(`Error in Deleting Comment ${error.message || error}`);
    res.status(500).json({
      message: "Unable to Delete Comment Right Now Try Again Later",
      error: error.message || error,
      success: false,
    });
  }
};

export { createComment, editComment, deleteComment };
