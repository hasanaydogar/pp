import { getAuthHeaders } from '@/lib/auth/utils';
import { getCurrentUser } from '@/lib/auth/actions';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const headers = await getAuthHeaders();
  const headersObj = headers as Record<string, string>;

  // Get full user data from Supabase for metadata
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  return NextResponse.json({
    message: 'Authenticated request successful',
    user: {
      ...user,
      // Include full Supabase user object for metadata access
      user_metadata: supabaseUser?.user_metadata,
      email: supabaseUser?.email,
    },
    hasAuthHeader: !!headersObj.Authorization,
  });
}

