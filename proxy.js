import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const PUBLIC = ["/", "/login", "/signup", "/api/auth", "/api/demo"];

export async function proxy(req) {
  const { pathname } = req.nextUrl;

  if (
    PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("fg_token")?.value;
  const payload = token ? await verifyToken(token) : null;

  if (!payload) {
    const url = new URL("/login", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
