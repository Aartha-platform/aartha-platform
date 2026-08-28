import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || (process.env.NODE_ENV === 'production' ? 'https://aartha.site/api/auth/google/callback' : 'http://localhost:3000/api/auth/google/callback');

  if (!clientId) {
    console.error('[Google OAuth Error] GOOGLE_CLIENT_ID env variable is not defined.');
    return NextResponse.json({ error: 'Google OAuth is not configured on this server.' }, { status: 500 });
  }

  // Generate a secure random state string to mitigate CSRF attacks
  const state = crypto.randomBytes(32).toString('hex');

  const googleUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleUrl.searchParams.set('client_id', clientId);
  googleUrl.searchParams.set('redirect_uri', redirectUri);
  googleUrl.searchParams.set('response_type', 'code');
  googleUrl.searchParams.set('scope', 'openid email profile');
  googleUrl.searchParams.set('state', state);
  googleUrl.searchParams.set('prompt', 'select_account');

  const response = NextResponse.redirect(googleUrl.toString());
  
  // Save the state in an HttpOnly cookie to verify in the callback handler
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 300, // 5 minutes
  });

  return response;
}
