import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-aggregate-paginate-v2';

const { Schema } = mongoose;

const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
        maxlength: 1000, // Example: Limiting content to 1000 characters
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

// Adding index example
commentSchema.index({ video: 1 }); // Indexing 'video' field for faster queries

commentSchema.plugin(mongoosePaginate);

export const Comment = mongoose.model('Comment', commentSchema);

