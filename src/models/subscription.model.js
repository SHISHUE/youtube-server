import mongoose, { Schema } from "mongoose";

const subScriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // Ensuring subscriber is always provided
    },

    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // Ensuring channel is always provided
    },
  },
  { timestamps: true }
);

// Adding indexes for potential query performance improvement
subScriptionSchema.index({ subscriber: 1 });
subScriptionSchema.index({ channel: 1 });

export const SubScription = mongoose.model("SubScription", subScriptionSchema);
