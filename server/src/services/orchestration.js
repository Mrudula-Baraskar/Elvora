import { Queue, Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { emitOpsEvent } from "../config/socket.js";
import { createAgentContext, executeAgent } from "../agents/index.js";
import { Email } from "../models/index.js";
import { createNotification } from "./notifications.js";

export const orchestrationQueue = redisConnection ? new Queue("agent-orchestration", { connection: redisConnection }) : null;

export async function orchestrateEvent(payload) {
  const context = createAgentContext(payload);
  await executeAgent("intent-agent", context);
  const plan = await executeAgent("task-planner-agent", context);
  for (const agentId of plan.plan) await executeAgent(agentId, context);
  if (context.emailId) await Email.findByIdAndUpdate(context.emailId, { processed: true });
  emitOpsEvent("agent_completed", { eventId: context.eventId, emailId: context.emailId, results: context.results });
  await createNotification({ type: "agent_completed", title: "Email processing complete", message: "The requested email was analyzed and the agent workflow has finished.", metadata: { eventId: context.eventId, emailId: context.emailId } });
  return context;
}

export async function enqueueOrchestration(payload) {
  if (!orchestrationQueue) return orchestrateEvent(payload);
  return orchestrationQueue.add("orchestrate", payload, { attempts: 3, backoff: { type: "exponential", delay: 1000 }, removeOnComplete: 100, removeOnFail: 500 });
}

export function startOrchestrationWorker() {
  if (!redisConnection) { console.info("Redis is not configured; orchestration runs synchronously."); return null; }
  const worker = new Worker("agent-orchestration", ({ data }) => orchestrateEvent(data), { connection: redisConnection });
  worker.on("failed", (job, error) => console.error(`Orchestration job ${job?.id} failed:`, error));
  return worker;
}
