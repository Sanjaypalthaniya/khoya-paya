import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reportServerError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    reportServerError("database-health-check", error);

    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
      },
      { status: 500 },
    );
  }
}
