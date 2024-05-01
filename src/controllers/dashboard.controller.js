import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { SubScription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  try {
    // Get total video views
    const totalVideoViews = await Video.aggregate([
      { $match: { owner: userId } },
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);

    // Get total subscribers
    const totalSubscribers = await SubScription.countDocuments({
      channel: userId,
    });

    // Get total videos
    const totalVideos = await Video.countDocuments({ owner: userId });

    // Get total likes
    const totalLikes = await Like.countDocuments({
      video: {
        $in: (await Video.find({ owner: userId })).map((video) => video._id),
      },
    });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          totalVideoViews:
            totalVideoViews.length > 0 ? totalVideoViews[0].totalViews : 0,
          totalSubscribers,
          totalVideos,
          totalLikes,
        },
        "Channel stats retrieved successfully."
      )
    );
  } catch (error) {
    next(error);
  }
});

const getChannelVideos = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  try {
    const videos = await Video.find({ owner: userId });

    res
      .status(200)
      .json(
        new ApiResponse(200, videos, "Channel videos retrieved successfully.")
      );
  } catch (error) {
    next(error);
  }
});

export { getChannelStats, getChannelVideos };
