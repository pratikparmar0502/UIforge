import express from "express";
import { errorHandler } from './middleware/error.middleware.js';
import healthRouter from "./routes/health.routes.js";
import projectRouter from './routes/project.routes.js';

const app = express();

app.use(express.json());
app.use("/api/health", healthRouter);
app.use('/api/projects', projectRouter);
app.use(errorHandler);

export default app;
