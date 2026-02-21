
const MANYCHAT_API_URL = 'https://api.manychat.com';
const token = '4109664:a9c50a1a8df5a0827b0adc00f9df42e1';

async function checkSubscribers() {
    console.log(`Checking subscribers...`);
    try {
        const response = await fetch(`${MANYCHAT_API_URL}/fb/page/getSubscribers?limit=5`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        console.log(`Subscribers:`, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(`Error:`, e.message);
    }
}

checkSubscribers();
