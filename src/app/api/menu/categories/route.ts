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
    
    return NextResponse.json({ success: true, data: categories });
  } catch (e) {
    console.error('Fallback categories error:', e);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return await getFallbackCategories();
    }

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.warn('Supabase query failed, falling back to JSON:', error);
      return await getFallbackCategories();
    }
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Categories API error:', error);
    return await getFallbackCategories();
  }
}
