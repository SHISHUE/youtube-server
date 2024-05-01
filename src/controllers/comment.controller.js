import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getVideoComments = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) return res.status(401, "Video id is require");

  try {
    // Find all comments for the specified videoId
    const comments = await Comment.aggregatePaginate(
      { video: videoId }, // Filter by videoId
      { page: page, limit: limit, populate: "owner", sort: { createdAt: -1 } } // Pagination options
    );

    res
      .status(200)
      .json(new ApiResponse(200, comments, "Comments retrieved successfully."));
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});

export const addComment = asyncHandler(async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { comment } = req.body;
    const userId = req.user._id;

    if (!videoId || !comment || !userId) {
      throw new ApiError(400, "Missing required parameters.");
    }

    // Create the comment
    const userComment = await Comment.create({
      content: comment,
      video: videoId,
      owner: userId,
    });

    res.status(200).json(new ApiResponse(200, userComment, "Comment added successfully."));
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});


export const updateComment = asyncHandler(async (req, res, next) => {
  const { comment } = req.body;
  const userId = req.user._id;

  try {
    if (!comment || !userId) {
      throw new ApiError(400, "Comment content or user ID is missing.");
    }

    // Find the comment by owner (userId)
    const updatedComment = await Comment.findOneAndUpdate(
      { _id: req.params.commentId, owner: userId }, // Added commentId parameter to specify which comment to update
      { $set: { content: comment } },
      { new: true }
    );

    if (!updatedComment) {
      throw new ApiError(404, "Comment not found or user not authorized to update.");
    }

    res.status(200).json(new ApiResponse(200, updatedComment, "Comment updated successfully."));
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});


export const deleteComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  try {
    if (!commentId || !userId) {
      throw new ApiError(401, "Comment id or user id not provided.");
    }

    // Find and delete the comment by id and owner (userId)
    const deletedComment = await Comment.findOneAndDelete({
      _id: commentId,
      owner: userId,
    });

    if (!deletedComment) {
      throw new ApiError(404, "Comment not found or user not authorized.");
    }

    res
      .status(200)
      .json(new ApiResponse(200, null, "Comment deleted successfully."));
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});

