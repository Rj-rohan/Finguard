import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const alerts = await prisma.alert.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(alerts);
}

export async function PATCH(req) {
  const { id } = await req.json();
  await prisma.alert.update({ where: { id }, data: { read: true } });
  return NextResponse.json({ ok: true });
}
