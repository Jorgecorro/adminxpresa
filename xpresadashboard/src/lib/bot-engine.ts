
import { BotKnowledge, Product } from "@/types/database";

export function getBotResponse(
    query: string,
    history: { role: 'user' | 'bot' | 'system', content: string }[],
    knowledge: BotKnowledge[],
    products: Product[],
    lastContext?: Product
) {
    const q = query.toLowerCase();
    const cleanQuery = q.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // 1. Diccionario de sinónimos
    const synonyms: Record<string, string[]> = {
        "basquetbol": ["basquet", "basket", "basketball", "baloncesto", "basquetball"],
        "futbol": ["fut", "soccer", "balompie", "fuchito"],
        "beisbol": ["beis", "baseball", "pelota caliente"],
        "voleibol": ["voley", "volleyball", "voleybol"],
        "uniforme": ["traje", "kit", "equipacion", "jersey", "casaca"]
    };

    // 2. Detección de producto
    let detectedProduct = lastContext;
    const foundProduct = products.find(p => {
        const pName = p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (cleanQuery.includes(pName)) return true;
        for (const [canonical, variants] of Object.entries(synonyms)) {
            if (pName.includes(canonical)) {
                if (variants.some(v => cleanQuery.includes(v))) return true;
            }
        }
        return false;
    });

    if (foundProduct) {
        detectedProduct = foundProduct;
    } else if (!detectedProduct) {
        const isAskingForUniform = ["uniforme", ...synonyms["uniforme"]].some(v => cleanQuery.includes(v));
        if (isAskingForUniform) {
            const defaultProduct = products.find(p => p.name.toLowerCase().includes("futbol"));
            if (defaultProduct) detectedProduct = defaultProduct;
        }
    }

    // 3. Sistema de Puntuación para Conocimiento
    const candidates = knowledge.map(k => {
        const key = (k.key || "").toLowerCase();
        const kQuestion = (k.question || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const kContent = (k.content || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const allText = `${key} ${kQuestion} ${kContent}`;

        let score = 0;

        // Saludos
        const greetingKeywords = ["hola", "buenos dias", "buenas tardes", "buenas noches", "saludos", "que tal"];
        if (greetingKeywords.some(word => cleanQuery.includes(word)) && cleanQuery.length <= 15) {
            if (key === 'saludo_inicial') score += 500;
            return { item: k, score };
        }

        // Confianza
        const trustKeywords = ["seguro", "confiar", "confianza", "estafa", "referencia", "miedo", "real", "verdad"];
        if (key === 'seguridad_y_confianza' && trustKeywords.some(word => cleanQuery.includes(word))) {
            score += 100;
            return { item: k, score };
        }

        // Intenciones
        const intents = [
            { keywords: ['pago', 'pagar', 'deposito', 'transferencia', 'mercadopago'], target: 'pago' },
            { keywords: ['envio', 'mandar', 'llega', 'entrega', 'tiempo', 'mensajeria', 'tarda', 'demora'], target: 'envio' },
            { keywords: ['talla', 'medida', 'centimetro', 'grande', 'chico', 'size'], target: 'talla' },
            { keywords: ['pieza', 'minimo', 'menudeo', 'unidad', 'individual', 'cuanto es lo menos', '1', '2', '3', '4', '5', '6'], target: 'minimo' },
            { keywords: ['diseno', 'nombre', 'numero', 'escudo', 'patrocinador', 'logo', 'logotipo', 'personalizado'], target: 'personalizacion' }
        ];

        for (const intent of intents) {
            if (intent.keywords.some(word => cleanQuery.includes(word))) {
                if (key.includes(intent.target) || kQuestion.includes(intent.target)) score += 50;
                else if (kContent.includes(intent.target)) score += 10;
            }
        }

        // Keywords Generales
        const queryWords = cleanQuery.split(' ').filter(w => w.length > 3);
        queryWords.forEach(word => {
            if (key.includes(word)) score += 20;
            if (kQuestion.includes(word)) score += 15;
            if (kContent.includes(word)) score += 5;
        });

        return { item: k, score };
    });

    const sortedCandidates = candidates.filter(c => c.score > 0).sort((a, b) => b.score - a.score);
    const bestMatch = sortedCandidates[0]?.item;
    const bestScore = sortedCandidates[0]?.score || 0;

    let response = "";
    let source = "";

    if (bestMatch && bestScore >= 50) {
        response = bestMatch.content;
        source = `Cerebro: ${bestMatch.key === 'seguridad_y_confianza' ? 'Seguridad' : (bestMatch.key || 'FAQ')}`;
    }
    else if (cleanQuery.includes("envio") && (cleanQuery.includes("costo") || cleanQuery.includes("precio") || cleanQuery.includes("cuanto") || cleanQuery.includes("gratis"))) {
        const shipMatch = knowledge.find(k => k.key === 'envio_gratis');
        response = shipMatch ? shipMatch.content : "El envío es gratis a partir de 7 piezas.";
        source = "Cerebro: Envío Gratis";
    }
    else if (cleanQuery.includes("precio") || cleanQuery.includes("cuanto") || cleanQuery.includes("costo") || cleanQuery.includes("cotiz")) {
        if (detectedProduct) {
            const price = detectedProduct.price_2;
            const range = `${detectedProduct.qty_1 + 1}-${detectedProduct.qty_2}`;
            response = `El precio del ${detectedProduct.name} es de $${price} pesos (en pedidos de ${range} ${detectedProduct.unit}s). Tenemos otros precios para volumen, ¿te gustaría conocerlos?`;
            source = `Catálogo: ${detectedProduct.name}`;
        } else {
            response = "Claro, ¿de qué producto te gustaría saber el precio?";
        }
    }
    else if (bestMatch) {
        response = bestMatch.content;
        source = `Cerebro: ${bestMatch.key || 'FAQ'}`;
    } else {
        response = "SILENT_THRESHOLD";
    }

    // Anti-repetición
    const isAlreadySaid = history.some(msg => msg.role === 'bot' && msg.content === response);
    if (isAlreadySaid && response !== "SILENT_THRESHOLD") {
        response = "SILENT_THRESHOLD";
    }

    return { response, source, detectedProduct };
}
