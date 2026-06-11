import { NextResponse } from 'next/server';

// ── Utilities ─────────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function requireSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

// ── GET — fetch ALL categories (including hidden) for admin panel ──────────────

export async function GET() {
  try {
    if (!requireSupabase()) {
      return NextResponse.json(
        { success: false, error: 'Supabase is not configured.' },
        { status: 503 }
      );
    }

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (error: any) {
    console.error('[admin/categories/GET]', error);
    return NextResponse.json(
      { success: false, error: error?.message ?? 'Failed to fetch categories.' },
      { status: 500 }
    );
  }
}

// ── POST — create a category ──────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Category name is required.' },
        { status: 400 }
      );
    }

    if (!requireSupabase()) {
      return NextResponse.json(
        { success: false, error: 'Supabase is not configured.' },
        { status: 503 }
      );
    }

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    const slug = generateSlug(name);

    // Append to end — get current max sort_order
    const { data: existing } = await supabase
      .from('categories')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1);

    const sort_order =
      existing && existing.length > 0 ? (existing[0].sort_order ?? 0) + 1 : 0;

    const { data, error } = await supabase
      .from('categories')
      .insert([
        {
          name: name.trim(),
          slug,
          description: description?.trim() ?? '',
          sort_order,
          is_visible: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    console.error('[admin/categories/POST]', error);
    return NextResponse.json(
      { success: false, error: error?.message ?? 'Failed to create category.' },
      { status: 500 }
    );
  }
}

// ── PATCH — update name / is_visible ─────────────────────────────────────────

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, is_visible } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required.' },
        { status: 400 }
      );
    }

    if (!requireSupabase()) {
      return NextResponse.json(
        { success: false, error: 'Supabase is not configured.' },
        { status: 503 }
      );
    }

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json(
          { success: false, error: 'Category name cannot be empty.' },
          { status: 400 }
        );
      }
      updates.name = name.trim();
      updates.slug = generateSlug(name);
    }

    if (description !== undefined) updates.description = description.trim();
    if (is_visible !== undefined) updates.is_visible = Boolean(is_visible);

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[admin/categories/PATCH]', error);
    return NextResponse.json(
      { success: false, error: error?.message ?? 'Failed to update category.' },
      { status: 500 }
    );
  }
}

// ── DELETE — delete category, blocked if dishes use it ───────────────────────

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required.' },
        { status: 400 }
      );
    }

    if (!requireSupabase()) {
      return NextResponse.json(
        { success: false, error: 'Supabase is not configured.' },
        { status: 503 }
      );
    }

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    // Guard: check for dishes using this category
    const { data: dishes, error: dishError } = await supabase
      .from('dishes')
      .select('id, name')
      .eq('category_id', id);

    if (dishError) throw dishError;

    if (dishes && dishes.length > 0) {
      const preview = dishes
        .slice(0, 3)
        .map((d: { name: string }) => `"${d.name}"`)
        .join(', ');
      const overflow = dishes.length > 3 ? ` and ${dishes.length - 3} more` : '';

      return NextResponse.json(
        {
          success: false,
          code: 'CATEGORY_IN_USE',
          error: `Cannot delete: ${dishes.length} dish${dishes.length > 1 ? 'es are' : ' is'} using this category (${preview}${overflow}). Reassign or delete those dishes first.`,
        },
        { status: 409 }
      );
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[admin/categories/DELETE]', error);
    return NextResponse.json(
      { success: false, error: error?.message ?? 'Failed to delete category.' },
      { status: 500 }
    );
  }
}
