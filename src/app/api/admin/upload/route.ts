import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = (formData.get('bucket') as string) || 'dish-images';

    if (!file) return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });

    console.log('[upload] file name:', file.name, '| size:', file.size, '| type:', file.type, '| bucket:', bucket);

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    console.log('[upload] NEXT_PUBLIC_SUPABASE_URL present:', !!supabaseUrl);

    // ── Local filesystem fallback ────────────────────────────────────────────
    if (!supabaseUrl) {
      const dirName = bucket === 'dish-images' ? 'menu' : bucket;
      const uploadDir = path.join(process.cwd(), 'public', 'images', dirName);

      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, buffer);

      const publicUrl = `/images/${dirName}/${filename}`;
      console.log('[upload] local save success:', publicUrl);
      return NextResponse.json({ success: true, url: publicUrl });
    }

    // ── Supabase Storage upload ──────────────────────────────────────────────
    console.log('[upload] importing createAdminClient...');
    const { createAdminClient } = await import('@/lib/supabase/admin');

    console.log('[upload] creating admin client...');
    const supabase = createAdminClient();
    console.log('[upload] admin client created, uploading to bucket:', bucket);

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error('[upload] storage upload error:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filename);
    console.log('[upload] upload success, publicUrl:', publicUrl);

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error('[upload] caught error:', error);
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

