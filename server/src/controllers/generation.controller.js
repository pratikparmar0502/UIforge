import mongoose from 'mongoose';
import Generation from '../models/Generation.js';
import Project from '../models/Project.js';
import { createPendingGeneration } from '../services/generation.service.js';
import { removeUploadedFile } from '../utils/file.utils.js';

function toGenerationResponse(generation) {
  return {
    id: generation.id,
    projectId: generation.projectId?.toString() ?? null,
    screenshot: generation.screenshot,
    status: generation.status,
    framework: generation.framework,
    styling: generation.styling,
    createdAt: generation.createdAt,
  };
}

async function sendUploadError(response, filePath, statusCode, message) {
  await removeUploadedFile(filePath);

  return response.status(statusCode).json({
    status: 'error',
    message,
  });
}

export async function createGeneration(request, response, next) {
  const { projectId, framework, styling } = request.body ?? {};
  const file = request.file;

  try {
    if (!file) {
      return response.status(400).json({
        status: 'error',
        message: 'Screenshot is required.',
      });
    }

    if (projectId) {
      if (!mongoose.isValidObjectId(projectId)) {
        return sendUploadError(response, file.path, 400, 'Invalid project ID.');
      }

      const project = await Project.exists({ _id: projectId });

      if (!project) {
        return sendUploadError(response, file.path, 404, 'Project not found.');
      }
    }

    const generation = await createPendingGeneration({
      projectId: projectId || undefined,
      screenshot: `/uploads/${file.filename}`,
      framework: framework || undefined,
      styling: styling || undefined,
    });

    return response.status(201).json({
      message: 'Generation created successfully.',
      generation: toGenerationResponse(generation),
    });
  } catch (error) {
    await removeUploadedFile(file?.path);
    return next(error);
  }
}

export async function getGenerationById(request, response, next) {
  try {
    const { id } = request.params;

    if (!mongoose.isValidObjectId(id)) {
      return response.status(400).json({
        status: 'error',
        message: 'Invalid generation ID.',
      });
    }

    const generation = await Generation.findById(id);

    if (!generation) {
      return response.status(404).json({
        status: 'error',
        message: 'Generation not found.',
      });
    }

    return response.status(200).json({
      generation: toGenerationResponse(generation),
    });
  } catch (error) {
    return next(error);
  }
}
