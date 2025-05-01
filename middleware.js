import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/logo192.png') ||
    pathname.startsWith('/logo512.png')
  ) {
    return NextResponse.next();
  }

  // Add auth logic here if needed

  return NextResponse.next();
}
