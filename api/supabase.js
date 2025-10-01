const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 생성
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

module.exports = supabase;
