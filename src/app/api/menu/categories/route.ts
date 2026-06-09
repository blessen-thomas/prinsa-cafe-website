import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

async function getFallbackCategories() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'menu.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const rawData = JSON.parse(fileContents);
    
    const categorySet = new Set<string>();
    rawData.forEach((d: any) => categorySet.add(d.category));
    
    const categories = Array.from(categorySet).map((name, index) => ({
      id: name.toLowerCase().replace(/[\s/]+/g, '-'),
      name: name,
      slug: name.toLowerCase().replace(/[\s/]+/g, '-'),
      description: '',
      sort_order: index,
      is_visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    
    return NextResponse.json({ success: true, source: "MENU_JSON_FALLBACK", data: categories });
  } catch (e) {
    console.error('Fallback categories error:', e);
    return NextResponse.json({ success: true, source: "MENU_JSON_FALLBACK", data: [] });
  }
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return await getFallbackCategories();
    }

    console.log(
      '[categories/GET] supabaseUrl present:',
      !!supabaseUrl,
      '| supabaseKey present:',
      !!supabaseKey
    );

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    console.log('[categories/GET] querying categories table');

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true });

    console.log(
      '[categories/GET] rows returned:',
      data?.length ?? 'null',
      '| error:',
      JSON.stringify(error)
    );

    if (error) {
      console.error('[categories/GET] Supabase query failed:', error);

      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          hint: error.hint,
          details: error.details,
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, source: "SUPABASE", data: data || [] });
  } catch (error: any) {
    console.error('[categories/GET] caught error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
