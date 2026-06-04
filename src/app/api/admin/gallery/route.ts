import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) return NextResponse.json({ success: true, data: [] });

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const caption = formData.get('caption') as string;
    const alt_text = formData.get('alt_text') as string;

    if (!file) return NextResponse.json({ success: false, error: 'No file' }, { status: 400 });

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage.from('gallery-images').upload(filename, buffer, {
      contentType: file.type,
      upsert: false
    });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('gallery-images').getPublicUrl(filename);

    const { error: dbError } = await supabase.from('gallery').insert({
      image_url: publicUrl,
      category,
      caption: caption || null,
      alt_text: alt_text || null,
      is_visible: true,
      sort_order: 0
    });

    if (dbError) throw dbError;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, is_visible } = await request.json();
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    const { error } = await supabase.from('gallery').update({ is_visible }).eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const imageUrl = url.searchParams.get('url');
    
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    if (imageUrl) {
      const filename = imageUrl.split('/').pop();
      if (filename) await supabase.storage.from('gallery-images').remove([filename]);
    }

    const { error } = await supabase.from('gallery').delete().eq('id', id);
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
  }
}
