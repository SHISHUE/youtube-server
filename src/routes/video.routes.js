import { Router } from "express";
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").get(getAllVideos); // Route to get all videos
router.route("/:videoId").get(getVideoById); // Route to get a specific video by ID

// Secured routes
router.route("/publish-video").post(
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnailPath", maxCount: 1 },
  ]),
  publishAVideo
); // Route to publish a video

router
  .route("/:videoId")
  .patch(verifyJWT, upload.single("thumbnail"), updateVideo); // Route to update a video
router.route("/:videoId").delete(verifyJWT, deleteVideo); // Route to delete a video
router
  .route("/:videoId/toggle-publish")
  .patch(verifyJWT, togglePublishStatus); // Route to toggle publish status of a video

export default router;
