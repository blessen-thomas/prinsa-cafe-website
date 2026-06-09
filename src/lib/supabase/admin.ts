import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client using service role key — bypasses RLS
// Only use this in server-side code (API routes, server actions)
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('[createAdminClient] NEXT_PUBLIC_SUPABASE_URL present:', !!supabaseUrl);
  console.log('[createAdminClient] SUPABASE_SERVICE_ROLE_KEY present:', !!supabaseServiceKey);

  if (!supabaseUrl || !supabaseServiceKey) {
    const msg = `Missing Supabase admin credentials — URL: ${!!supabaseUrl}, KEY: ${!!supabaseServiceKey}`;
    console.error('[createAdminClient]', msg);
    throw new Error(msg);
  }

  console.log('[createAdminClient] creating client with URL:', supabaseUrl.slice(0, 30) + '...');
  const client = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  console.log('[createAdminClient] client created successfully');
  return client;
}

