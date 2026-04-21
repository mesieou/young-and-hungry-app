export type OpsIssueSeverity = "info" | "warning" | "critical";

export type OpsIssue = {
  id: string;
  severity: OpsIssueSeverity;
  category: "booking" | "payment" | "notification" | "system";
  status: "open" | "acknowledged" | "resolved";
  title: string;
  payload: Record<string, unknown>;
  createdAt: string;
};
