
'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function importManyChatBotFields(fields: { name: string, value: any }[]) {
    const supabase = await createClient();

    const knowledgeItems = fields
        .filter(f => f.value !== null && f.value !== undefined && f.value !== '')
        .map(f => ({
            category: 'general' as const,
            key: f.name,
            content: String(f.value),
        }));

    if (knowledgeItems.length === 0) return { success: false, message: 'No hay datos válidos para importar' };

    const { error } = await supabase
        .from('bot_knowledge')
        .insert(knowledgeItems as any);

    if (error) {
        console.error('Error importing bot fields:', error);
        throw new Error('Error al guardar en la base de datos');
    }

    revalidatePath('/chat');
    return { success: true, count: knowledgeItems.length };
}
