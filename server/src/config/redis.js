import IORedis from "ioredis";
import { env } from "./env.js";

export const redisConnection = env.REDIS_URL ? new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null }) : null;

export async function closeRedis() {
  if (redisConnection) await redisConnection.quit();
}
