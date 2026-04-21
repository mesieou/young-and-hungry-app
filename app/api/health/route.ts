import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "young-and-hungry-app",
    timestamp: new Date().toISOString()
  });
}
