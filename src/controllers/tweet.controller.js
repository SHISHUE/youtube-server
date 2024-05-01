import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/apiError.js";
import {ApiResponse} from '../utils/ApiResponse.js'
import { asyncHandler } from "../utils/asyncHandler.js";

export const createTweet = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const userId = req.user._id;

  try {
    if (!content || !userId) {
      throw new ApiError(400, "Content or user id not provided.");
    }

    // Create a new tweet
    const newTweet = await Tweet.create({
      content,
      owner: userId,
    });

    res
      .status(201)
      .json(new ApiResponse(201, newTweet, "Tweet created successfully."));
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});

export const getUserTweets = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      throw new ApiError(400, "User id not provided.");
    }

    // Find all tweets owned by the user
    const tweets = await Tweet.find({ owner: userId });

    res
      .status(200)
      .json(
        new ApiResponse(200, tweets, "User tweets retrieved successfully.")
      );
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});

export const updateTweet = asyncHandler(async (req, res, next) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  try {
    if (!tweetId) {
      throw new ApiError(400, "Tweet id not provided.");
    }

    if (!content) {
      throw new ApiError(400, "Content is missing.");
    }

    // Find the tweet by id and update its content
    const updatedTweet = await Tweet.findByIdAndUpdate(
      tweetId,
      { content },
      { new: true }
    );

    if (!updatedTweet) {
      throw new ApiError(404, "Tweet not found.");
    }

    res
      .status(200)
      .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully."));
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});

export const deleteTweet = asyncHandler(async (req, res, next) => {
  const { tweetId } = req.params;

  try {
    if (!tweetId) {
      throw new ApiError(400, "Tweet id not provided.");
    }

    // Find the tweet by id and delete it
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if (!deletedTweet) {
      throw new ApiError(404, "Tweet not found.");
    }

    res
      .status(200)
      .json(new ApiResponse(200, null, "Tweet deleted successfully."));
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});
