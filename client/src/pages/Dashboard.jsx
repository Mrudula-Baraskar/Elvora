import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bot, CalendarDays, CreditCard, HeartPulse, Ticket, Users } from "lucide-react";
import { resources } from "../services/api";
import { Card, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { ErrorState, LoadingState } from "../components/StateViews";
import { currency, formatDate } from "../lib/utils";

const metricIcons = { revenue: CreditCard, customers: Users, meetings: CalendarDays, tickets: Ticket, healthScore: HeartPulse };
const colors = ["var(--color-primary)", "var(--color-secondary)", "var(--color-accent)", "var(--color-warning)"];

export function DashboardPage() {
  const { data = {}, isLoading, error } = useQuery({ queryKey: ["dashboard"], queryFn: resources.dashboard });
  if (isLoading) return <LoadingState label="Loading executive dashboard" />;
  if (error) return <ErrorState error={error} />;

  const metrics = data.metrics ?? {};

  const activityByDay = new Map();
  for (const item of [...(data.recentEmails ?? []), ...(data.latestAgentExecutions ?? [])]) {
    const name = new Date(item.createdAt).toLocaleDateString(undefined, { weekday: "short" });
    activityByDay.set(name, (activityByDay.get(name) ?? 0) + 1);
  }
  const trend = Array.from({ length: 5 }, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() - (4 - index));
    const name = date.toLocaleDateString(undefined, { weekday: "short" });
    return { name, revenue: index === 4 ? metrics.revenue ?? 0 : 0, activity: activityByDay.get(name) ?? 0 };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Executive Dashboard</h1>
        <p className="text-sm text-muted-foreground">Revenue, customers, meetings, tickets, health score, and live agent activity.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Object.entries(metrics).map(([key, value], index) => {
          const Icon = metricIcons[key] ?? Bot;
          return (
            <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
              <Card>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{key.replace(/([A-Z])/g, " $1")}</span>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-3 text-2xl font-semibold">{key === "revenue" ? currency(value) : value}</div>
              </Card>
            </motion.div>
          );
        })}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader><CardTitle>Operations Trend</CardTitle></CardHeader>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} axisLine={{ stroke: "var(--color-border)" }} tickLine={{ stroke: "var(--color-border)" }} />
                <YAxis tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} axisLine={{ stroke: "var(--color-border)" }} tickLine={{ stroke: "var(--color-border)" }} />
                <Tooltip contentStyle={{ backgroundColor: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: 10, color: "var(--color-text-primary)" }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.2} />
                <Area type="monotone" dataKey="activity" stroke="var(--color-accent)" fill="var(--color-accent)" fillOpacity={0.14} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader><CardTitle>Revenue Status</CardTitle></CardHeader>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={Object.entries(data.revenueByStatus ?? {}).map(([_id, total]) => ({ _id, total }))} dataKey="total" nameKey="_id" innerRadius={58} outerRadius={92}>
                  {Object.keys(data.revenueByStatus ?? {}).map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: 10, color: "var(--color-text-primary)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent Emails</CardTitle></CardHeader>
          <div className="space-y-3">
            {(data.recentEmails ?? []).map((email) => (
              <div className="rounded-md border p-3" key={email._id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{email.subject}</div>
                  <Badge tone={email.sentiment === "negative" ? "red" : email.sentiment === "positive" ? "green" : "blue"}>{email.sentiment}</Badge>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{email.intent} from {email.sender}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader><CardTitle>Agent Activity</CardTitle></CardHeader>
          <div className="space-y-3">
            {(data.latestAgentExecutions ?? []).map((execution) => (
              <div className="rounded-md border p-3" key={execution._id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{execution.agentId}</div>
                  <Badge tone={execution.status === "failed" ? "red" : execution.status === "completed" ? "green" : "amber"}>{execution.status}</Badge>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{formatDate(execution.createdAt)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
