import { getCurrentUser } from "@/lib/auth";
export async function getAdmin() { const user = await getCurrentUser(); return user && !user.isBlocked && user.role === "ADMIN" ? user : null; }
