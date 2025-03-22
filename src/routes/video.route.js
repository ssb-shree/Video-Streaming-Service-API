import { Router } from "express";

const router = Router();

import { uploadVideo } from "../controllers/video.controller.js";

import { checkAuth } from "../middlewares/auth.middleware.js";

router.post("/upload", checkAuth, uploadVideo);

export default router;
