
import mongoose, { Schema } from "mongoose";
import { roles } from "../utils/api.js";

const timestamps = { timestamps: true };

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: roles,
      default: "Employee",
    },
    refreshTokenHash: {
      type: String,
      select: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  timestamps
);

userSchema.index({
  name: "text",
  email: "text",
  role: "text",
});

const customerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: String,
    company: String,
    tags: [String],
    notes: String,
    preferences: {
      type: Schema.Types.Mixed,
      default: {},
    },
    healthScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
  },
  timestamps
);

customerSchema.index({
  name: "text",
  email: "text",
  company: "text",
  tags: "text",
});

const emailSchema = new Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      default: "neutral",
    },
    intent: {
      type: String,
      default: "general_inquiry",
    },
    urgency: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    autoResponse: {
      type: String,
      default: "",
    },
    recommendations: {
      type: [String],
      default: [],
    },
    processed: {
      type: Boolean,
      default: false,
    },
  },
  timestamps
);

emailSchema.index({
  subject: "text",
  body: "text",
  sender: "text",
  intent: "text",
});

const meetingSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    attendees: {
      type: [String],
      default: [],
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    notes: String,
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
  },
  timestamps
);

meetingSchema.index({
  title: "text",
  attendees: "text",
  notes: "text",
  status: "text",
});

const invoiceSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "overdue"],
      default: "draft",
    },
    pdfUrl: {
      type: String,
      default: "",
    },
    lineItems: [
      {
        description: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
  },
  timestamps
);

const reportSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["weekly", "executive"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    metrics: {
      type: Schema.Types.Mixed,
      default: {},
    },
    recommendations: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      default: "",
    },
    pdfUrl: {
      type: String,
      default: "",
    },
    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  timestamps
);

reportSchema.index({
  title: "text",
  summary: "text",
  type: "text",
});

const ticketSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    issue: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolution: {
      type: String,
      default: "",
    },
  },
  timestamps
);

const agentSchema = new Schema(
  {
    agentId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["idle", "running", "failed", "completed"],
      default: "idle",
    },
    lastExecution: {
      type: Date,
      default: null,
    },
    logs: {
      type: [String],
      default: [],
    },
    capabilities: {
      type: [String],
      default: [],
    },
  },
  timestamps
);

const executionSchema = new Schema(
  {
    agentId: {
      type: String,
      required: true,
    },
    eventId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["queued", "running", "completed", "failed"],
      default: "queued",
    },
    input: {
      type: Schema.Types.Mixed,
      default: {},
    },
    output: {
      type: Schema.Types.Mixed,
      default: {},
    },
    logs: {
      type: [String],
      default: [],
    },
    startedAt: Date,
    finishedAt: Date,
    error: {
      type: String,
      default: "",
    },
  },
  timestamps
);

const workflowStepSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["trigger", "condition", "action"],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    config: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

const workflowSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    trigger: {
      type: Schema.Types.Mixed,
      default: {},
    },
    condition: {
      type: Schema.Types.Mixed,
      default: {},
    },
    action: {
      type: Schema.Types.Mixed,
      default: {},
    },
    steps: {
      type: [workflowStepSchema],
      default: [],
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    logs: [
      {
        status: String,
        message: String,
        executedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  timestamps
);

workflowSchema.index({
  name: "text",
  trigger: "text",
  action: "text",
});

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  timestamps
);

const memorySchema = new Schema(
  {
    scope: {
      type: String,
      enum: ["customer", "agent"],
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    agentId: {
      type: String,
      default: null,
    },
    key: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    source: {
      type: String,
      default: "system",
    },
  },
  { ...timestamps, collection: "customer_memories" }
);

memorySchema.index({
  key: "text",
  value: "text",
  tags: "text",
  agentId: "text",
});

const agentMemorySchema = memorySchema.clone();
agentMemorySchema.set("collection", "agent_memories");

const crmActivitySchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    type: {
      type: String,
      enum: ["note", "email", "meeting", "invoice", "ticket", "workflow"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      default: "",
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  timestamps
);

crmActivitySchema.index({
  title: "text",
  body: "text",
  type: "text",
});

export const User = mongoose.model("User", userSchema);
export const Customer = mongoose.model("Customer", customerSchema);
export const Email = mongoose.model("Email", emailSchema);
export const Meeting = mongoose.model("Meeting", meetingSchema);
export const Invoice = mongoose.model("Invoice", invoiceSchema);
export const Report = mongoose.model("Report", reportSchema);
export const Ticket = mongoose.model("Ticket", ticketSchema);
export const Agent = mongoose.model("Agent", agentSchema);
export const AgentExecution = mongoose.model("AgentExecution", executionSchema);
export const Workflow = mongoose.model("Workflow", workflowSchema);
export const Notification = mongoose.model("Notification", notificationSchema);
export const Memory = mongoose.model("Memory", memorySchema);
export const AgentMemory = mongoose.model("AgentMemory", agentMemorySchema);
export const CRMActivity = mongoose.model("CRMActivity", crmActivitySchema);
