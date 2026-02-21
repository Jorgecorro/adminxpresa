
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function injectTrustKnowledge() {
    console.log('Inyectando conocimiento de seguridad y confianza...');

    const { data, error } = await supabase
        .from('bot_knowledge')
        .insert([
            {
                category: 'general',
                key: 'seguridad_y_confianza',
                content: 'Somos una empresa constituida desde hace 10 años, en nuestro facebook puede ver decenas de clientes que han enviado fotos de sus uniformes, además puede pagar con mercado pago, si no le llega el pedido esta plataforma le devuelve su dinero.',
                question: '¿Es seguro comprar? ¿Son una empresa real? ¿Tienen referencias? ¿Cómo sé que me va a llegar?'
            }
        ]);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('¡Éxito! Base de conocimientos actualizada.');
    }
}

injectTrustKnowledge();
