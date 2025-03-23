import { Router } from "express";

const router = Router();

import { checkAuth } from "../middlewares/auth.middleware.js";

import { createComment, editComment, deleteComment } from "../controllers/comment.controller.js";

router.post("/create", checkAuth, createComment);

router.post("/edit/:commentID", checkAuth, editComment);

router.post("/edit/:commentID", checkAuth, deleteComment);

export default router;
