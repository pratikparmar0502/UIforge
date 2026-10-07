import { Router } from 'express';
import {
  createGeneration,
  getGenerationById,
} from '../controllers/generation.controller.js';
import { uploadScreenshot } from '../middleware/screenshot-upload.middleware.js';

const generationRouter = Router();

generationRouter.post('/', uploadScreenshot.single('screenshot'), createGeneration);
generationRouter.get('/:id', getGenerationById);

export default generationRouter;
