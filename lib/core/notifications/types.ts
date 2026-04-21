import type { OutboxJobState } from "@/lib/core/status";

export type NotificationChannel = "email" | "sms" | "slack";

export type NotificationRecord = {
  id: string;
  channel: NotificationChannel;
  recipient: string;
  template: string;
  payload: Record<string, unknown>;
  state: OutboxJobState;
  attempts: number;
  createdAt: string;
};
