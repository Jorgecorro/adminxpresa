
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function injectGreetingKnowledge() {
    console.log('Inyectando saludo inicial...');

    const { data, error } = await supabase
        .from('bot_knowledge')
        .insert([
            {
                category: 'general',
                key: 'saludo_inicial',
                content: '¡Hola! Bienvenido a Xpresa Sport. Es un gusto saludarte. ¿En qué podemos ayudarte hoy? Podemos darte precios de uniformes, información de envíos o detalles de personalización.',
                question: 'Hola, buenos días, buenas tardes, que tal, saludos'
            }
        ]);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('¡Éxito! Saludo inicial configurado correctamente.');
    }
}

injectGreetingKnowledge();
