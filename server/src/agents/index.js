import { v4 as uuid } from "uuid";
import {
  Agent,
  AgentExecution,
  CRMActivity,
  Customer,
  Email,
  Invoice,
  Meeting,
  Memory,
  Ticket
} from "../models/index.js";
import { analyzeEmail } from "../services/intelligence.js";

export const agentDefinitions = [
  {
    id: "intent-agent",
    name: "Intent Agent",
    capabilities: ["intent detection", "request classification"],
    run: async (context) => {
      const email = context.emailId ? await Email.findById(context.emailId) : null;
      const subject = email?.subject ?? context.payload.subject ?? "";
      const body = email?.body ?? context.payload.body ?? context.payload.issue ?? "";
      const analysis = analyzeEmail(subject, body);
      return { intent: analysis.intent, confidence: analysis.confidence, sentiment: analysis.sentiment, urgency: analysis.urgency };
    }
  },
  {
    id: "task-planner-agent",
    name: "Task Planner Agent",
    capabilities: ["planning", "workflow decomposition"],
    run: async (context) => {
      const intent = context.results["intent-agent"]?.intent ?? context.payload.intent ?? "general_inquiry";
      const specialist = { schedule_meeting: "meeting-agent", invoice_request: "invoice-agent", support_request: "customer-support-agent", sales_opportunity: "customer-support-agent" }[intent];
      return { intent, plan: [...(specialist ? [specialist] : []), "email-agent", "crm-agent", "chief-of-staff-agent"] };
    }
  },
  {
    id: "email-agent",
    name: "Email Agent",
    capabilities: ["responses", "follow-ups", "urgency detection"],
    run: async (context) => {
      const email = context.emailId ? await Email.findById(context.emailId) : null;
      const analysis = email ? null : analyzeEmail(context.payload.subject ?? "", context.payload.body ?? context.payload.issue ?? "");
      if (context.emailId && !email) throw new Error("Email not found");
      const urgency = email?.urgency ?? context.payload.urgency ?? analysis.urgency;
      const followUpHours = {
        critical: 1,
        high: 4,
        medium: 24,
        low: 72
      }[urgency] ?? 24;
      const followUpAt = new Date(Date.now() + followUpHours * 60 * 60 * 1000);

      return {
        autoResponse: email?.autoResponse ?? analysis.autoResponse,
        followUpAt,
        urgency,
        recommendations: email?.recommendations ?? analysis.recommendations
      };
    }
  },
  {
    id: "crm-agent",
    name: "CRM Agent",
    capabilities: ["CRM updates", "interaction logging"],
    run: async (context) => {
      const email = context.emailId ? await Email.findById(context.emailId) : null;
      const sender = email?.sender ?? context.payload.sender ?? "";
      const customer = context.customerId ? await Customer.findById(context.customerId) : await Customer.findOne({ email: sender.toLowerCase() });
      if (!customer) return { customerId: null, matched: false };
      context.customerId = customer._id;
      if (email && !email.customerId) { email.customerId = customer._id; await email.save(); }
      const summary = email ? `${email.subject}: ${email.body}` : JSON.stringify(context.payload);
      const activity = await CRMActivity.create({ customerId: customer._id, type: "email", title: email?.subject ?? "Customer interaction", body: summary });
      const memory = await Memory.create({ scope: "customer", customerId: customer._id, key: "last_interaction", value: summary, tags: ["email", email?.intent ?? "manual"], source: "crm-agent" });
      return { customerId: customer._id, matched: true, activityId: activity._id, memoryId: memory._id };
    }
  },
  {
    id: "meeting-agent",
    name: "Meeting Agent",
    capabilities: ["scheduling", "calendar events", "invitations"],
    run: async (context) => {
      const email = context.emailId ? await Email.findById(context.emailId) : null;
      const customerId = context.customerId ?? email?.customerId;
      const startTime = new Date(Date.now() + 2 * 86400000);
      const meeting = await Meeting.create({ title: `Follow-up: ${email?.subject ?? "Customer request"}`, attendees: [email?.sender ?? context.payload.sender].filter(Boolean), startTime, endTime: new Date(startTime.getTime() + 30 * 60000), customerId: customerId ?? null, notes: "Created by meeting agent" });
      return { meetingId: meeting._id, startTime: meeting.startTime, endTime: meeting.endTime };
    }
  },
  {
    id: "invoice-agent",
    name: "Invoice Agent",
    capabilities: ["invoice drafting", "PDF generation", "payment tracking"],
    run: async (context) => {
      const customerId = context.customerId ?? (context.emailId ? (await Email.findById(context.emailId))?.customerId : null);
      if (!customerId) return { created: false, message: "Manual customer matching is required before drafting an invoice." };
      return { created: false, customerId, message: "Customer matched; invoice amount and line items require manual entry." };
    }
  },
  {
    id: "customer-support-agent",
    name: "Customer Support Agent",
    capabilities: ["tickets", "escalations", "resolutions"],
    run: async (context) => {
      const email = context.emailId ? await Email.findById(context.emailId) : null;
      const urgency = context.results["intent-agent"]?.urgency ?? email?.urgency ?? "medium";
      const ticket = await Ticket.create({ customerId: context.customerId ?? email?.customerId ?? null, priority: urgency, issue: email ? `${email.subject}\n${email.body}` : String(context.payload.issue ?? context.payload.body ?? "Support request") });
      return { ticketId: ticket._id, priority: ticket.priority, status: ticket.status };
    }
  },
  {
    id: "chief-of-staff-agent",
    name: "Chief Of Staff Agent",
    capabilities: ["prioritization", "executive summaries", "conflict detection"],
    run: async (context) => {
      const urgency = context.results["intent-agent"]?.urgency ?? "medium";
      const priority = urgency === "critical" || urgency === "high" ? "high" : "normal";
      return { priority, summary: `${Object.keys(context.results).length} agent results reviewed.`, nextAction: context.results["customer-support-agent"] ? "Review and respond to the support ticket." : context.results["meeting-agent"] ? "Confirm the follow-up meeting with the customer." : "Review the drafted response and follow-up." };
    }
  }
];

export async function ensureAgents() {
  await Promise.all(agentDefinitions.map(({ id, name, capabilities }) => Agent.updateOne({ agentId: id }, { $set: { name, capabilities }, $setOnInsert: { status: "idle" } }, { upsert: true })));
}

export function createAgentContext(payload = {}) {
  return { eventId: payload.eventId ?? uuid(), eventType: payload.eventType ?? "manual", customerId: payload.customerId ?? null, emailId: payload.emailId ?? null, payload, results: {} };
}

export async function executeAgent(agentId, context) {
  const definition = agentDefinitions.find((item) => item.id === agentId);
  if (!definition) throw new Error(`Unknown agent: ${agentId}`);
  const execution = await AgentExecution.create({ agentId, eventId: context.eventId, status: "running", input: { ...context.payload, customerId: context.customerId, emailId: context.emailId }, startedAt: new Date() });
  const log = (message) => Agent.updateOne({ agentId }, { $set: { status: "running" }, $push: { logs: { $each: [message], $slice: -100 } } });
  await log(`Started ${context.eventType} event ${context.eventId}`);
  try {
    const output = await definition.run(context);
    context.results[agentId] = output;
    execution.status = "completed"; execution.output = output; execution.finishedAt = new Date(); execution.logs.push("Execution completed"); await execution.save();
    await Agent.updateOne({ agentId }, { $set: { status: "completed", lastExecution: execution.finishedAt }, $push: { logs: { $each: ["Execution completed"], $slice: -100 } } });
    return output;
  } catch (error) {
    execution.status = "failed"; execution.error = error.message; execution.finishedAt = new Date(); execution.logs.push(error.message); await execution.save();
    await Agent.updateOne({ agentId }, { $set: { status: "failed", lastExecution: execution.finishedAt }, $push: { logs: { $each: [error.message], $slice: -100 } } });
    throw error;
  }
}
