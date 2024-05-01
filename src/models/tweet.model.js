import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      maxlength: 280, // Example: Limiting content to 280 characters
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // Ensuring owner is always provided
    },
  },
  { timestamps: true }
);

// Adding indexes for potential query performance improvement
tweetSchema.index({ owner: 1 });
tweetSchema.index({ createdAt: -1 }); // Example: Indexing createdAt field for sorting by latest tweets

export const Tweet = mongoose.model("Tweet", tweetSchema);

// Example of populating related fields
// Tweet.find().populate('owner').exec((err, tweets) => {
//   // Handle populated tweets
// });
