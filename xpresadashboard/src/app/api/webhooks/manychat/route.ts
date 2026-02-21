
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getBotResponse } from '@/lib/bot-engine';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { user_id, content, last_messages = [] } = body;

        // Webhooks no tienen cookies, usamos el cliente directo
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // 1. Verificar si el bot está activo
        const { data: settings } = await (supabase
            .from('global_settings')
            .select('value')
            .eq('key', 'bot_active')
            .single() as any);

        if (settings?.value !== true) {
            return NextResponse.json({ action: 'none', reason: 'bot_disabled' });
        }

        // 2. Obtener base de conocimientos y productos
        const [{ data: knowledge }, { data: products }] = await Promise.all([
            supabase.from('bot_knowledge').select('*') as any,
            supabase.from('products').select('*') as any
        ]);

        // 3. Procesar respuesta
        const engineResult = getBotResponse(
            content,
            last_messages,
            knowledge || [],
            products || []
        );

        // 4. Registrar en logs si no es silencio
        if (engineResult.response !== "SILENT_THRESHOLD") {
            await (supabase.from('bot_logs') as any).insert({
                user_id: user_id,
                question: content,
                answer: engineResult.response,
                confidence: 1.0,
                source: engineResult.source
            });

            return NextResponse.json({
                action: 'send_message',
                message: engineResult.response
            });
        }

        return NextResponse.json({ action: 'none', reason: 'low_confidence_or_repeat' });

    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ status: 'active', endpoint: 'manychat_webhook' });
}
