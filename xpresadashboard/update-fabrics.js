
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function addFabricKnowledge() {
    const { data, error } = await supabase
        .from('bot_knowledge')
        .upsert({
            key: 'telas',
            question: '¿Qué telas manejan en sus uniformes?',
            content: 'Para nuestros uniformes deportivos utilizamos poliéster respirable tipo Dry-Fit. Es una tela de alta calidad, muy resistente y ligera, diseñada para mantenerte fresco durante la actividad física.',
            category: 'general'
        }, { onConflict: 'key' });

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Conocimiento de telas actualizado con éxito.');
    }
}

addFabricKnowledge();
