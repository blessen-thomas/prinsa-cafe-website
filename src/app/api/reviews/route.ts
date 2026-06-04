import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const getFilePath = () => path.join(process.cwd(), 'data', 'reviews.json');
const getMenuPath = () => path.join(process.cwd(), 'data', 'menu.json');

async function getLocalData() {
  try {
    const fileContents = await fs.readFile(getFilePath(), 'utf8');
    return JSON.parse(fileContents);
  } catch (e) {
    return [];
  }
}

async function getLocalMenuData() {
  try {
    const fileContents = await fs.readFile(getMenuPath(), 'utf8');
    return JSON.parse(fileContents);
  } catch (e) {
    return [];
  }
}

async function saveLocalData(data: any[]) {
  await fs.writeFile(getFilePath(), JSON.stringify(data, null, 2), 'utf8');
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const featured = url.searchParams.get('featured');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      const rawData = await getLocalData();
      let approvedReviews = rawData.filter((r: any) => r.approved);
      
      if (featured === 'true') {
         approvedReviews = approvedReviews.filter((r: any) => r.is_featured); 
      }
      
      approvedReviews.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      const total = approvedReviews.length;
      const paginated = approvedReviews.slice(offset, offset + limit);

      const reviews = paginated.map((r: any) => ({
        id: r.id,
        customer_name: r.customerName,
        rating: r.rating,
        review_text: r.comment,
        is_approved: r.approved,
        is_featured: r.is_featured || false,
        created_at: r.createdAt,
        dish_id: r.dishId,
        dish: r.dishId ? { id: r.dishId, name: r.dishName, image_url: '' } : null
      }));

      return NextResponse.json({
        success: true,
        data: reviews,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    let query = supabase
      .from('reviews')
      .select('*, dishes(id, name, image_url)', { count: 'exact' })
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (featured === 'true') query = query.eq('is_featured', true);

    const { data, error, count } = await query;
    if (error) throw error;

    const reviews = (data || []).map((r) => ({ ...r, dish: r.dishes }));
    const total = count || 0;

    return NextResponse.json({
      success: true,
      data: reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Reviews API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_name, email, rating, review_text, dish_id } = body;

    if (!customer_name || !rating || !review_text) {
      return NextResponse.json({ success: false, error: 'Name, rating, and review are required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      const rawData = await getLocalData();
      const newId = Date.now().toString();
      
      let dishName = null;
      if (dish_id) {
        const menuData = await getLocalMenuData();
        const dish = menuData.find((d: any) => String(d.id) === String(dish_id));
        if (dish) dishName = dish.name;
      }

      const newReview = {
        id: newId,
        dishId: dish_id || null,
        dishName: dishName,
        customerName: customer_name,
        email: email || null,
        rating: rating,
        comment: review_text,
        approved: false,
        is_featured: false,
        createdAt: new Date().toISOString()
      };
      
      rawData.push(newReview);
      await saveLocalData(rawData);
      
      return NextResponse.json({
        success: true,
        message: 'Thank you! Your review will appear after approval.',
      });
    }

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    const { error } = await supabase.from('reviews').insert({
      customer_name,
      email: email || null,
      rating,
      review_text,
      dish_id: dish_id || null,
      is_approved: false,
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your review will appear after approval.',
    });
  } catch (error) {
    console.error('Review POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit review' }, { status: 500 });
  }
}
