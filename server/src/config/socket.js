import { Server } from "socket.io";
import { env } from "./env.js";

let io;

const allowedOrigins = [
  ...env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean),
  "http://127.0.0.1:5173",
  "http://localhost:5173"
];

export function initSocket(server) {
  io = new Server(server, { cors: { origin: allowedOrigins, credentials: true } });
  io.on("connection", (socket) => {
    socket.join("ops");
    socket.on("join_customer", (customerId) => {
      if (typeof customerId === "string" && customerId.trim()) socket.join(`customer:${customerId.trim()}`);
    });
  });
  return io;
}

export function emitOpsEvent(event, payload) {
  io?.to("ops").emit(event, payload);
}
