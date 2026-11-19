import http from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { initSocket } from "./config/socket.js";
import { ensureAgents } from "./agents/index.js";
import { closeRedis } from "./config/redis.js";
import { startOrchestrationWorker } from "./services/orchestration.js";

async function bootstrap() {
  await connectDatabase();
  await ensureAgents();
  const app = createApp();
  const server = http.createServer(app);
  initSocket(server);
  const worker = startOrchestrationWorker();

  server.listen(env.PORT, () => {
    console.log(`Elvora API listening on http://localhost:${env.PORT}`);
  });

  const shutdown = async () => {
    await worker?.close();
    await closeRedis();
    server.close(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
