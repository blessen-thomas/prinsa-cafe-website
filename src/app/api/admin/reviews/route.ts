import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const getFilePath = () => path.join(process.cwd(), 'data', 'reviews.json');

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
      
      const reviews = rawData.map((r: any) => ({
        id: r.id,
        customer_name: r.customerName,
        email: r.email,
        rating: r.rating,
        review_text: r.comment,
        is_approved: r.approved,
        is_featured: r.is_featured || false,
        created_at: r.createdAt,
        dish_id: r.dishId,
        dish: r.dishId ? { id: r.dishId, name: r.dishName } : null
      }));

      // Sort by created_at descending
      reviews.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return NextResponse.json({ success: true, data: reviews });
    }

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('reviews')
      .select('*, dish:dishes(id, name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, ...updates } = await request.json();
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      const rawData = await getLocalData();
      const index = rawData.findIndex((r: any) => String(r.id) === String(id));
      if (index !== -1) {
        if (updates.is_approved !== undefined) rawData[index].approved = updates.is_approved;
        if (updates.is_featured !== undefined) rawData[index].is_featured = updates.is_featured;
        await saveLocalData(rawData);
      }
      return NextResponse.json({ success: true });
    }

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    const { error } = await supabase.from('reviews').update(updates).eq('id', id);
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
      const filtered = rawData.filter((r: any) => String(r.id) !== String(id));
      await saveLocalData(filtered);
      return NextResponse.json({ success: true });
    }

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
