import { Router } from "express";

const router = Router();

import {
  registerUser,
  loginUser,
  logoutUser,
  updateUserProfile,
  subscribeToChannel,
} from "../controllers/user.controller.js";

import { checkAuth } from "../middlewares/auth.middleware.js";

router.post("/auth/register", registerUser);

router.post("/auth/login", loginUser);

router.get("/auth/logout", checkAuth, logoutUser);

router.put("/auth/update", checkAuth, updateUserProfile);

router.post("/subscribe/:channelID", subscribeToChannel);

export default router;
