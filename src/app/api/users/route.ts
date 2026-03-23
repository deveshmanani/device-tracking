import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('is_active', true)
      .order('full_name');

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.full_name || 'No name',
      email: user.email,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
