import mongoose from 'mongoose';
import Generation from '../models/Generation.js';
import Project from '../models/Project.js';
import { analyzeScreenshot } from '../services/ai/ai.service.js';
import {
  createPendingGeneration,
  GENERATION_STATUS,
  markGenerationAnalyzed,
  markGenerationAnalyzing,
  markGenerationFailed,
} from '../services/generation.service.js';
import { parseAndValidateUiSpecification } from '../services/ui-specification.validator.js';
import { AppError } from '../utils/app-error.js';
import { readScreenshotFile, removeUploadedFile } from '../utils/file.utils.js';

function toGenerationResponse(generation) {
  return {
    id: generation.id,
    projectId: generation.projectId?.toString() ?? null,
    screenshot: generation.screenshot,
    status: generation.status,
    framework: generation.framework,
    styling: generation.styling,
    uiSpecification: generation.uiSpecification ?? null,
    model: generation.model ?? null,
    createdAt: generation.createdAt,
    updatedAt: generation.updatedAt,
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

export async function analyzeGeneration(request, response, next) {
  const { id } = request.params;
  let analysis;
  let lockedForAnalysis = false;

  try {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Invalid generation ID.', 400, 'INVALID_GENERATION_ID');
    }

    const generation = await Generation.findById(id);

    if (!generation) {
      throw new AppError('Generation not found.', 404, 'GENERATION_NOT_FOUND');
    }

    if (generation.status === GENERATION_STATUS.analyzing) {
      throw new AppError(
        'Analysis is already in progress for this generation.',
        409,
        'ANALYSIS_IN_PROGRESS',
      );
    }

    if (!generation.screenshot) {
      throw new AppError(
        'Generation does not have a screenshot to analyze.',
        400,
        'SCREENSHOT_MISSING',
      );
    }

    const lockedGeneration = await markGenerationAnalyzing(id);

    if (!lockedGeneration) {
      throw new AppError(
        'Analysis is already in progress for this generation.',
        409,
        'ANALYSIS_IN_PROGRESS',
      );
    }

    lockedForAnalysis = true;

    const imageBuffer = await readScreenshotFile(generation.screenshot);
    analysis = await analyzeScreenshot({ imageBuffer });
    const uiSpecification = parseAndValidateUiSpecification(analysis.text);
    const updatedGeneration = await markGenerationAnalyzed(id, {
      uiSpecification,
      prompt: analysis.prompt,
      model: analysis.model,
    });

    return response.status(200).json({
      message: 'Screenshot analyzed successfully.',
      generation: toGenerationResponse(updatedGeneration),
    });
  } catch (error) {
    if (lockedForAnalysis) {
      await markGenerationFailed(id, {
        analysisError:
          error instanceof AppError
            ? `${error.code ?? 'ANALYSIS_FAILED'}: ${error.message}`
            : error.message || 'AI analysis failed.',
        prompt: analysis?.prompt,
        model: analysis?.model,
      });
    }

    if (error instanceof AppError) {
      return next(error);
    }

    console.error('Screenshot analysis failed:', error);
    return next(new AppError('AI analysis failed.', 502, 'ANALYSIS_FAILED'));
  }
}
