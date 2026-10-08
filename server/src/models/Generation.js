import mongoose from "mongoose";

export const GENERATION_STATUSES = [
  "pending",
  "analyzing",
  "analyzed",
  "generating",
  "completed",
  "failed",
];

const generationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      index: true,
    },
    screenshot: {
      type: String,
    },
    uiSpecification: {
      type: mongoose.Schema.Types.Mixed,
    },
    generatedCode: {
      type: String,
    },
    prompt: {
      type: String,
    },
    model: {
      type: String,
    },
    status: {
      type: String,
      enum: GENERATION_STATUSES,
      default: "pending",
    },
    analysisError: {
      type: String,
    },
    framework: {
      type: String,
      default: "react",
    },
    styling: {
      type: String,
      default: "tailwind",
    },
  },
  { timestamps: true },
);

const Generation = mongoose.model("Generation", generationSchema);

export default Generation;
