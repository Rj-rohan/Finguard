import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name?.trim() || !email?.trim() || !password)
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });

    if (password.length < 6)
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing)
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name: name.trim(), email: email.toLowerCase().trim(), password: hashed },
    });

    const token = await signToken({ id: user.id, name: user.name, email: user.email });

    const res = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
    res.cookies.set("fg_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
