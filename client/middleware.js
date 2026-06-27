import { NextResponse } from "next/server";

export default function middleware(request) {
  const response = NextResponse.next();
  
  // Add caching headers for static assets
  if (request.nextUrl.pathname.startsWith('/_next/static/') || 
      request.nextUrl.pathname.startsWith('/images/') ||
      request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
