import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const txns = await prisma.transaction.findMany({ orderBy: { date: "desc" }, take: 200 });
  return NextResponse.json(txns);
}

export async function POST(req) {
  const body = await req.json();
  if (Array.isArray(body)) {
    await prisma.transaction.createMany({
      data: body.map((r) => ({ ...r, date: new Date(r.date) })),
    });
    return NextResponse.json({ ok: true, count: body.length });
  }
  const txn = await prisma.transaction.create({ data: { ...body, date: new Date(body.date) } });
  return NextResponse.json(txn);
}
