import { Router } from "express";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Route to get channel statistics
router.route("/channel/stats").get(verifyJWT, getChannelStats);

// Route to get videos of a channel
router.route("/channel/videos").get(verifyJWT, getChannelVideos);

export default router;
