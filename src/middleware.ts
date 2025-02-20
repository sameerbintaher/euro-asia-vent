import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check if the request is for the admin page
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // In a real application, you would:
    // 1. Verify the JWT token
    // 2. Check session validity
    // 3. Implement proper authentication checks

    // For now, we'll just check if the user is logged in
    // by looking for our auth flag in the cookies
    const isLoggedIn = request.cookies.get("isLoggedIn")?.value === "true";

    if (!isLoggedIn) {
      // Redirect to home page if not logged in
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
