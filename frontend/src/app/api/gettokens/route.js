import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

export async function GET() {
  try {
    // Get latest tokens from database
    const { data, error } = await supabase
      .from('oauth_tokens')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    return NextResponse.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      email: data.email,
      expires_at: data.expires_at
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve tokens' },
      { status: 500 }
    );
  }
} 