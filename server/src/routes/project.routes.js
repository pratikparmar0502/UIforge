import { Router } from 'express';
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
} from '../controllers/project.controller.js';

const projectRouter = Router();

projectRouter.route('/').post(createProject).get(getProjects);
projectRouter.route('/:id').get(getProjectById).delete(deleteProject);

export default projectRouter;
