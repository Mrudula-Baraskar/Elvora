import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDatabase } from "./config/database.js";
import { Customer, User, Workflow } from "./models/index.js";
import { ensureAgents } from "./agents/index.js";


try {
  await connectDatabase();
  await ensureAgents();
  await User.updateOne({ email: "admin@opspilot.local" }, { $set: { name: "Elvora Admin", role: "Admin", active: true }, $setOnInsert: { passwordHash: await bcrypt.hash("Admin12345", 12) } }, { upsert: true });
  const customer = await Customer.findOneAndUpdate({ email: "customer@example.com" }, { $setOnInsert: { name: "Sample Customer", email: "customer@example.com", company: "Example Co", tags: ["customer"], healthScore: 80 } }, { upsert: true, new: true });
  await Workflow.updateOne({ name: "Negative Email Escalation" }, { $setOnInsert: { name: "Negative Email Escalation", trigger: { type: "email_received" }, condition: { field: "sentiment", operator: "equals", value: "negative" }, action: { type: "create_ticket", priority: "high", issue: "Negative customer email requires follow-up" }, steps: [] } }, { upsert: true });
  console.log(`Seed complete. Demo admin: admin@opspilot.local / Admin12345. Sample customer: ${customer.email}`);
} finally {
  await mongoose.disconnect();
}
