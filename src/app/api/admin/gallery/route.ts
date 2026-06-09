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
  } catch (error: any) {
    console.error('[gallery/GET] error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || String(error), details: { name: error?.name, code: error?.code } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const caption = formData.get('caption') as string;
    const alt_text = formData.get('alt_text') as string;

    if (!file) return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });

    console.log('[gallery/POST] file:', file.name, '| size:', file.size, '| type:', file.type);
    console.log('[gallery/POST] NEXT_PUBLIC_SUPABASE_URL present:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('[gallery/POST] SUPABASE_SERVICE_ROLE_KEY present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    console.log('[gallery/POST] importing createAdminClient...');
    const { createAdminClient } = await import('@/lib/supabase/admin');

    console.log('[gallery/POST] creating admin client...');
    const supabase = createAdminClient();
    console.log('[gallery/POST] admin client created');

    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    console.log('[gallery/POST] uploading to storage bucket: gallery-images, filename:', filename);
    const { error: uploadError } = await supabase.storage
      .from('gallery-images')
      .upload(filename, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error('[gallery/POST] storage upload error:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage.from('gallery-images').getPublicUrl(filename);
    console.log('[gallery/POST] upload success, publicUrl:', publicUrl);

    const { error: dbError } = await supabase.from('gallery').insert({
      image_url: publicUrl,
      category,
      caption: caption || null,
      alt_text: alt_text || null,
      is_visible: true,
      sort_order: 0,
    });

    if (dbError) {
      console.error('[gallery/POST] db insert error:', dbError);
      throw dbError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[gallery/POST] caught error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || String(error),
        details: {
          name: error?.name,
          code: error?.code,
          statusCode: error?.statusCode,
          hint: error?.hint,
          stack: error?.stack,
        },
      },
      { status: 500 }
    );
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
  } catch (error: any) {
    console.error('[gallery/PATCH] error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || String(error), details: { name: error?.name, code: error?.code } },
      { status: 500 }
    );
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
  } catch (error: any) {
    console.error('[gallery/DELETE] error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || String(error), details: { name: error?.name, code: error?.code } },
      { status: 500 }
    );
  }
}

