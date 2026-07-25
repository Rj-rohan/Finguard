import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("fg_token")?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ user: null }, { status: 401 });

  return NextResponse.json({ user: { id: payload.id, name: payload.name, email: payload.email } });
}
