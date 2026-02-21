
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function fixPrices() {
    const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('*');

    if (fetchError) {
        console.error('Error fetching products:', fetchError);
        return;
    }

    console.log('Current products in DB:');
    products.forEach(p => console.log(`${p.name}: Price2=$${p.price_2}`));

    // Fixing the specific one the user mentioned or all that are 0
    const { error: updateError } = await supabase
        .from('products')
        .update({ price_2: 399 })
        .eq('name', 'Uniforme de Futbol de Catalogo');

    if (updateError) {
        console.error('Error updating product:', updateError);
    } else {
        console.log('Price updated to 399 for Uniforme de Futbol de Catalogo');
    }
}

fixPrices();
