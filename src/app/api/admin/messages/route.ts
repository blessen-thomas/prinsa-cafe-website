import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const getFilePath = () => path.join(process.cwd(), 'data', 'messages.json');

async function getLocalData() {
  try {
    const fileContents = await fs.readFile(getFilePath(), 'utf8');
    return JSON.parse(fileContents);
  } catch (e) {
    return [];
  }
}

async function saveLocalData(data: any[]) {
  await fs.writeFile(getFilePath(), JSON.stringify(data, null, 2), 'utf8');
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      const rawData = await getLocalData();
      
      const messages = rawData.map((m: any) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        phone: m.phone,
        subject: m.subject,
        message: m.message,
        is_read: m.is_read || false,
        created_at: m.createdAt
      }));

      // Sort by created_at descending
      messages.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return NextResponse.json({ success: true, data: messages });
    }

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    const { data, error } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, is_read } = await request.json();
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      const rawData = await getLocalData();
      const index = rawData.findIndex((m: any) => String(m.id) === String(id));
      if (index !== -1) {
        rawData[index].is_read = is_read;
        await saveLocalData(rawData);
      }
      return NextResponse.json({ success: true });
    }

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    const { error } = await supabase.from('contact_submissions').update({ is_read }).eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      const rawData = await getLocalData();
      const filtered = rawData.filter((m: any) => String(m.id) !== String(id));
      await saveLocalData(filtered);
      return NextResponse.json({ success: true });
    }

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    const { error } = await supabase.from('contact_submissions').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
