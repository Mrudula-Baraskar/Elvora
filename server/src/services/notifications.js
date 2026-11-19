import { emitOpsEvent } from "../config/socket.js";
import { Notification } from "../models/index.js";

export async function createNotification(input) {
  const notification = await Notification.create(input);
  emitOpsEvent("notification_created", notification);
  return notification;
}
