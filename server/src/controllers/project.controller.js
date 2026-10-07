import mongoose from 'mongoose';
import Generation from '../models/Generation.js';
import Project from '../models/Project.js';

function isValidProjectId(projectId) {
  return mongoose.isValidObjectId(projectId);
}

export async function createProject(request, response, next) {
  try {
    const { name, framework, styling } = request.body;

    if (typeof name !== 'string' || !name.trim()) {
      return response.status(400).json({
        status: 'error',
        message: 'Project name is required.',
      });
    }

    const project = await Project.create({ name, framework, styling });

    return response.status(201).json({
      status: 'success',
      data: project,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getProjects(_request, response, next) {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });

    return response.status(200).json({
      status: 'success',
      data: projects,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getProjectById(request, response, next) {
  try {
    const { id } = request.params;

    if (!isValidProjectId(id)) {
      return response.status(400).json({
        status: 'error',
        message: 'Invalid project ID.',
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return response.status(404).json({
        status: 'error',
        message: 'Project not found.',
      });
    }

    return response.status(200).json({
      status: 'success',
      data: project,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteProject(request, response, next) {
  try {
    const { id } = request.params;

    if (!isValidProjectId(id)) {
      return response.status(400).json({
        status: 'error',
        message: 'Invalid project ID.',
      });
    }

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return response.status(404).json({
        status: 'error',
        message: 'Project not found.',
      });
    }

    await Generation.deleteMany({ projectId: project._id });

    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
}
