const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testFetch() {
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log('Fetching orders...');
    const start = Date.now();
    try {
        const { data, error } = await supabase.from('orders').select('id').limit(5);
        const end = Date.now();
        if (error) {
            console.error('Error:', error);
        } else {
            console.log('Success!', data.length, 'orders found in', end - start, 'ms');
        }
    } catch (e) {
        console.error('Exception:', e);
    }
}

testFetch();
