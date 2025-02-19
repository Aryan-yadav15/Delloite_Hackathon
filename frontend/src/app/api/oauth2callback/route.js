import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const email = searchParams.get('state');

    if (!code) {
      return NextResponse.redirect(new URL('/manufacturer/registration/error', request.url));
    }

    // Add token exchange
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI,
        grant_type: 'authorization_code'
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();

    // Validate token response
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Invalid token response');
    }

    // Store actual tokens
    const { error } = await supabase.from('oauth_tokens').insert([{
      email,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + (tokens.expires_in * 1000))
    }]);

    if (error) {
      console.error('Supabase storage error:', error);
      throw error;
    }

    return NextResponse.redirect(new URL('/manufacturer/registration/complete', request.url));
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/manufacturer/registration/error', request.url));
  }
} 