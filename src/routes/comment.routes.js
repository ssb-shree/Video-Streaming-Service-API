import { Router } from "express";

const router = Router();

import { checkAuth } from "../middlewares/auth.middleware.js";

import { createComment, editComment, deleteComment, getCommentsByVideo } from "../controllers/comment.controller.js";

router.post("/create", checkAuth, createComment);

router.put("/edit/:commentID", checkAuth, editComment);

router.delete("/delete/:commentID", checkAuth, deleteComment);

router.get("/get/:videoID", getCommentsByVideo);

export default router;
