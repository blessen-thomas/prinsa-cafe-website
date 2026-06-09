import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

async function getFallbackMenu(search: string | null, category: string | null, featured: string | null) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'menu.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const rawData = JSON.parse(fileContents);
    
    let dishes = rawData.map((d: any) => ({
      id: String(d.id),
      name: d.name,
      description: d.description,
      price: d.price,
      category_id: d.category.toLowerCase().replace(/[\s/]+/g, '-'),
      image_url: d.image,
      is_veg: d.is_veg ?? d.isVeg ?? false,
      is_featured: false,
      is_available: true,
      sort_order: d.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: {
        id: d.category.toLowerCase().replace(/[\s/]+/g, '-'),
        name: d.category,
        slug: d.category.toLowerCase().replace(/[\s/]+/g, '-')
      }
    }));

    if (featured === 'true') {
      dishes = dishes.slice(0, 6);
    }
    if (category && category !== 'all') {
      dishes = dishes.filter((d: any) => d.category.slug === category);
    }
    if (search) {
      const s = search.toLowerCase();
      dishes = dishes.filter((d: any) => d.name.toLowerCase().includes(s));
    }

    return NextResponse.json({ success: true, data: dishes });
  } catch (e) {
    console.error('Fallback menu error:', e);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const featured = url.searchParams.get('featured');
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return await getFallbackMenu(search, category, featured);
    }

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    let query = supabase
      .from('dishes')
      .select('*, categories(name, slug)')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (featured === 'true') query = query.eq('is_featured', true);
    if (category && category !== 'all') {
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', category).single();
      if (cat) query = query.eq('category_id', cat.id);
    }
    if (search) query = query.ilike('name', `%${search}%`);

    query = query.eq('is_available', true);

    const { data: dishes, error } = await query;
    if (error) {
      console.warn('Supabase query failed, falling back to JSON:', error);
      return await getFallbackMenu(search, category, featured);
    }

    // Get average ratings
    const dishIds = (dishes || []).map((d) => d.id);
    let ratingsMap: Record<string, { avg: number; count: number }> = {};
    if (dishIds.length) {
      const { data: reviews } = await supabase
        .from('reviews')
        .select('dish_id, rating')
        .in('dish_id', dishIds)
        .eq('is_approved', true);

      if (reviews) {
        const grouped: Record<string, number[]> = {};
        reviews.forEach((r) => {
          if (r.dish_id) {
            if (!grouped[r.dish_id]) grouped[r.dish_id] = [];
            grouped[r.dish_id].push(r.rating);
          }
        });
        for (const [id, ratings] of Object.entries(grouped)) {
          ratingsMap[id] = {
            avg: Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10,
            count: ratings.length,
          };
        }
      }
    }

    const enriched = (dishes || []).map((d) => ({
      ...d,
      category: d.categories,
      average_rating: ratingsMap[d.id]?.avg || 0,
      review_count: ratingsMap[d.id]?.count || 0,
    }));

    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Menu API error:', error);
    const url = new URL(request.url);
    return await getFallbackMenu(url.searchParams.get('search'), url.searchParams.get('category'), url.searchParams.get('featured'));
  }
}
