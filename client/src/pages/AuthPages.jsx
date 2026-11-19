import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Label, Select } from "../components/ui/Form";

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <div className="text-sm font-bold text-primary">Elvora</div>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Card>{children}</Card>
      </div>
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState({ email: "admin@opspilot.local", password: "Admin12345" });
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try { const { data } = await api.post("/auth/login", form); setSession(data); navigate("/app"); toast.success("Welcome back"); }
    catch (error) { toast.error(error.response?.data?.message ?? "Login failed"); }
    finally { setLoading(false); }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage automated operations.">
      <form className="space-y-4" onSubmit={submit}>
        <div>
          <Label>Email</Label>
          <Input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" required />
        </div>
        <div>
          <Label>Password</Label>
          <Input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} type="password" required />
        </div>
        <Button className="w-full" disabled={loading}>{loading ? "Signing in" : "Login"}</Button>
        <p className="text-center text-sm text-muted-foreground">New workspace? <Link className="text-primary" to="/register">Register</Link></p>
      </form>
    </AuthShell>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Admin" });

  const submit = async (event) => {
    event.preventDefault();
    try { const { data } = await api.post("/auth/register", form); setSession(data); navigate("/app"); toast.success("Workspace access created"); }
    catch (error) { toast.error(error.response?.data?.message ?? "Registration failed"); }
  };

  return (
    <AuthShell title="Create workspace access" subtitle="Register an operator account and start automating.">
      <form className="space-y-4" onSubmit={submit}>
        <div><Label>Name</Label><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></div>
        <div><Label>Email</Label><Input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" required /></div>
        <div><Label>Password</Label><Input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} type="password" minLength={8} required /></div>
        <div>
          <Label>Role</Label>
          <Select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
            {["Admin", "Manager", "Employee", "Viewer"].map((role) => <option key={role}>{role}</option>)}
          </Select>
        </div>
        <Button className="w-full">Register</Button>
        <p className="text-center text-sm text-muted-foreground">Already have access? <Link className="text-primary" to="/login">Login</Link></p>
      </form>
    </AuthShell>
  );
}
