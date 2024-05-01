import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiResponse} from '../utils/ApiResponse.js'

export const createPlaylist = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;
  const userId = req.user._id;

  try {
    if (!name || !description || !userId) {
      throw new ApiError(400, "Name, description, or user id not provided.");
    }

    // Create a new playlist
    const newPlaylist = await Playlist.create({
      name,
      description,
      owner: userId,
    });

    res
      .status(201)
      .json(
        new ApiResponse(201, newPlaylist, "Playlist created successfully.")
      );
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});

export const getUserPlaylists = asyncHandler(async (req, res, next) => {
  const  userId  = req.user._id;

  try {
    if (!userId) {
      throw new ApiError(400, "User id not provided.");
    }

    // Find all playlists owned by the user
    const playlists = await Playlist.find({ owner: userId });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          playlists,
          "User playlists retrieved successfully."
        )
      );
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});

export const getPlaylistById = asyncHandler(async (req, res, next) => {
  const { playlistId } = req.params;

  try {
    if (!playlistId) {
      throw new ApiError(400, "Playlist id not provided.");
    }

    // Find the playlist by id
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      throw new ApiError(404, "Playlist not found.");
    }

    res
      .status(200)
      .json(new ApiResponse(200, playlist, "Playlist retrieved successfully."));
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});

export const addVideoToPlaylist = asyncHandler(async (req, res, next) => {
  const { playlistId, videoId } = req.params;

  try {
    if (!playlistId || !videoId) {
      throw new ApiError(400, "Playlist id or video id not provided.");
    }

    // Find the playlist by id
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      throw new ApiError(404, "Playlist not found.");
    }

    // Add the video to the playlist's videos array
    playlist.videos.push(videoId);
    await playlist.save();

    res
      .status(200)
      .json(
        new ApiResponse(200, playlist, "Video added to playlist successfully.")
      );
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});

export const removeVideoFromPlaylist = asyncHandler(async (req, res, next) => {
  const { playlistId, videoId } = req.params;

  try {
    if (!playlistId || !videoId) {
      throw new ApiError(400, "Playlist id or video id not provided.");
    }

    // Find the playlist by id
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      throw new ApiError(404, "Playlist not found.");
    }

    // Remove the video from the playlist's videos array
    playlist.videos = playlist.videos.filter((v) => v.toString() !== videoId);
    await playlist.save();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          playlist,
          "Video removed from playlist successfully."
        )
      );
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});

export const deletePlaylist = asyncHandler(async (req, res, next) => {
  const { playlistId } = req.params;

  try {
    if (!playlistId) {
      throw new ApiError(400, "Playlist id not provided.");
    }

    // Find the playlist by id and delete it
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if (!deletedPlaylist) {
      throw new ApiError(404, "Playlist not found.");
    }

    res
      .status(200)
      .json(new ApiResponse(200, null, "Playlist deleted successfully."));
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});

export const updatePlaylist = asyncHandler(async (req, res, next) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  try {
    if (!playlistId) {
      throw new ApiError(400, "Playlist id not provided.");
    }

    if (!name || !description) {
      throw new ApiError(400, "Name or description is missing.");
    }

    // Find the playlist by id and update its name and description
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      { name, description },
      { new: true }
    );

    if (!updatedPlaylist) {
      throw new ApiError(404, "Playlist not found.");
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, updatedPlaylist, "Playlist updated successfully.")
      );
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});
