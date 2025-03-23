import { Router } from "express";

const router = Router();

import { uploadVideo, updateVideo } from "../controllers/video.controller.js";

import { checkAuth } from "../middlewares/auth.middleware.js";

router.post("/upload", checkAuth, uploadVideo);

router.patch("/update/:videoID", checkAuth, updateVideo);

export default router;
