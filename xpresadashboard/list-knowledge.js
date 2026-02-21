
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function listKnowledge() {
    const { data, error } = await supabase
        .from('bot_knowledge')
        .select('*');

    if (error) {
        console.error('Error:', error);
    } else {
        data.forEach(item => {
            console.log(`ID: ${item.id}`);
            console.log(`Category: ${item.category}`);
            console.log(`Key: ${item.key}`);
            console.log(`Question: ${item.question}`);
            console.log(`Content: ${item.content.substring(0, 50)}...`);
            console.log('---');
        });
    }
}

listKnowledge();
