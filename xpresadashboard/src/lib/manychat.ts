
const MANYCHAT_API_URL = 'https://api.manychat.com';

export interface ManyChatFlow {
    id: string;
    name: string;
    folder_id: string | null;
    status: string;
}

export interface ManyChatField {
    id: number;
    name: string;
    type: string;
    description: string;
}

export async function fetchManyChatFlows() {
    const token = process.env.MANYCHAT_API_TOKEN;
    if (!token) throw new Error('MANYCHAT_API_TOKEN no configurado');

    const response = await fetch(`${MANYCHAT_API_URL}/fb/page/getFlows`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener flujos de ManyChat');
    }

    const result = await response.json();
    return (result.data?.flows || []) as ManyChatFlow[];
}

export async function fetchManyChatCustomFields() {
    const token = process.env.MANYCHAT_API_TOKEN;
    if (!token) throw new Error('MANYCHAT_API_TOKEN no configurado');

    const response = await fetch(`${MANYCHAT_API_URL}/fb/page/getCustomFields`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener campos personalizados de ManyChat');
    }

    const result = await response.json();
    return (result.data || []) as ManyChatField[];
}

export interface ManyChatBotField {
    id: number;
    name: string;
    type: string;
    description: string;
    value: any;
}

export async function fetchManyChatBotFields() {
    const token = process.env.MANYCHAT_API_TOKEN;
    if (!token) throw new Error('MANYCHAT_API_TOKEN no configurado');

    const response = await fetch(`${MANYCHAT_API_URL}/fb/page/getBotFields`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener Bot Fields de ManyChat');
    }

    const result = await response.json();
    return (result.data || []) as ManyChatBotField[];
}
