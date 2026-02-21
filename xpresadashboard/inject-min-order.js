
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function injectMinimumOrderKnowledge() {
    console.log('Inyectando conocimiento de pedido mínimo...');

    const { data, error } = await supabase
        .from('bot_knowledge')
        .insert([
            {
                category: 'general',
                key: 'pedido_minimo',
                content: 'Una disculpa, por el momento el mínimo de compra es de 7 piezas para poder brindarte el mejor servicio y precio de fábrica.',
                question: '¿Venden desde una pieza? ¿Cuál es el mínimo? ¿Puedo comprar solo uno? ¿Venden por unidad?'
            },
            {
                category: 'general',
                key: 'menos_de_7',
                content: 'Lo sentimos mucho, por ahora solo realizamos pedidos a partir de 7 piezas. No realizamos ventas individuales por el momento.',
                question: '1 pieza, 2 piezas, 3 piezas, 4 piezas, 5 piezas, 6 piezas, individual, menudeo'
            }
        ]);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('¡Éxito! Base de conocimientos actualizada con reglas de pedido mínimo.');
    }
}

injectMinimumOrderKnowledge();
