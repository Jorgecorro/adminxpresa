
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function injectPersonalizationKnowledge() {
    console.log('Inyectando conocimiento de personalización gratuita...');

    const { data, error } = await supabase
        .from('bot_knowledge')
        .insert([
            {
                category: 'general',
                key: 'personalizacion_gratis',
                content: '¡Nuestros uniformes son completos! El precio ya incluye Diseño, Nombres, Números, Escudo y todos los Patrocinadores que necesites sin costo extra.',
                question: '¿El diseño tiene costo? ¿Cobran por nombre o número? ¿Puedo ponerle patrocinadores? ¿El escudo se cobra aparte? ¿Qué incluye el precio?'
            }
        ]);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('¡Éxito! Base de conocimientos actualizada con la regla de personalización gratis.');
    }
}

injectPersonalizationKnowledge();
