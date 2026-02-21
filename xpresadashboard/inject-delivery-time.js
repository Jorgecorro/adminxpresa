
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function injectDeliveryTimeKnowledge() {
    console.log('Inyectando conocimiento de tiempo de entrega...');

    const { data, error } = await supabase
        .from('bot_knowledge')
        .insert([
            {
                category: 'general',
                key: 'tiempo_entrega',
                content: 'Nuestros tiempos de entrega son rápidos: tu pedido tarda entre 4 y 10 días hábiles en llegar a tu domicilio después de confirmar tu diseño.',
                question: '¿Cuánto tarda en llegar? ¿Cuál es el tiempo de entrega? ¿En cuántos días llega? ¿Cuánto demora el envío?'
            }
        ]);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('¡Éxito! Base de conocimientos actualizada con tiempos de entrega.');
    }
}

injectDeliveryTimeKnowledge();
