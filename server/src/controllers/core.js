import { z } from "zod";
import {
  Agent,
  AgentExecution,
  AgentMemory,
  CRMActivity,
  Customer,
  Email,
  Invoice,
  Meeting,
  Memory,
  Notification,
  Report,
  Ticket,
  Workflow
} from "../models/index.js";
import { ApiError, asyncHandler, crudController } from "../utils/api.js";
import { analyzeEmail } from "../services/intelligence.js";
import { createNotification } from "../services/notifications.js";
import { enqueueOrchestration } from "../services/orchestration.js";
import { calculateBusinessHealth } from "../services/health.js";
import { generatePdf, renderMetricTable } from "../services/pdf.js";
import { executeWorkflow } from "../services/workflows.js";

export const customers = crudController(Customer);
export const meetings = crudController(Meeting);
export const tickets = crudController(Ticket);
export const workflows = crudController(Workflow);
export const notifications = crudController(Notification);

export const processEmail = asyncHandler(async (req, res) => {
  const parsed = z.object({ subject: z.string().trim().min(1), body: z.string().trim().min(1), sender: z.string().trim().email() }).safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Invalid email", parsed.error.flatten());
  const customer = await Customer.findOne({ email: parsed.data.sender.toLowerCase() });
  const analysis = analyzeEmail(parsed.data.subject, parsed.data.body);
  const email = await Email.create({ ...parsed.data, sender: parsed.data.sender.toLowerCase(), customerId: customer?._id ?? null, ...analysis });
  if (customer) await CRMActivity.create({ customerId: customer._id, type: "email", title: email.subject, body: email.body, metadata: { emailId: email._id } });
  await createNotification({ type: "email_received", title: "Email received", message: `${email.subject} (${email.urgency} urgency)`, metadata: { emailId: email._id, customerId: customer?._id ?? null } });
  await enqueueOrchestration({ eventType: "email", emailId: String(email._id), customerId: customer ? String(customer._id) : null });
  res.status(201).json(email);
});

export const listEmails = asyncHandler(async (_req, res) => {
  res.json(await Email.find().sort({ createdAt: -1 }).limit(100).populate("customerId", "name email company"));
});

export const getEmail = asyncHandler(async (req, res) => {
  const email = await Email.findById(req.params.id).populate("customerId", "name email company");
  if (!email) throw new ApiError(404, "Email not found");
  res.json(email);
});

export const listCrm = asyncHandler(async (req, res) => {
  const filter = req.query.customerId ? { customerId: req.query.customerId } : {};
  res.json(await CRMActivity.find(filter).sort({ createdAt: -1 }).limit(500).populate("customerId", "name email"));
});

export const addNote = asyncHandler(async (req, res) => {
  const parsed = z.object({ customerId: z.string().min(1), title: z.string().trim().min(1), body: z.string().optional() }).safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Invalid note", parsed.error.flatten());
  if (!await Customer.exists({ _id: parsed.data.customerId })) throw new ApiError(404, "Customer not found");
  res.status(201).json(await CRMActivity.create({ ...parsed.data, type: "note", createdBy: req.user?.id }));
});

export const addActivity = asyncHandler(async (req, res) => {
  const parsed = z.object({ customerId: z.string().min(1), type: z.enum(["note", "email", "meeting", "invoice", "ticket", "workflow"]), title: z.string().trim().min(1), body: z.string().optional(), metadata: z.record(z.unknown()).optional() }).safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Invalid activity", parsed.error.flatten());
  if (!await Customer.exists({ _id: parsed.data.customerId })) throw new ApiError(404, "Customer not found");
  res.status(201).json(await CRMActivity.create({ ...parsed.data, createdBy: req.user?.id }));
});

export const listInvoices = asyncHandler(async (_req, res) => {
  res.json(await Invoice.find().sort({ createdAt: -1 }).populate("customerId", "name email company"));
});

export const createInvoice = asyncHandler(async (req, res) => {
  const parsed = z.object({ customerId: z.string().min(1), amount: z.coerce.number().nonnegative(), dueDate: z.coerce.date(), status: z.enum(["draft", "sent", "paid", "overdue"]).optional(), lineItems: z.array(z.object({ description: z.string().min(1), quantity: z.coerce.number().int().positive(), unitPrice: z.coerce.number().nonnegative() })).default([]) }).safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Invalid invoice", parsed.error.flatten());
  const customer = await Customer.findById(parsed.data.customerId);
  if (!customer) throw new ApiError(404, "Customer not found");
  const invoice = await Invoice.create(parsed.data);
  invoice.pdfUrl = await generatePdf(`invoice-${invoice._id}`, (doc) => { doc.fontSize(20).text("Invoice", { align: "center" }).moveDown(); doc.fontSize(12).text(`Customer: ${customer.name}`).text(`Amount: ${invoice.amount}`).text(`Due: ${invoice.dueDate.toISOString().slice(0, 10)}`).moveDown(); renderMetricTable(doc, { Status: invoice.status, Amount: invoice.amount, "Line items": invoice.lineItems.length }); });
  await invoice.save();
  await createNotification({ type: "invoice_created", title: "Invoice created", message: `Invoice for ${customer.name} has been created.`, metadata: { invoiceId: invoice._id, customerId: customer._id } });
  res.status(201).json(invoice);
});

export const getInvoice = crudController(Invoice).get;
export const updateInvoice = crudController(Invoice).update;
export const deleteInvoice = crudController(Invoice).remove;

export const downloadInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw new ApiError(404, "Invoice not found");
  if (!invoice.pdfUrl) throw new ApiError(404, "Invoice PDF not available");
  res.json({ pdfUrl: invoice.pdfUrl });
});

export const generateReport = asyncHandler(async (req, res) => {
  const parsed = z.object({ type: z.enum(["weekly", "executive"]) }).safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Invalid report type", parsed.error.flatten());
  const [invoices, meetingsCount, customersCount, openTickets, activityCount, health] = await Promise.all([Invoice.find().select("amount status"), Meeting.countDocuments(), Customer.countDocuments(), Ticket.countDocuments({ status: { $in: ["open", "in_progress"] } }), CRMActivity.countDocuments(), calculateBusinessHealth()]);
  const metrics = { revenue: invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount, 0), invoices: invoices.length, meetings: meetingsCount, customers: customersCount, openTickets, crmActivity: activityCount, businessHealth: health.score };
  const recommendations = [openTickets ? `Resolve ${openTickets} open support ticket(s).` : "Support tickets are up to date.", health.score < 70 ? "Review customer health and improve retention follow-up." : "Maintain current customer service levels."];
  const report = await Report.create({ type: parsed.data.type, title: `${parsed.data.type === "weekly" ? "Weekly" : "Executive"} Business Report`, metrics, recommendations, summary: `Business health is ${health.score}/100 with ${customersCount} customers, ${meetingsCount} meetings and ${openTickets} open tickets.`, generatedBy: req.user?.id });
  report.pdfUrl = await generatePdf(`report-${report._id}`, (doc) => { doc.fontSize(20).text(report.title).moveDown(); doc.fontSize(11).text(report.summary).moveDown(); renderMetricTable(doc, metrics); doc.moveDown().font("Helvetica-Bold").text("Recommendations"); report.recommendations.forEach((item) => doc.font("Helvetica").text(`• ${item}`)); });
  await report.save();
  res.status(201).json(report);
});

export const listReports = asyncHandler(async (_req, res) => {
  res.json(await Report.find().sort({ createdAt: -1 }));
});

export const getReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) throw new ApiError(404, "Report not found");
  res.json(report);
});

export const getDashboard = asyncHandler(async (_req, res) => {
  const [health, customersCount, meetingsCount, openTickets, invoices, recentEmails, executions] = await Promise.all([calculateBusinessHealth(), Customer.countDocuments(), Meeting.countDocuments(), Ticket.countDocuments({ status: { $in: ["open", "in_progress"] } }), Invoice.find().select("amount status"), Email.find().sort({ createdAt: -1 }).limit(8), AgentExecution.find().sort({ createdAt: -1 }).limit(8)]);
  const revenueByStatus = Object.fromEntries(["draft", "sent", "paid", "overdue"].map((status) => [status, invoices.filter((item) => item.status === status).reduce((sum, item) => sum + item.amount, 0)]));
  res.json({ metrics: { revenue: Object.values(revenueByStatus).reduce((a, b) => a + b, 0), customers: customersCount, meetings: meetingsCount, openTickets, healthScore: health.score }, health, revenueByStatus, recentEmails, latestAgentExecutions: executions });
});

export const listAgents = asyncHandler(async (_req, res) => {
  res.json(await Agent.find().sort({ name: 1 }));
});

export const listExecutions = asyncHandler(async (_req, res) => {
  res.json(await AgentExecution.find().sort({ createdAt: -1 }).limit(100));
});

export const runAgents = asyncHandler(async (req, res) => {
  const payload = { ...req.body, eventType: "manual" };
  const job = await enqueueOrchestration(payload);
  res.status(202).json({ accepted: true, jobId: job?.id ?? null, result: job?.results ?? undefined });
});

export const runWorkflow = asyncHandler(async (req, res) => {
  res.json(await executeWorkflow(req.params.id, req.body ?? {}));
});

export const searchMemory = asyncHandler(async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  if (!q) throw new ApiError(400, "Search query is required");
  const [customerMemories, agentMemories] = await Promise.all([Memory.find({ $text: { $search: q } }).sort({ createdAt: -1 }).limit(100), AgentMemory.find({ $text: { $search: q } }).sort({ createdAt: -1 }).limit(100)]);
  res.json({ customerMemories, agentMemories });
});
