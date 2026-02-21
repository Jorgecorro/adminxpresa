
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function injectFreeShippingKnowledge() {
    console.log('Inyectando conocimiento de envío gratis...');

    const { data, error } = await supabase
        .from('bot_knowledge')
        .insert([
            {
                category: 'general',
                key: 'envio_gratis',
                content: '¡Buenas noticias! El envío es totalmente GRATIS a cualquier parte de la República en la compra de 7 piezas o más (que es nuestro mínimo de pedido).',
                question: '¿Cuánto cuesta el envío? ¿Tienen envío gratis? ¿El envío tiene costo? ¿A dónde envían?'
            }
        ]);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('¡Éxito! Base de conocimientos actualizada con la regla de envío gratis.');
    }
}

injectFreeShippingKnowledge();
