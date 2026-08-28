import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, saveUser, saveAuditEvent, verifyUser } from '@/lib/storeAdapter';
import { createBuyerSession } from '@/lib/auth';
import { setSessionCookie } from '@/lib/session';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || (process.env.NODE_ENV === 'production' ? 'https://aartha.site/api/auth/google/callback' : 'http://localhost:3000/api/auth/google/callback');

  if (error) {
    console.error('[Google OAuth Callback Error]:', error);
    return NextResponse.redirect(new URL('/signin?error=oauth_denied', request.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/signin?error=invalid_oauth_request', request.url));
  }

  // 1. Verify CSRF State
  const savedState = request.cookies.get('oauth_state')?.value;
  if (!savedState || savedState !== state) {
    console.error('[Google OAuth Error] CSRF state mismatch.');
    return NextResponse.redirect(new URL('/signin?error=state_mismatch', request.url));
  }

  try {
    // 2. Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      console.error('[Google OAuth Error] Token exchange failed:', tokenData);
      return NextResponse.redirect(new URL('/signin?error=token_exchange_failed', request.url));
    }

    const { access_token } = tokenData;

    // 3. Fetch user profile info from Google UserInfo endpoint
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const profileData = await profileResponse.json();
    if (!profileResponse.ok) {
      console.error('[Google OAuth Error] Fetching user profile failed:', profileData);
      return NextResponse.redirect(new URL('/signin?error=profile_fetch_failed', request.url));
    }

    const { email, email_verified, name } = profileData;

    // 4. Ensure email is verified by Google
    if (!email_verified) {
      console.error('[Google OAuth Error] User email is not verified by Google.');
      return NextResponse.redirect(new URL('/signin?error=email_unverified', request.url));
    }

    // 5. Look up user or create new user in local database
    let user = await getUserByEmail(email);

    if (!user) {
      // Create user automatically as a verified buyer
      user = await saveUser({
        email,
        passwordHash: 'google-oauth-managed-auth', // Indicates Google login
        role: 'buyer',
        phone: '',
        companyName: `${name || 'Google User'}'s Enterprise`,
        contactName: name || 'Google User',
        isVerified: true, // Google email is already verified
      });

      await saveAuditEvent({
        action: 'USER_REGISTER_OAUTH',
        details: `New buyer registered via Google OAuth: ${email}`,
        actorRole: 'buyer',
      });
    } else {
      // If user exists but is unverified (registered manually but not verified), verify them now
      if (!user.isVerified) {
        user.isVerified = true;
        // Verify user in store
        await verifyUser(email);
      }
    }

    // 6. Establish secure buyer session
    const token = await createBuyerSession(email);
    if (!token) {
      return NextResponse.redirect(new URL('/signin?error=session_creation_failed', request.url));
    }

    saveAuditEvent({
      action: 'BUYER_LOGIN',
      details: `Buyer signed in via Google OAuth: ${email}`,
      actorRole: 'buyer',
    });

    // 7. Clear the temporary OAuth state cookie and redirect to dashboard
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.cookies.delete('oauth_state');
    return setSessionCookie(response, token);

  } catch (err) {
    console.error('[Google OAuth Callback Server Error]:', err);
    return NextResponse.redirect(new URL('/signin?error=server_error', request.url));
  }
}
