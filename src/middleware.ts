import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Auth } from '@auth/core';

export async function middleware(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });

    console.log("Request URL:", request.url);
    console.log("Token exists:", !!token);
    console.log("Token role:", token?.role);

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
  } catch (error) {
    console.error("Middleware error:", error);
    // 发生错误时重定向到登录页面
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// 明确指定中间件配置
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
  // runtime: 'edge',  // 显式声明使用 edge runtime
};