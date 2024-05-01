import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateRefreshTokenAndAccessTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while genrating refresh and access token "
    );
  }
};

//Register User
export const registerUser = asyncHandler(async (req, res) => {
  //fetch data
  const { username, fullname, email, password } = req.body;

  //verify data
  if (
    [fullname, username, email, password].some((field) => field?.trim() === "")
  ) {
    return res.status(400).json({
      success: false,
      message: "Please fill all details. ",
    });
  }

  //verify user its mean check database user not register already
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already existed. ");
  }

  //avatar and coverImage upload
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required. ");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required. ");
  }

  //DB entry
  const user = await User.create({
    username: username.toLowerCase(),
    fullname,
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password,
  });

  //remove the password and refreshToken
  const createUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createUser) {
    throw new ApiError(500, "Something went wrong while creating user");
  }

  // response
  return res
    .status(201)
    .json(new ApiResponse(200, createUser, "User Registed successfully"));
});

//log in
export const loginUser = asyncHandler(async (req, res) => {
  //fetch data like email password ager username se krna hai to woh
  const { email, password, username } = req.body;
  //verify the fetch data is correct or not
  if (!(email || username)) {
    return res.status(400).json({
      success: false,
      message: "username or email required",
    });
  }

  //check database user exited or not
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "password is incorrect !");
  }

  const { accessToken, refreshToken } =
    await generateRefreshTokenAndAccessTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const option = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
  //return res
});

//log out
export const logoutUser = asyncHandler(async (req, res) => {
  const { userId } = req.user._id;

  await User.findByIdAndUpdate(
    userId,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, "User logged out successfully. "));
});

//refresh Access Token
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request .");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token expired or used ");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } =
      await generateRefreshTokenAndAccessTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access Token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

//change password
export const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(401, "Please fill all the require fields");
  }

  const userId = req.user?._id;

  const user = await User.findById(userId);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid password");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "Password changed successfully. "));
});

//get user
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(404, "User not find in middleware.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Here your current user ."));
});

//change some info.
export const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(400, "All fields are require.");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname: fullname,
        email: email,
      },
    },
    { new: true }
  ).select("-password ");

  if (!user) throw new ApiError(404, "user not found");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "FullName Email updated Successfully. "));
});

//change files
export const changeAvatar = asyncHandler(async (req, res, next) => {
  const avatarLocalPath = req.file?.path;

  try {
    if (!avatarLocalPath) {
      throw new ApiError(401, "Avatar is required.");
    }

    // Find the user by id to get the existing avatar URL
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    // Delete the existing avatar from Cloudinary if it exists
    if (user.avatar) {
      await deleteFromCloudinary(user.avatar);
    }

    // Upload the new avatar to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar?.url) {
      throw new ApiError(401, "Avatar URL not found.");
    }

    // Update the user's avatar URL in the database
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { avatar: avatar.url } },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      throw new ApiError(404, "User not found.");
    }

    res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "Avatar updated successfully."));
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});

//change coverImage
export const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  try {
    if (!coverImageLocalPath) {
      throw new ApiError(401, "Cover image is required.");
    }

    // Find the user by id to get the existing cover image URL
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    // Delete the existing cover image from Cloudinary if it exists
    if (user.coverImage) {
      await deleteFromCloudinary(user.coverImage);
    }

    // Upload the new cover image to Cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage?.url) {
      throw new ApiError(401, "Cover image URL not found.");
    }

    // Update the user's cover image URL in the database
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { coverImage: coverImage.url } },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      throw new ApiError(404, "User not found.");
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, updatedUser, "Cover image updated successfully.")
      );
  } catch (error) {
    next(error); // Pass the error to Express's error handling middleware
  }
});

//user channel profile
export const getUserChannelProfile = asyncHandler(async (req, res) => {
  console.log("INSIDE GET CHANNEL ");
  try {
    const { username } = req.params;
    console.log(req.params);
    if (!username?.trim()) throw new ApiError(400, "Username not found. ");

    const channel = await User.aggregate([
      {
        $match: {
          username: username?.toLowerCase(),
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribedTo",
        },
      },
      {
        $addFields: {
          subscribersCount: {
            $size: "$subscribers",
          },
          channelsSubscribedToCount: {
            $size: "$subscribedTo",
          },
          isSubscribed: {
            $condition: {
              if: { $in: [req.user?._id, "$subscribers.subscriber"] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          fullname: 1,
          username: 1,
          subscribersCount: 1,
          channelsSubscribedToCount: 1,
          isSubscribed: 1,
          avatar: 1,
          coverImage: 1,
          email: 1,
        },
      },
    ]);

    if (!channel?.length) throw new ApiError(404, "channel does not exists");

    return res
      .status(200)
      .json(
        new ApiResponse(200, channel, "User channel fetched successfully. ")
      );
  } catch (error) {
    return new ApiError(500, error.message);
  }
});

//Get Watch History
export const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch History get successfully"
      )
    );
});
