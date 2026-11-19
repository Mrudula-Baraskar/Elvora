import { Router } from "express";
import { login, logout, refresh, register } from "../controllers/auth.js";
import { createUser, deleteUser, listUsers, updateUser } from "../controllers/users.js";
import {
  addActivity,
  addNote,
  createInvoice,
  customers,
  deleteInvoice,
  downloadInvoice,
  generateReport,
  getDashboard,
  getEmail,
  getInvoice,
  getReport,
  listAgents,
  listCrm,
  listEmails,
  listExecutions,
  listInvoices,
  listReports,
  meetings,
  notifications,
  processEmail,
  runAgents,
  runWorkflow,
  searchMemory,
  tickets,
  updateInvoice,
  workflows
} from "../controllers/core.js";
import { authenticate, authorize } from "../middleware/auth.js";

export const apiRoutes = Router();

apiRoutes.post("/auth/register", register);
apiRoutes.post("/auth/login", login);
apiRoutes.post("/auth/refresh", refresh);
apiRoutes.post("/auth/logout", logout);

apiRoutes.use(authenticate);
apiRoutes.get("/dashboard", getDashboard);

apiRoutes.get("/users", authorize("Admin", "Manager"), listUsers);
apiRoutes.post("/users", authorize("Admin"), createUser);
apiRoutes.put("/users/:id", authorize("Admin", "Manager"), updateUser);
apiRoutes.delete("/users/:id", authorize("Admin"), deleteUser);

apiRoutes.get("/customers", customers.list);
apiRoutes.get("/customers/:id", customers.get);
apiRoutes.post("/customers", authorize("Admin", "Manager", "Employee"), customers.create);
apiRoutes.put("/customers/:id", authorize("Admin", "Manager", "Employee"), customers.update);
apiRoutes.delete("/customers/:id", authorize("Admin", "Manager"), customers.remove);

apiRoutes.post("/emails/process", processEmail);
apiRoutes.get("/emails", listEmails);
apiRoutes.get("/emails/:id", getEmail);

apiRoutes.get("/crm", listCrm);
apiRoutes.post("/crm/note", addNote);
apiRoutes.post("/crm/activity", addActivity);

apiRoutes.get("/meetings", meetings.list);
apiRoutes.post("/meetings", meetings.create);
apiRoutes.put("/meetings/:id", meetings.update);
apiRoutes.delete("/meetings/:id", meetings.remove);

apiRoutes.get("/invoices", listInvoices);
apiRoutes.post("/invoices", createInvoice);
apiRoutes.get("/invoices/:id", getInvoice);
apiRoutes.get("/invoices/:id/download", downloadInvoice);
apiRoutes.put("/invoices/:id", updateInvoice);
apiRoutes.delete("/invoices/:id", deleteInvoice);

apiRoutes.get("/tickets", tickets.list);
apiRoutes.post("/tickets", tickets.create);
apiRoutes.put("/tickets/:id", tickets.update);
apiRoutes.delete("/tickets/:id", tickets.remove);

apiRoutes.post("/reports/generate", generateReport);
apiRoutes.get("/reports", listReports);
apiRoutes.get("/reports/:id", getReport);

apiRoutes.get("/agents", listAgents);
apiRoutes.get("/agents/executions", listExecutions);
apiRoutes.post("/agents/run", authorize("Admin", "Manager"), runAgents);

apiRoutes.get("/workflows", workflows.list);
apiRoutes.post("/workflows", workflows.create);
apiRoutes.get("/workflows/:id", workflows.get);
apiRoutes.put("/workflows/:id", workflows.update);
apiRoutes.delete("/workflows/:id", workflows.remove);
apiRoutes.post("/workflows/:id/execute", runWorkflow);

apiRoutes.get("/memory/search", searchMemory);
apiRoutes.get("/notifications", notifications.list);
apiRoutes.put("/notifications/:id", notifications.update);
