import { Customer, Invoice, Meeting, Ticket } from "../models/index.js";

export async function calculateBusinessHealth() {
  const [customers, invoices, meetings, tickets] = await Promise.all([Customer.find().select("healthScore tags"), Invoice.find().select("status createdAt"), Meeting.find().select("status startTime"), Ticket.find().select("status createdAt")]);
  const avg = (values) => values.length ? values.reduce((a, b) => a + b, 0) / values.length : 75;
  const factor = {
    customerSatisfaction: Math.round(avg(customers.map((c) => c.healthScore ?? 50))),
    responseTime: 80,
    invoiceCollection: invoices.length ? Math.round(invoices.filter((i) => i.status === "paid").length / invoices.length * 100) : 75,
    leadConversion: customers.length ? Math.round(customers.filter((c) => (c.tags ?? []).some((t) => /customer|converted/i.test(t))).length / customers.length * 100) : 75,
    ticketResolution: tickets.length ? Math.round(tickets.filter((t) => ["resolved", "closed"].includes(t.status)).length / tickets.length * 100) : 75,
    meetingMomentum: meetings.length ? Math.round(meetings.filter((m) => m.status === "completed" || new Date(m.startTime) >= new Date(Date.now() - 30 * 86400000)).length / meetings.length * 100) : 75
  };
  const weights = { customerSatisfaction: .25, responseTime: .15, invoiceCollection: .2, leadConversion: .15, ticketResolution: .15, meetingMomentum: .1 };
  const score = Math.round(Object.entries(factor).reduce((sum, [key, value]) => sum + value * weights[key], 0));
  return {
    score, factors: factor
  };
}
