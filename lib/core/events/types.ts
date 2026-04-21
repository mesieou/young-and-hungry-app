export type DomainEvent = {
  id: string;
  aggregateType: "quote" | "booking" | "payment" | "notification" | "ops_issue";
  aggregateId: string;
  aggregateVersion: number;
  eventType: string;
  idempotencyKey: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
};
