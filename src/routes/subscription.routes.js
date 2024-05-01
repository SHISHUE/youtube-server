import { Router } from "express";
import {
  toggleSubScription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Route to toggle subscription for a channel
router.route("/:channelId").post(verifyJWT, toggleSubScription);

// Route to get subscribers of a channel
router
  .route("/channel/:channelId/subscribers")
  .get(getUserChannelSubscribers);

// Route to get channels subscribed by a user
router.route("/user/:subscriberId").get(getSubscribedChannels);

export default router;
