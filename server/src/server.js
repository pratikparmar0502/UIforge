import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

async function startServer() {
  await connectDatabase();

  app.listen(env.port, () => {
    console.info(`UIForge server is listening on port ${env.port}.`);
  });
}

startServer();
