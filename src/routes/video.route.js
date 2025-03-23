import { Router } from "express";

const router = Router();

import { uploadVideo, updateVideo, deleteVideo, getAllVideos, getMyVideos } from "../controllers/video.controller.js";

import { checkAuth } from "../middlewares/auth.middleware.js";

router.post("/upload", checkAuth, uploadVideo);

router.patch("/update/:videoID", checkAuth, updateVideo);

router.delete("/delete/:videoID", checkAuth, deleteVideo);

router.get("/all", getAllVideos);

router.get("/my-videos", checkAuth, getMyVideos);

export default router;
