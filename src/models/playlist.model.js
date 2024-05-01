import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true, // Ensuring owner is always provided
    },
  },
  { timestamps: true }
);

// Adding index example
playlistSchema.index({ owner: 1 }); // Indexing 'owner' field for faster queries

export const Playlist = mongoose.model("Playlist", playlistSchema);

// Example of populating related fields
// Playlist.find().populate('videos').populate('owner').exec((err, playlists) => {
//   // Handle populated playlists
// });
