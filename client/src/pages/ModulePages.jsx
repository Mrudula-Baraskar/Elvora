import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Bot, Download, Play, Plus, Search, Send } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardTitle } from "../components/ui/Card";
import { Input, Label, Select, Textarea } from "../components/ui/Form";
import { DataTable } from "../components/DataTable";
import { EmptyState, ErrorState, LoadingState } from "../components/StateViews";
import { api, resources } from "../services/api";
import { currency, formatDate } from "../lib/utils";

function PageTitle({ title, subtitle, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function InlineForm({ fields, values, setValues, onSubmit, submitLabel = "Save" }) {
  return (
    <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" onSubmit={onSubmit}>
      {fields.map((field) => (
        <div key={field.name} className={field.wide ? "md:col-span-2" : ""}>
          <Label>{field.label}</Label>
          {field.type === "textarea" ? (
            <Textarea value={values[field.name] ?? ""} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} required={field.required} />
          ) : field.options ? (
            <Select value={values[field.name] ?? field.options[0]} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}>
              {field.options.map((option) => <option key={option}>{option}</option>)}
            </Select>
          ) : (
            <Input type={field.type ?? "text"} value={values[field.name] ?? ""} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} required={field.required} />
          )}
        </div>
      ))}
      <div className="flex items-end">
        <Button className="w-full"><Plus className="h-4 w-4" />{submitLabel}</Button>
      </div>
    </form>
  );
}

function useList(key, fn) {
  return useQuery({ queryKey: [key], queryFn: fn });
}

export function UsersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useList("users", resources.users);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Employee" });
  const create = useMutation({
    mutationFn: (payload) => api.post("/users", payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["users"] }); toast.success("User created"); }
  });
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  return (
    <>
      <PageTitle title="Users" subtitle="Create users, assign roles, and manage access." />
      <Card className="mb-4">
        <InlineForm
          fields={[
            { name: "name", label: "Name", required: true },
            { name: "email", label: "Email", type: "email", required: true },
            { name: "password", label: "Password", type: "password", required: true },
            { name: "role", label: "Role", options: ["Admin", "Manager", "Employee", "Viewer"] }
          ]}
          values={form}
          setValues={setForm}
          onSubmit={(event) => { event.preventDefault(); create.mutate(form); }}
          submitLabel="Create user"
        />
      </Card>
      <DataTable rows={data} columns={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "role", label: "Role", render: (row) => <Badge tone="blue">{row.role}</Badge> },
        { key: "active", label: "Status", render: (row) => <Badge tone={row.active ? "green" : "red"}>{row.active ? "Active" : "Inactive"}</Badge> }
      ]} />
    </>
  );
}

export function CustomersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useList("customers", resources.customers);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", tags: "", notes: "", preferences: "", healthScore: 75 });
  const create = useMutation({
    mutationFn: (payload) => api.post("/customers", { ...payload, tags: payload.tags.split(",").map((item) => item.trim()).filter(Boolean), preferences: payload.preferences.split(",").map((item) => item.trim()).filter(Boolean), healthScore: Number(payload.healthScore) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["customers"] }); toast.success("Customer created"); }
  });
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  return (
    <>
      <PageTitle title="Customers" subtitle="Customer table, 360 view, notes, preferences, and health scores." />
      <Card className="mb-4">
        <InlineForm
          fields={[
            { name: "name", label: "Name", required: true },
            { name: "email", label: "Email", type: "email", required: true },
            { name: "phone", label: "Phone" },
            { name: "company", label: "Company" },
            { name: "tags", label: "Tags" },
            { name: "preferences", label: "Preferences" },
            { name: "healthScore", label: "Health Score", type: "number" },
            { name: "notes", label: "Notes", type: "textarea", wide: true }
          ]}
          values={form}
          setValues={setForm}
          onSubmit={(event) => { event.preventDefault(); create.mutate(form); }}
          submitLabel="Create customer"
        />
      </Card>
      <DataTable rows={data} columns={[
        { key: "name", label: "Name", render: (row) => <Link className="font-medium text-primary" to={`/app/customers/${row._id}`}>{row.name}</Link> },
        { key: "company", label: "Company" },
        { key: "email", label: "Email" },
        { key: "healthScore", label: "Health", render: (row) => <Badge tone={row.healthScore > 75 ? "green" : row.healthScore > 50 ? "amber" : "red"}>{row.healthScore}</Badge> }
      ]} />
    </>
  );
}

export function CustomerDetailPage() {
  const { id } = useParams();
  const customer = useQuery({ queryKey: ["customer", id], queryFn: () => resources.customer(id) });
  const crm = useQuery({ queryKey: ["crm", id], queryFn: () => api.get(`/crm?customerId=${id}`).then((res) => res.data) });
  if (customer.isLoading) return <LoadingState />;
  if (customer.error) return <ErrorState error={customer.error} />;
  return (
    <div className="space-y-4">
      <PageTitle title={customer.data.name} subtitle={`${customer.data.company} · ${customer.data.email}`} />
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader><CardTitle>Customer 360</CardTitle></CardHeader>
          <div className="space-y-3 text-sm">
            <div><span className="text-muted-foreground">Phone</span><div>{customer.data.phone || "Not set"}</div></div>
            <div><span className="text-muted-foreground">Health Score</span><div className="text-2xl font-semibold">{customer.data.healthScore}</div></div>
            <div className="flex flex-wrap gap-2">{customer.data.tags?.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
            <div><span className="text-muted-foreground">Preferences</span><div>{Array.isArray(customer.data.preferences) ? customer.data.preferences.join(", ") || "None" : JSON.stringify(customer.data.preferences ?? {})}</div></div>
            <div><span className="text-muted-foreground">Notes</span><div>{customer.data.notes || "No notes"}</div></div>
          </div>
        </Card>
        <Card>
          <CardHeader><CardTitle>Activity Timeline</CardTitle></CardHeader>
          <div className="space-y-3">
            {crm.data?.map((item) => (
              <div key={item._id} className="rounded-md border p-3">
                <div className="flex items-center justify-between"><span className="font-medium">{item.title}</span><Badge>{item.type}</Badge></div>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                <div className="mt-2 text-xs text-muted-foreground">{formatDate(item.createdAt)}</div>
              </div>
            ))}
            {!crm.data?.length && <EmptyState title="No activity yet" />}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function EmailsPage() {
  const queryClient = useQueryClient();
  const emails = useList("emails", resources.emails);
  const [form, setForm] = useState({ sender: "ava@northstar.example", subject: "", body: "" });
  const process = useMutation({
    mutationFn: (payload) => api.post("/emails/process", payload),
    onSuccess: () => { queryClient.invalidateQueries(); toast.success("Email processed and agents launched"); }
  });
  if (emails.isLoading) return <LoadingState />;
  if (emails.error) return <ErrorState error={emails.error} />;
  return (
    <>
      <PageTitle title="Email Dashboard" subtitle="Ingest emails, classify intent, analyze sentiment, and generate follow-ups." />
      <Card className="mb-4">
        <InlineForm
          fields={[{ name: "sender", label: "Sender", type: "email", required: true }, { name: "subject", label: "Subject", required: true }, { name: "body", label: "Body", type: "textarea", required: true, wide: true }]}
          values={form}
          setValues={setForm}
          onSubmit={(event) => { event.preventDefault(); process.mutate(form); }}
          submitLabel="Process email"
        />
      </Card>
      <DataTable rows={emails.data} columns={[
        { key: "subject", label: "Subject" },
        { key: "sender", label: "Sender" },
        { key: "intent", label: "Intent", render: (row) => <Badge tone="blue">{row.intent}</Badge> },
        { key: "sentiment", label: "Sentiment", render: (row) => <Badge tone={row.sentiment === "negative" ? "red" : row.sentiment === "positive" ? "green" : "amber"}>{row.sentiment}</Badge> },
        { key: "processed", label: "Processed", render: (row) => row.processed ? "Yes" : "Queued" }
      ]} />
    </>
  );
}

function CrudPage({ title, subtitle, queryKey, endpoint, resourceFn, formFields, initialForm, columns, transform = (x) => x }) {
  const queryClient = useQueryClient();
  const list = useList(queryKey, resourceFn);
  const [form, setForm] = useState(initialForm);
  const create = useMutation({
    mutationFn: (payload) => api.post(endpoint, transform(payload)),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [queryKey] }); toast.success("Saved"); },
    onError: (error) => { toast.error(error.response?.data?.message ?? "Save failed"); }
  });
  if (list.isLoading) return <LoadingState />;
  if (list.error) return <ErrorState error={list.error} />;
  return (
    <>
      <PageTitle title={title} subtitle={subtitle} />
      <Card className="mb-4">
        <InlineForm fields={formFields} values={form} setValues={setForm} onSubmit={(event) => { event.preventDefault(); create.mutate(form); }} />
      </Card>
      <DataTable rows={list.data} columns={columns} />
    </>
  );
}

export function MeetingsPage() {
  return <CrudPage
    title="Meetings"
    subtitle="Calendar view, meeting table, generated events, and invitation tracking."
    queryKey="meetings"
    endpoint="/meetings"
    resourceFn={resources.meetings}
    initialForm={{ title: "", attendees: "", startTime: "", endTime: "", notes: "", status: "scheduled" }}
    formFields={[
      { name: "title", label: "Title", required: true },
      { name: "attendees", label: "Attendees" },
      { name: "startTime", label: "Start", type: "datetime-local", required: true },
      { name: "endTime", label: "End", type: "datetime-local", required: true },
      { name: "status", label: "Status", options: ["scheduled", "completed", "cancelled"] },
      { name: "notes", label: "Notes", type: "textarea", wide: true }
    ]}
    transform={(payload) => ({ ...payload, attendees: payload.attendees.split(",").map((item) => item.trim()).filter(Boolean) })}
    columns={[
      { key: "title", label: "Title" },
      { key: "attendees", label: "Attendees", render: (row) => row.attendees?.join(", ") },
      { key: "startTime", label: "Start", render: (row) => formatDate(row.startTime) },
      { key: "status", label: "Status", render: (row) => <Badge tone="blue">{row.status}</Badge> }
    ]}
  />;
}

export function InvoicesPage() {
  return <CrudPage
    title="Invoices"
    subtitle="Invoice table, PDF generation, download links, and payment tracking."
    queryKey="invoices"
    endpoint="/invoices"
    resourceFn={resources.invoices}
    initialForm={{ customerId: "", amount: "", dueDate: "", status: "draft" }}
    formFields={[{ name: "customerId", label: "Customer ID", required: true }, { name: "amount", label: "Amount", type: "number", required: true }, { name: "dueDate", label: "Due Date", type: "date", required: true }, { name: "status", label: "Status", options: ["draft", "sent", "paid", "overdue"] }]}
    transform={(payload) => ({ ...payload, amount: Number(payload.amount) })}
    columns={[
      { key: "customerId", label: "Customer", render: (row) => row.customerId?.name ?? row.customerId },
      { key: "amount", label: "Amount", render: (row) => currency(row.amount) },
      { key: "status", label: "Status", render: (row) => <Badge tone={row.status === "paid" ? "green" : row.status === "overdue" ? "red" : "amber"}>{row.status}</Badge> },
      { key: "pdfUrl", label: "PDF", render: (row) => row.pdfUrl ? <a className="inline-flex items-center gap-1 text-primary" href={row.pdfUrl} target="_blank"><Download className="h-4 w-4" />Download</a> : "Pending" }
    ]}
  />;
}

export function TicketsPage() {
  return <CrudPage
    title="Tickets"
    subtitle="Support dashboard, ticket detail fields, priority, assignment, and resolution status."
    queryKey="tickets"
    endpoint="/tickets"
    resourceFn={resources.tickets}
    initialForm={{ customerId: "", priority: "medium", issue: "", status: "open" }}
    formFields={[{ name: "customerId", label: "Customer ID", required: true }, { name: "priority", label: "Priority", options: ["low", "medium", "high", "critical"] }, { name: "status", label: "Status", options: ["open", "in_progress", "resolved", "closed"] }, { name: "issue", label: "Issue", type: "textarea", required: true, wide: true }]}
    columns={[
      { key: "issue", label: "Issue" },
      { key: "priority", label: "Priority", render: (row) => <Badge tone={row.priority === "critical" ? "red" : row.priority === "high" ? "amber" : "blue"}>{row.priority}</Badge> },
      { key: "status", label: "Status" },
      { key: "createdAt", label: "Created", render: (row) => formatDate(row.createdAt) }
    ]}
  />;
}

export function ReportsPage() {
  const queryClient = useQueryClient();
  const reports = useList("reports", resources.reports);
  const generate = useMutation({
    mutationFn: (type) => api.post("/reports/generate", { type }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["reports"] }); toast.success("Report generated"); }
  });
  if (reports.isLoading) return <LoadingState />;
  if (reports.error) return <ErrorState error={reports.error} />;
  return (
    <>
      <PageTitle
        title="Reports"
        subtitle="Generate weekly reports and executive summaries as professional PDFs."
        action={<div className="flex gap-2"><Button onClick={() => generate.mutate("weekly")}>Weekly</Button><Button variant="outline" onClick={() => generate.mutate("executive")}>Executive</Button></div>}
      />
      <DataTable rows={reports.data} columns={[
        { key: "title", label: "Title" },
        { key: "type", label: "Type", render: (row) => <Badge tone="blue">{row.type}</Badge> },
        { key: "summary", label: "Summary" },
        { key: "pdfUrl", label: "PDF", render: (row) => row.pdfUrl ? <a className="text-primary" href={row.pdfUrl} target="_blank">View PDF</a> : "Pending" }
      ]} />
    </>
  );
}

export function CrmPage() {
  const crm = useList("crm", resources.crm);
  if (crm.isLoading) return <LoadingState />;
  if (crm.error) return <ErrorState error={crm.error} />;
  return (
    <>
      <PageTitle title="CRM" subtitle="Interaction history, notes, lead activity, and customer timeline." />
      <DataTable rows={crm.data} columns={[
        { key: "title", label: "Title" },
        { key: "type", label: "Type", render: (row) => <Badge>{row.type}</Badge> },
        { key: "body", label: "Body" },
        { key: "createdAt", label: "Created", render: (row) => formatDate(row.createdAt) }
      ]} />
    </>
  );
}

export function WorkflowsPage() {
  const queryClient = useQueryClient();
  const workflows = useList("workflows", resources.workflows);
  const [form, setForm] = useState({ name: "", trigger: "Email Received", condition: "negative", action: "Create Ticket and Notify Manager" });
  const create = useMutation({
    mutationFn: (payload) => api.post("/workflows", { name: payload.name, trigger: { type: payload.trigger }, condition: { field: "sentiment", operator: "equals", value: payload.condition }, action: { type: "create_ticket", priority: "high", issue: "Negative customer email requires follow-up", description: payload.action }, steps: [{ type: "trigger", name: payload.trigger }, { type: "condition", name: payload.condition }, { type: "action", name: payload.action }] }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["workflows"] }); toast.success("Workflow saved"); }
  });
  const run = useMutation({
    mutationFn: (workflow) => api.post(`/workflows/${workflow._id}/execute`, { sentiment: "negative", issue: "Manual workflow test" }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["workflows"] }); toast.success("Workflow executed"); }
  });
  if (workflows.isLoading) return <LoadingState />;
  if (workflows.error) return <ErrorState error={workflows.error} />;
  return (
    <>
      <PageTitle title="Workflow Builder" subtitle="Define trigger, condition, action workflows with logs and manual execution." />
      <Card className="mb-4">
        <InlineForm fields={[{ name: "name", label: "Name", required: true }, { name: "trigger", label: "Trigger", required: true }, { name: "condition", label: "Condition" }, { name: "action", label: "Action", required: true }]} values={form} setValues={setForm} onSubmit={(event) => { event.preventDefault(); create.mutate(form); }} />
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workflows.data?.map((workflow) => (
          <Card key={workflow._id}>
            <CardHeader>
              <CardTitle>{workflow.name}</CardTitle>
              <Button size="sm" variant="outline" onClick={() => run.mutate(workflow)}><Play className="h-4 w-4" />Run</Button>
            </CardHeader>
            <div className="space-y-3 text-sm">
              <div className="rounded-md border p-3">{typeof workflow.trigger === "object" ? JSON.stringify(workflow.trigger) : workflow.trigger}</div>
              <div className="rounded-md border p-3">{typeof workflow.condition === "object" ? JSON.stringify(workflow.condition) : workflow.condition || "always"}</div>
              <div className="rounded-md border p-3">{typeof workflow.action === "object" ? JSON.stringify(workflow.action) : workflow.action}</div>
              <div className="text-xs text-muted-foreground">{workflow.logs?.length ?? 0} log entries</div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

export function AiControlPage() {
  const queryClient = useQueryClient();
  const agents = useList("agents", resources.agents);
  const executions = useList("executions", resources.executions);
  const run = useMutation({
    mutationFn: () => api.post("/agents/run", { payload: { source: "manual-review" } }),
    onSuccess: () => { queryClient.invalidateQueries(); toast.success("Agents launched"); }
  });
  if (agents.isLoading || executions.isLoading) return <LoadingState />;
  if (agents.error || executions.error) return <ErrorState error={agents.error || executions.error} />;
  return (
    <>
      <PageTitle title="AI Control Center" subtitle="Agent status, running tasks, execution history, and logs." action={<Button onClick={() => run.mutate()}><Bot className="h-4 w-4" />Run agents</Button>} />
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {agents.data.map((agent) => (
            <Card key={agent._id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{agent.name}</div>
                  <div className="text-xs text-muted-foreground">{agent.capabilities?.join(", ")}</div>
                </div>
                <Badge tone={agent.status === "failed" ? "red" : agent.status === "running" ? "amber" : "green"}>{agent.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader><CardTitle>Execution History</CardTitle></CardHeader>
          <div className="space-y-2">
            {executions.data.map((execution) => (
              <div className="rounded-md border p-3" key={execution._id}>
                <div className="flex items-center justify-between"><span className="font-medium">{execution.agentId}</span><Badge>{execution.status}</Badge></div>
                <div className="mt-1 text-xs text-muted-foreground">{execution.logs?.slice(-1)[0] ?? formatDate(execution.createdAt)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

export function SettingsPage() {
  const [query, setQuery] = useState("");
  const memory = useQuery({ queryKey: ["memory", query], queryFn: () => resources.memory(query), enabled: false });
  const rows = useMemo(() => [...(memory.data?.customerMemories ?? []), ...(memory.data?.agentMemories ?? [])], [memory.data]);
  return (
    <>
      <PageTitle title="Settings" subtitle="Environment, memory search, and workspace controls." />
      <Card className="mb-4">
        <div className="flex gap-2">
          <Input placeholder="Search long-term memory" value={query} onChange={(event) => setQuery(event.target.value)} />
          <Button variant="outline" onClick={() => memory.refetch()}><Search className="h-4 w-4" />Search</Button>
        </div>
      </Card>
      <DataTable rows={rows} columns={[
        { key: "scope", label: "Scope", render: (row) => <Badge>{row.scope}</Badge> },
        { key: "key", label: "Key" },
        { key: "value", label: "Value" },
        { key: "source", label: "Source" }
      ]} emptyTitle="No memory results" />
      <Card className="mt-4">
        <CardHeader><CardTitle>Runtime</CardTitle></CardHeader>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div><span className="text-muted-foreground">API URL</span><div>{import.meta.env.VITE_API_URL ?? "http://localhost:5000/api"}</div></div>
          <div><span className="text-muted-foreground">Socket URL</span><div>{import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5000"}</div></div>
        </div>
      </Card>
    </>
  );
}
