import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { closeItemCommunityPost, updateItemWithCommunityIntegration } from "@/lib/items/community-integration";
import { statusUpdateSchema } from "@/lib/validations/item";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const parsed = statusUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !["LOST", "FOUND", "MISSING"].includes(parsed.data.status)) return NextResponse.json({ success: false, message: "Choose Lost, Found, or Missing." }, { status: 400 });
  try {
    const result = await updateItemWithCommunityIntegration(user.id, id, { status: parsed.data.status, lostModeEnabled: parsed.data.status === "LOST", visibility: "PUBLIC", publicSearchVisible: true }, true);
    return NextResponse.json({ success: true, message: "Item published to the Community Feed.", data: result });
  } catch (error) { return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Unable to publish item." }, { status: 400 }); }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try { return NextResponse.json({ success: true, message: "Community post closed.", data: { communityPost: await closeItemCommunityPost(user.id, id) } }); }
  catch (error) { return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Unable to close post." }, { status: 404 }); }
}
