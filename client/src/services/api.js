import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api",
  withCredentials: true
});

let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || !original || original._retried || original.url?.includes("/auth/refresh")) throw error;
    const { refreshToken, setSession, logout } = useAuthStore.getState();
    if (!refreshToken) { logout(); throw error; }
    original._retried = true;
    try {
      if (!refreshPromise) refreshPromise = api.post("/auth/refresh", { refreshToken }).then(({ data }) => { setSession(data); return data.accessToken; }).finally(() => { refreshPromise = null; });
      const token = await refreshPromise;
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch (refreshError) { logout(); throw refreshError; }
  }
);

export const resources = {
  dashboard: () => api.get("/dashboard").then((r) => r.data),
  users: () => api.get("/users").then((r) => r.data),
  customers: () => api.get("/customers").then((r) => r.data),
  customer: (id) => api.get(`/customers/${id}`).then((r) => r.data),
  emails: () => api.get("/emails").then((r) => r.data),
  meetings: () => api.get("/meetings").then((r) => r.data),
  invoices: () => api.get("/invoices").then((r) => r.data),
  tickets: () => api.get("/tickets").then((r) => r.data),
  reports: () => api.get("/reports").then((r) => r.data),
  crm: () => api.get("/crm").then((r) => r.data),
  workflows: () => api.get("/workflows").then((r) => r.data),
  agents: () => api.get("/agents").then((r) => r.data),
  executions: () => api.get("/agents/executions").then((r) => r.data),
  notifications: () => api.get("/notifications").then((r) => r.data),
  memory: (q) => api.get("/memory/search", { params: { q } }).then((r) => r.data)
};
