import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../../supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      // For unauthenticated users, return guest role
      return NextResponse.json({
        role: 'guest',
        isAuthenticated: false
      });
    }

    // Get user role from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      // Default to 'free' for authenticated users without profile
      return NextResponse.json({
        role: 'free',
        isAuthenticated: true,
        userId: user.id
      });
    }

    const userRole = profileData?.role || 'free';

    return NextResponse.json({
      role: userRole,
      isAuthenticated: true,
      userId: user.id
    });

  } catch (error) {
    console.error('Error in user info API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
