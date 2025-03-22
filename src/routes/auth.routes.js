import { Router } from "express";

const router = Router();

import { registerUser, loginUser, logoutUser } from "../controllers/auth.controller.js";

import { checkAuth } from "../middlewares/auth.middleware.js";

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/logout", checkAuth, logoutUser);

export default router;
