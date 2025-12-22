import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    // Construct backend callback URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    const backendCallbackUrl = `${backendUrl}/auth/google/callback?code=${code}&state=${state}`;

    // Redirect directly to backend for token exchange
    return NextResponse.redirect(backendCallbackUrl);
  } catch (error: any) {
    console.error('Google callback error:', error);
    return NextResponse.redirect(
      new URL('/auth/login?error=server_error', request.url)
    );
  }
}