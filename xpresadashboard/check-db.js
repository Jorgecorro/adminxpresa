
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTables() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1);

    if (error) {
        console.log('Table "products" might not exist:', error.message);
    } else {
        console.log('Table "products" exists. Sample data:', data);
    }

    // Try to find what tables exist
    const { data: tables, error: tablesError } = await supabase.rpc('get_tables');
    if (tablesError) {
        console.log('RPC get_tables failed (expected if not defined).');
    } else {
        console.log('Existing tables:', tables);
    }
}

checkTables();
