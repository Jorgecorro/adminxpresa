
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function listTables() {
    // Information schema is not accessible via REST by default
    // But we can try to query some common names
    const commonNames = ['products', 'articulos', 'items', 'catalog', 'catalogo', 'precios'];

    for (const name of commonNames) {
        const { data, error } = await supabase.from(name).select('*').limit(1);
        if (!error) {
            console.log(`Table found: ${name}`);
            console.log('Columns:', Object.keys(data[0] || {}));
        } else {
            // console.log(`Table not found: ${name} (${error.message})`);
        }
    }
}

listTables();
