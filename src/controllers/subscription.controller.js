import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { SubScription } from "../models/subscription.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubScription = asyncHandler(async (req, res, next) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  try {
    // Check if the provided channelId is a valid ObjectId
    if (!isValidObjectId(channelId)) {
      throw new ApiError(400, "Invalid channelId.");
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    // Check if the channel exists
    const channel = await User.findById(channelId);
    if (!channel) {
      throw new ApiError(404, "Channel not found.");
    }

    // Check if the user is already subscribed to the channel
    const existingSubScription = await SubScription.findOne({
      subscriber: userId,
      channel: channelId,
    });

    if (existingSubScription) {
      // If already subscribed, unsubscribe
      await existingSubScription.remove();
      res
        .status(200)
        .json(new ApiResponse(200, null, "Unsubscribed successfully."));
    } else {
      // If not subscribed, subscribe
      const newSubScription = new SubScription({
        subscriber: userId,
        channel: channelId,
      });
      await newSubScription.save();
      res
        .status(200)
        .json(new ApiResponse(200, null, "Subscribed successfully."));
    }
  } catch (error) {
    next(error);
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res, next) => {
  const { channelId } = req.params;

  try {
    // Check if the provided channelId is a valid ObjectId
    if (!isValidObjectId(channelId)) {
      throw new ApiError(400, "Invalid channelId.");
    }

    // Find all SubScriptions for the channel
    const subscribers = await SubScription.find({
      channel: channelId,
    }).populate("subscriber", "username");

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscribers,
          "Channel subscribers retrieved successfully."
        )
      );
  } catch (error) {
    next(error);
  }
});

const getSubscribedChannels = asyncHandler(async (req, res, next) => {
  const { subscriberId } = req.params;

  try {
    // Check if the provided subscriberId is a valid ObjectId
    if (!isValidObjectId(subscriberId)) {
      throw new ApiError(400, "Invalid subscriberId.");
    }

    // Find all SubScriptions for the subscriber
    const SubScriptions = await SubScription.find({
      subscriber: subscriberId,
    }).populate("channel", "username");

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          SubScriptions,
          "Subscribed channels retrieved successfully."
        )
      );
  } catch (error) {
    next(error);
  }
});

export { toggleSubScription, getUserChannelSubscribers, getSubscribedChannels };
