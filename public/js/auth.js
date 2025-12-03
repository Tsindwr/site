const { createClient } = window.supabase || window.Supabase || {};

if (!createClient) {
    console.error("Supabase client library not found. Check extra_javascript in mkdocs.yml.");
}

const SUPABASE_URL = 'https://oqngifbqawctgqxgtxfl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_yWdBi5JCNErFyMqF6F6pbw_iasqMQjj';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);