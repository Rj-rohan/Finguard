import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password)
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user)
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

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
    console.error("[login]", e);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
