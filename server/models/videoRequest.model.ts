import mongoose, { Document, Schema } from "mongoose";

export interface IVideoRequest extends Document {
  useCase: string;
  prompt: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "TIMEOUT";
  videoUrl?: string;
  operationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const videoRequestSchema = new Schema(
  {
    useCase: { type: String, required: true },
    prompt: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "RUNNING", "COMPLETED", "FAILED", "TIMEOUT"],
      default: "PENDING",
    },
    videoUrl: { type: String },
    operationId: { type: String },
  },
  { timestamps: true }
);

const VideoRequest = mongoose.model<IVideoRequest>(
  "VideoRequest",
  videoRequestSchema
);

export default VideoRequest;
