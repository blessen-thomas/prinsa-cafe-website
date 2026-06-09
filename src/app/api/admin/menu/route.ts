import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const getFilePath = () => path.join(process.cwd(), 'data', 'menu.json');

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
      const dishes = rawData.map((d: any) => ({
        id: String(d.id),
        name: d.name,
        description: d.description,
        price: d.price,
        category_id: d.category?.toLowerCase().replace(/[\s/]+/g, '-') || 'default',
        image_url: d.image,
        is_veg: d.is_veg ?? d.isVeg ?? false,
        is_featured: d.is_featured || false,
        is_available: d.is_available !== false,
        sort_order: d.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        categories: {
          id: d.category?.toLowerCase().replace(/[\s/]+/g, '-'),
          name: d.category || 'Default',
          slug: d.category?.toLowerCase().replace(/[\s/]+/g, '-')
        }
      }));
      return NextResponse.json({ success: true, data: dishes });
    }

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('dishes')
      .select('*, categories(name)')
      .order('categories(sort_order)')
      .order('sort_order');
      
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, ...insertData } = body;
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      const rawData = await getLocalData();
      const newId = rawData.length ? Math.max(...rawData.map((d: any) => Number(d.id) || 0)) + 1 : 1;
      const categoryName = (insertData.category_id || 'default').split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

      const newDish = {
        id: newId,
        category: categoryName,
        name: insertData.name,
        price: insertData.price,
        description: insertData.description,
        image: insertData.image_url,
        is_veg: insertData.is_veg,
        is_featured: insertData.is_featured,
        is_available: insertData.is_available
      };
      
      rawData.push(newDish);
      await saveLocalData(rawData);
      return NextResponse.json({ success: true });
    }

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    const { error } = await supabase.from('dishes').insert([insertData]);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, categories, ...updates } = await request.json();
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      const rawData = await getLocalData();
      const index = rawData.findIndex((d: any) => String(d.id) === String(id));
      if (index !== -1) {
        if (updates.category_id) rawData[index].category = updates.category_id.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        if (updates.name !== undefined) rawData[index].name = updates.name;
        if (updates.price !== undefined) rawData[index].price = updates.price;
        if (updates.description !== undefined) rawData[index].description = updates.description;
        if (updates.image_url !== undefined) rawData[index].image = updates.image_url;
        if (updates.is_veg !== undefined) rawData[index].is_veg = updates.is_veg;
        if (updates.is_featured !== undefined) rawData[index].is_featured = updates.is_featured;
        if (updates.is_available !== undefined) rawData[index].is_available = updates.is_available;
        await saveLocalData(rawData);
      }
      return NextResponse.json({ success: true });
    }

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    const { error } = await supabase.from('dishes').update(updates).eq('id', id);
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
      const filtered = rawData.filter((d: any) => String(d.id) !== String(id));
      await saveLocalData(filtered);
      return NextResponse.json({ success: true });
    }

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    const { error } = await supabase.from('dishes').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
