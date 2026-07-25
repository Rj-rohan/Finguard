import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const subs = await prisma.subscription.findMany({ orderBy: { nextPayment: "asc" } });
  return NextResponse.json(subs);
}

export async function POST(req) {
  const body = await req.json();
  const sub = await prisma.subscription.create({ data: body });
  return NextResponse.json(sub);
}

export async function PATCH(req) {
  const { id, ...data } = await req.json();
  const sub = await prisma.subscription.update({ where: { id }, data });
  return NextResponse.json(sub);
}

export async function DELETE(req) {
  const { id } = await req.json();
  await prisma.subscription.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
