import express from "express";
import { errorHandler } from './middleware/error.middleware.js';
import { uploadsDirectory } from './middleware/screenshot-upload.middleware.js';
import generationRouter from './routes/generation.routes.js';
import healthRouter from "./routes/health.routes.js";
import projectRouter from './routes/project.routes.js';

const app = express();

app.use(express.json());
app.use('/uploads', express.static(uploadsDirectory));
app.use("/api/health", healthRouter);
app.use('/api/projects', projectRouter);
app.use('/api/generations', generationRouter);
app.use(errorHandler);

export default app;
