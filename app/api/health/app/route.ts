import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "Khoya Paya",
    environment: process.env.NODE_ENV || "development",
  });
}
