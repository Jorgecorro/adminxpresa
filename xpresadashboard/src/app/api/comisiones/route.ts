import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const vendedorId = searchParams.get('vendedorId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    try {
        let query = supabase
            .from('orders')
            .select(`
                *,
                vendedor:profiles(id, full_name)
            `)
            .order('created_at', { ascending: false });

        if (vendedorId && vendedorId !== 'all') {
            query = query.eq('vendedor_id', vendedorId);
        }

        if (from) query = query.gte('created_at', from);
        if (to) query = query.lte('created_at', to);

        const { data, error } = await query.limit(100);

        if (error) {
            console.error('Supabase Query Error (Comisiones):', error);
            throw error;
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('API Route Error (Comisiones):', error);
        return NextResponse.json({
            error: error.message,
            details: error.details || error.hint || 'Internal Server Error'
        }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    // Use untyped client for mutation to avoid strict Database generic constraints
    const { createClient: createRawClient } = await import('@supabase/supabase-js');
    const supabase = createRawClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { orderId, commission_earned } = await req.json();

    if (!orderId) {
        return NextResponse.json({ error: 'Falta ID del pedido' }, { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .from('orders')
            .update({ commission_earned: Number(commission_earned) })
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
