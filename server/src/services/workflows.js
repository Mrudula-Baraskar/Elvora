import { Ticket, Workflow } from "../models/index.js";
import { ApiError } from "../utils/api.js";
import { createNotification } from "./notifications.js";

export async function executeWorkflow(workflowId, payload) {
  const workflow = await Workflow.findById(workflowId);
  if (!workflow) throw new ApiError(404, "Workflow not found");
  const condition = workflow.condition ?? {};
  let matches = true;
  if (condition.field) {
    const actual = condition.field.split(".").reduce((value, key) => value?.[key], payload);
    const expected = condition.value;
    matches = condition.operator === "equals" || !condition.operator ? actual === expected
      : condition.operator === "not_equals" ? actual !== expected
        : condition.operator === "contains" ? String(actual ?? "").includes(String(expected ?? ""))
          : condition.operator === "exists" ? actual != null : Boolean(actual);
  }
  if (!matches) {
    workflow.logs.push({ status: "skipped", message: "Condition did not match" }); await workflow.save();
    return { skipped: true, workflowId: workflow._id };
  }
  const action = workflow.action ?? {};
  const results = [];
  const type = action.type ?? action.action ?? "";
  if (type === "ticket" || type === "create_ticket") {
    results.push(await Ticket.create({ customerId: payload.customerId ?? null, issue: action.issue ?? payload.issue ?? payload.message ?? workflow.name, priority: action.priority ?? "medium" }));
  }
  if (type === "notification" || type === "create_notification") {
    results.push(await createNotification({ type: action.notificationType ?? "workflow", title: action.title ?? workflow.name, message: action.message ?? payload.message ?? "Workflow completed", metadata: { workflowId: workflow._id } }));
  }
  workflow.logs.push({ status: "completed", message: `Workflow completed (${results.length} action(s))` }); await workflow.save();
  return { skipped: false, workflowId: workflow._id, results };
}
