// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the pathname from the URL
  const url = new URL(request.url);
  const path = url.pathname;

  // Define public files that should be accessible without authentication
  const publicFiles = [
    '/manifest.json',
    '/favicon.ico',
    '/logo192.png',
    '/logo512.png',
    '/robots.txt'
  ];

  // Check if the request is for a public file
  const isPublicFile = publicFiles.some(file => path === file);

  // If it's a public file, allow access without authentication
  if (isPublicFile) {
    return NextResponse.next();
  }

  // For API routes, you might want different logic
  if (path.startsWith('/api/')) {
    // Handle API routes differently if needed
    return NextResponse.next();
  }

  // Your authentication logic here
  // For example:
  // const token = request.cookies.get('token')?.value;
  // if (!token && path !== '/login') {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  return NextResponse.next();
}

// Configure middleware to run only on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (local images folder)
     * - public/ (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|public/).*)',
  ],
};
