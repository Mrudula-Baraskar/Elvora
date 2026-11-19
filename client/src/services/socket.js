import { io } from "socket.io-client";
import toast from "react-hot-toast";

let socket;

export function connectSocket(queryClient) {
  if (socket?.connected) return socket;
  socket = io(import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5000", { withCredentials: true });
  for (const [event, message] of Object.entries({ new_email: "New email received", new_ticket: "New support ticket", invoice_created: "Invoice created", meeting_created: "Meeting created", agent_completed: "Agent workflow completed", workflow_executed: "Workflow executed", notification_created: "New notification" })) {
    socket.on(event, () => { toast(message); queryClient.invalidateQueries(); });
  }
  return socket;
}
