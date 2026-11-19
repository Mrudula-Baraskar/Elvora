import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { Homepage } from "./pages/Homepage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import { DashboardPage } from "./pages/Dashboard";
import {
  AiControlPage,
  CrmPage,
  CustomerDetailPage,
  CustomersPage,
  EmailsPage,
  InvoicesPage,
  MeetingsPage,
  ReportsPage,
  SettingsPage,
  TicketsPage,
  UsersPage,
  WorkflowsPage
} from "./pages/ModulePages";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route path="emails" element={<EmailsPage />} />
          <Route path="meetings" element={<MeetingsPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="crm" element={<CrmPage />} />
          <Route path="workflows" element={<WorkflowsPage />} />
          <Route path="ai-control" element={<AiControlPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
