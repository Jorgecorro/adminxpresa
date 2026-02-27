
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function setupSettingsTable() {
    console.log('Configurando tabla de ajustes globales...');

    // 1. Crear la tabla (vía RPC o simplemente intentar insertar)
    // Como no podemos crear tablas directamente vía JS fácilmente sin SQL,
    // vamos a intentar insertar el registro. Si falla por permisos, el usuario verá qué hacer.

    const { error } = await supabase
        .from('global_settings')
        .upsert({ key: 'bot_active', value: false }, { onConflict: 'key' });

    if (error) {
        console.log('--- ERROR DETECTADO ---');
        console.log('Parece que la tabla "global_settings" no existe o no tiene permisos RLS.');
        console.log('Por favor, ejecuta este SQL en tu consola de Supabase:');
        console.log(`
      CREATE TABLE IF NOT EXISTS global_settings (
        id BIGSERIAL PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Allow public read/write for settings" ON global_settings FOR ALL USING (true) WITH CHECK (true);
    `);
    } else {
        console.log('¡Éxito! La tabla global_settings está lista y configurada.');
    }
}

setupSettingsTable();
