import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware is minimal - client-side handles auth via localStorage
// This middleware only runs for basic routing, auth is checked client-side
export function middleware(_request: NextRequest) {
  // Let all requests pass through
  // Auth protection is handled by the (protected) layout component
  // which checks localStorage for tokens
  return NextResponse.next();
}

export const config = {
  // Match all routes except static files, api routes, and _next
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
