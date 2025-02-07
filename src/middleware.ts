import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 添加更多调试信息
  console.log("Request URL:", request.url);
  console.log("AUTH_SECRET exists:", !!process.env.AUTH_SECRET);
  
  const token = await getToken({ 
    req: request,
    // 确保 secret 存在，如果不存在使用一个默认值
    secret: process.env.AUTH_SECRET
  });

  console.log("Token result:", !!token);

  if (!token && request.nextUrl.pathname.startsWith("/admin")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (token && request.nextUrl.pathname.startsWith("/admin")) {
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};