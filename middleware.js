import { NextResponse } from 'next/server';

export function middleware(request) {
    const { searchParams } = new URL(request.url);
    const testCountry = searchParams.get('test_country');
    const response = NextResponse.next();

    // 1. Check for manual override (for testing)
    // 2. Detect country from Vercel/Netlify headers
    // 3. Fallback to IN
    const country = testCountry ||
        request.headers.get('x-vercel-ip-country') ||
        request.headers.get('cf-ipcountry') ||
        'IN';

    // Set country in cookie to be accessible by client-side
    response.cookies.set('user-country', country, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
    });

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
