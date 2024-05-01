import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const toggleVideoLike = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  try {
    if (!videoId || !userId) {
      throw new ApiError(401, "Video id or user id not provided.");
    }

    // Check if the user has already liked the video
    const existingLike = await Like.findOne({
      video: videoId,
      likedBy: userId,
    });

    if (existingLike) {
      // If the user has already liked the video, remove the like
      await Like.findOneAndDelete({ video: videoId, likedBy: userId });
      res.status(200).json(new ApiResponse(200, null, "Video like removed."));
    } else {
      // If the user has not liked the video, add a new like
      const newLike = await Like.create({ video: videoId, likedBy: userId });
      res.status(200).json(new ApiResponse(200, newLike, "Video liked."));
    }
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});

export const toggleCommentLike = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  try {
    if (!commentId || !userId) {
      throw new ApiError(401, "Comment id or user id not provided.");
    }

    // Check if the user has already liked the comment
    const existingLike = await Like.findOne({
      comment: commentId,
      likedBy: userId,
    });

    if (existingLike) {
      // If the user has already liked the comment, remove the like
      await Like.findOneAndDelete({ comment: commentId, likedBy: userId });
      res.status(200).json(new ApiResponse(200, null, "Comment like removed."));
    } else {
      // If the user has not liked the comment, add a new like
      const newLike = await Like.create({
        comment: commentId,
        likedBy: userId,
      });
      res.status(200).json(new ApiResponse(200, newLike, "Comment liked."));
    }
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});

export const toggleTweetLike = asyncHandler(async (req, res, next) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  try {
    if (!tweetId || !userId) {
      throw new ApiError(401, "Tweet id or user id not provided.");
    }

    // Check if the user has already liked the tweet
    const existingLike = await Like.findOne({
      tweet: tweetId,
      likedBy: userId,
    });

    if (existingLike) {
      // If the user has already liked the tweet, remove the like
      await Like.findOneAndDelete({ tweet: tweetId, likedBy: userId });
      res.status(200).json(new ApiResponse(200, null, "Tweet like removed."));
    } else {
      // If the user has not liked the tweet, add a new like
      const newLike = await Like.create({ tweet: tweetId, likedBy: userId });
      res.status(200).json(new ApiResponse(200, newLike, "Tweet liked."));
    }
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});

export const getLikedVideos = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  try {
    if (!userId) {
      throw new ApiError(401, "User id not provided.");
    }

    // Find all likes by the user
    const likedVideos = await Like.find({
      likedBy: userId,
      video: { $exists: true },
    }).populate("video");

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          likedVideos,
          "Liked videos retrieved successfully."
        )
      );
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});

