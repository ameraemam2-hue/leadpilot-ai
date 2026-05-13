import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "leadpilot-ai",
    phase: 1,
    time: new Date().toISOString(),
  });
}
