import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      let dishesCount = 0;
      let categoriesCount = 0;
      let galleryCount = 0;
      let reviewsTotal = 0;
      let reviewsPending = 0;
      let unreadMessages = 0;

      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        
        // Menu Stats
        const menuPath = path.join(process.cwd(), 'data', 'menu.json');
        try {
          const menuContents = await fs.readFile(menuPath, 'utf8');
          const menuData = JSON.parse(menuContents);
          dishesCount = menuData.length;
          const categorySet = new Set();
          menuData.forEach((d: any) => categorySet.add(d.category));
          categoriesCount = categorySet.size;
        } catch(e) {}

        // Gallery Stats
        const galleryPath = path.join(process.cwd(), 'public', 'images', 'placeholders');
        try {
          const files = await fs.readdir(galleryPath);
          galleryCount = files.length;
        } catch(e) {}

        // Reviews Stats
        const reviewsPath = path.join(process.cwd(), 'data', 'reviews.json');
        try {
          const reviewsContents = await fs.readFile(reviewsPath, 'utf8');
          const reviewsData = JSON.parse(reviewsContents);
          reviewsTotal = reviewsData.length;
          reviewsPending = reviewsData.filter((r: any) => !r.approved).length;
        } catch(e) {}

        // Messages Stats
        const messagesPath = path.join(process.cwd(), 'data', 'messages.json');
        try {
          const messagesContents = await fs.readFile(messagesPath, 'utf8');
          const messagesData = JSON.parse(messagesContents);
          unreadMessages = messagesData.filter((m: any) => !m.is_read).length;
        } catch(e) {}

      } catch (e) {
        console.error('Local stats fallback error:', e);
      }

      return NextResponse.json({ 
        success: true, 
        data: { 
          dishes: dishesCount, 
          categories: categoriesCount, 
          reviews_total: reviewsTotal, 
          reviews_pending: reviewsPending, 
          gallery_images: galleryCount || 6, 
          unread_messages: unreadMessages 
        } 
      });
    }

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    const [dishes, categories, reviewsTotal, reviewsPending, gallery, messages] = await Promise.all([
      supabase.from('dishes').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('reviews').select('id', { count: 'exact', head: true }),
      supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('is_approved', false),
      supabase.from('gallery').select('id', { count: 'exact', head: true }),
      supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('is_read', false),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        dishes: dishes.count || 0,
        categories: categories.count || 0,
        reviews_total: reviewsTotal.count || 0,
        reviews_pending: reviewsPending.count || 0,
        gallery_images: gallery.count || 0,
        unread_messages: messages.count || 0,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
