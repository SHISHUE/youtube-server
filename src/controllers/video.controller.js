import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/apiError.js";


export const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  // Define the query object based on the request parameters
  const queryObj = {};
  if (query) {
      queryObj.$or = [
          { title: { $regex: query, $options: "i" } }, // Case-insensitive search on title
          { description: { $regex: query, $options: "i" } }, // Case-insensitive search on description
      ];
  }


  // Define the sort object based on the request parameters
  const sortObj = {};
  if (sortBy && sortType) {
      sortObj[sortBy] = sortType === "asc" ? 1 : -1;
  }

  try {
      // Query videos with pagination, filtering, and sorting
      const options = {
          page: parseInt(page),
          limit: parseInt(limit),
          sort: sortObj,
      };
      const videos = await Video.aggregatePaginate(queryObj, options);

      // Send the response
      res.status(200).json(new ApiResponse(200, videos, "Here your videos. "));
  } catch (error) {
      // Handle errors
      res.status(500).json({ message: "Server Error" });
  }
});


export const publishAVideo = asyncHandler(async (req, res, next) => {
  const { title, description } = req.body;
  const userId = req.user?._id;

  try {
    if (!title || !description) {
      throw new ApiError(
        400,
        "Please provide title and description of a video"
      );
    }

    if (!userId) {
      throw new ApiError(401, "Please log in first, user not found");
    }

    // Check if required files are uploaded
    if (
      !req.files ||
      !req.files.videoFile ||
      req.files.videoFile.length === 0
    ) {
      throw new ApiError(400, "Video file is required");
    }

    const videoPath = req.files.videoFile[0].path;
    const thumbnailPath =
      req.files.thumbnailPath && req.files.thumbnailPath.length > 0
        ? req.files.thumbnailPath[0].path
        : null;

    if (!videoPath) {
      throw new ApiError(400, "Video file path is missing");
    }

    const video = await uploadOnCloudinary(videoPath);
    const thumbnail = thumbnailPath
      ? await uploadOnCloudinary(thumbnailPath)
      : null;

    const videoInDb = await Video.create({
      videoFile: video.url,
      thumbnail: thumbnail ? thumbnail.url : null,
      owner: userId,
      title,
      description,
      duration: video.duration,
    });

    res.status(200).json({
      status: 200,
      data: videoInDb,
      message: "Video uploaded successfully",
    });
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});

export const getVideoById = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;

  try {
    if (!videoId) {
      throw new ApiError(404, "Video id not found.");
    }

    const video = await Video.findOne({ _id: videoId });

    if (!video) {
      throw new ApiError(404, "Video not found.");
    }

    res.status(200).json({
      status: 200,
      data: video,
      message: "Video found.",
    });
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});

export const updateVideo = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;
  // console.log(req.body, req.file)
  const { title, description } = req.body;
  const thumbnail = req.file?.thumbnail?.path;
  try {
    if (!videoId) {
      throw new ApiError(404, "Video id not found.");
    }

    // Find the video by id
    let updateObj = {};
    if (title || description || thumbnail) {
      updateObj = {};
      if (title) {
        updateObj.title = title;
      }
      if (description) {
        updateObj.description = description;
      }
      if (thumbnail) {
        // Delete previous thumbnail from Cloudinary
        const prevVideo = await Video.findById(videoId);
        if (prevVideo.thumbnail) {
          await deleteFromCloudinary(prevVideo.thumbnail);
        }
        updateObj.thumbnail = thumbnail;
      }
    } else {
      throw new ApiError(400, "No fields provided for update.");
    }

    // Update the video in the database
    const updatedVideo = await Video.findOneAndUpdate(
      { _id: videoId },
      updateObj,
      { new: true }
    );

    res.status(200).json({
      status: 200,
      data: updatedVideo,
      message: "Video updated successfully.",
    });
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});

export const deleteVideo = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;

  try {
    if (!videoId) {
      throw new ApiError(401, "Please provide videoId.");
    }

    // Find the video by id
    const video = await Video.findById(videoId);

    if (!video) {
      throw new ApiError(404, "Video not found.");
    }

    // Delete the thumbnail from Cloudinary if it exists
    if (video.thumbnail) {
      await deleteFromCloudinary(video.thumbnail);
    }

    if (video.videoFile) {
      await deleteFromCloudinary(video.videoFile);
    }

    // Delete the video from the database
    await Video.deleteOne({ _id: videoId });

    res.status(200).json({
      status: 200,
      message: "Video deleted successfully.",
    });
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});

export const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(401, "Video id not found");
  }

  // Find the video by id
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Toggle the isPublished status
  video.isPublished = !video.isPublished;

  // Save the updated video
  await video.save();

  res.status(200).json(new ApiResponse(200, video, "Video status successfully changed"));
});

