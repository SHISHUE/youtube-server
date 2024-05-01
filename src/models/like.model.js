import mongoose, { Schema } from 'mongoose';

const likeSchema = new Schema({
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    },
    tweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tweet"
    },
    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true // Example: Ensuring 'likedBy' is always provided
    },
}, { timestamps: true });

// Adding indexes
likeSchema.index({ video: 1 });
likeSchema.index({ comment: 1 });
likeSchema.index({ tweet: 1 });
likeSchema.index({ likedBy: 1 });

export const Like = mongoose.model("Like", likeSchema);
