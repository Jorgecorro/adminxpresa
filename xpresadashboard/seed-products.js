
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY no están definidos en .env.local');
    process.exit(1);
}

const supabase = createClient(url, key);

const products = [
    // PLAYERAS
    { name: 'Playera Basica', category: 'Playeras', unit: 'pza' },
    { name: 'Playera Basica Manga Larga', category: 'Playeras', unit: 'pza' },
    { name: 'Playera Polo', category: 'Playeras', unit: 'pza' },
    { name: 'Playera Polo Manga Larga', category: 'Playeras', unit: 'pza' },

    // SUDADERAS
    { name: 'Sudadera', category: 'Sudaderas', unit: 'pza' },

    // UNIFORMES
    { name: 'Uniforme Futbol Personalizado', category: 'Uniformes', unit: 'pza' },
    { name: 'Uniforme de Futbol de Catalogo', category: 'Uniformes', unit: 'pza' },
    { name: 'Uniforme Futbol Personalizado Manga Larga', category: 'Uniformes', unit: 'pza' },
    { name: 'Uniforme de Futbol de Catalogo Manga Larga', category: 'Uniformes', unit: 'pza' },
    { name: 'Uniforme Basquetbol', category: 'Uniformes', unit: 'pza' },

    // OTROS / INSUMOS
    { name: 'Metro de tela sublimada', category: 'Insumos', unit: 'metro' },
];

async function seed() {
    console.log('Iniciando carga de productos en:', url);

    const productsToInsert = products.map(p => ({
        ...p,
        description: `Catálogo estándar de ${p.category}`,
        price_1: 0,
        price_2: 0,
        price_3: 0,
        price_4: 0,
        price_5: 0
    }));

    try {
        const { data, error } = await supabase
            .from('products')
            .insert(productsToInsert)
            .select();

        if (error) {
            console.error('Error de Supabase:', JSON.stringify(error, null, 2));
        } else {
            console.log('¡Productos cargados con éxito!', data?.length, 'registros creados.');
        }
    } catch (err) {
        console.error('Excepción al insertar:', err);
    }
}

seed();
