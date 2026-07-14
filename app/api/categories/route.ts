import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/api-response";
export async function GET() {
  const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  return successResponse("Categories loaded.", { categories });
}
