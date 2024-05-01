import { asyncHandler } from "../utils/asyncHandler.js";

export const healthcheck = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Health check successful.",
  });
});

