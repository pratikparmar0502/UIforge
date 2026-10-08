import { Router } from 'express';
import {
  analyzeGeneration,
  createGeneration,
  getGenerationById,
} from '../controllers/generation.controller.js';
import { aiAnalysisRateLimit } from '../middleware/ai-analysis-rate-limit.middleware.js';
import { uploadScreenshot } from '../middleware/screenshot-upload.middleware.js';

const generationRouter = Router();

generationRouter.post('/', uploadScreenshot.single('screenshot'), createGeneration);
generationRouter.post('/:id/analyze', aiAnalysisRateLimit, analyzeGeneration);
generationRouter.get('/:id', getGenerationById);

export default generationRouter;
