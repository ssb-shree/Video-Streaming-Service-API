import { Router } from "express";

const router = Router();

import {
  registerUser,
  loginUser,
  logoutUser,
  updateUserProfile,
  subscribeToChannel,
  unsubscribeToChannel,
} from "../controllers/user.controller.js";

import { checkAuth } from "../middlewares/auth.middleware.js";

router.post("/auth/register", registerUser);

router.post("/auth/login", loginUser);

router.get("/auth/logout", checkAuth, logoutUser);

router.put("/auth/update", checkAuth, updateUserProfile);

router.post("/subscribe/:channelID", checkAuth, subscribeToChannel);

router.post("/unsubscribe/:channelID", checkAuth, unsubscribeToChannel);

export default router;
