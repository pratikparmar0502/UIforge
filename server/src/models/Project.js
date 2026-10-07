import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    originalScreenshot: {
      type: String,
    },
    framework: {
      type: String,
      default: 'react',
    },
    styling: {
      type: String,
      default: 'tailwind',
    },
  },
  { timestamps: true },
);

const Project = mongoose.model('Project', projectSchema);

export default Project;
