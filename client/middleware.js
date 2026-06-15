import { NextResponse } from "next/server";

export default function middleware(request) {
  // During build or in production, do nothing
  if (process.env.NODE_ENV === "production") {
    return NextResponse.next();
  }

  // Check if the user is trying to access the sign-up page
  if (request.nextUrl.pathname === "/sign-up") {
    // Check if seller type is selected
    const sellerType = request.cookies.get("sellerType")?.value;
  }

  // For dashboard routes, you could add Clerk functionality here
  // But for now, just pass through all requests
  return NextResponse.next();
}

export const config = {
  // Match routes that should be protected
  matcher: ["/dashboard/:path*", "/sign-up"],
};
