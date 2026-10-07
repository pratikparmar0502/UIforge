import mongoose from 'mongoose';

const generationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
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
      default: 'pending',
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

const Generation = mongoose.model('Generation', generationSchema);

export default Generation;
