import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isOnboarding = pathname.startsWith("/onboarding");

  const role = request.cookies.get("outsidecrowd_role")?.value;

  // Only protect explore (light gating, no auth enforcement)
  if (!isOnboarding && pathname.startsWith("/explore")) {
    if (!role) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/explore/:path*"],
};
