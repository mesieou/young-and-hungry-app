import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function GET(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;
  const providedSecret = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    status: "queued",
    message: "Outbox processor endpoint is scaffolded. Wire RPC-backed job claiming before enabling production cron processing.",
    timestamp: new Date().toISOString()
  });
}
