import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow all static and public files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/logo') ||  // Covers /logo192.png, /logo512.png
    pathname.startsWith('/api')      // Allow API routes
  ) {
    return NextResponse.next();
  }

  // Add conditional auth logic here if needed

  return NextResponse.next();
}
