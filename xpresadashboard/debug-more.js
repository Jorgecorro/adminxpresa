
const MANYCHAT_API_URL = 'https://api.manychat.com';
const token = '4109664:a9c50a1a8df5a0827b0adc00f9df42e1';

async function debugMore() {
    const endpoints = [
        '/fb/page/getInfo',
        '/fb/page/getKeywords', // Testing if this works
        '/fb/page/getTags',
        '/fb/page/getWidgets'
    ];

    for (const endpoint of endpoints) {
        console.log(`Checking ${endpoint}...`);
        try {
            const response = await fetch(`${MANYCHAT_API_URL}${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            console.log(`Response for ${endpoint}:`, JSON.stringify(data, null, 2));
        } catch (e) {
            console.error(`Error for ${endpoint}:`, e.message);
        }
    }
}

debugMore();
