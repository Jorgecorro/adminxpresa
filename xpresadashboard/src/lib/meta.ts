/**
 * Utility to interact with Meta Marketing API
 * This can be used to fetch real-time ad spend data.
 */

export async function getMetaAdSpend(from?: string, to?: string) {
    const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID;
    const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

    // Fallback to demo mode if credentials are missing
    if (!AD_ACCOUNT_ID || !ACCESS_TOKEN) {
        console.warn("Meta Ads credentials missing. Running in DEMO mode.");
        // Simulate some logic based on date range for demo purposes
        if (from && to) {
            const days = (new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24);
            return Math.max(0, days * 450.50); // Assumes $450.50 avg daily spend for demo
        }
        return 12500.75; // Random monthly demo value
    }

    try {
        // Format dates if provided (Meta expects YYYY-MM-DD)
        const since = from ? new Date(from).toISOString().split('T')[0] : '2024-01-01';
        const until = to ? new Date(to).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

        const timeRange = JSON.stringify({ since, until });
        const url = `https://graph.facebook.com/v19.0/act_${AD_ACCOUNT_ID}/insights?fields=spend&time_range=${encodeURIComponent(timeRange)}&access_token=${ACCESS_TOKEN}`;

        console.log("Fetching Meta Spend:", { since, until, accountId: AD_ACCOUNT_ID });

        const response = await fetch(url, { cache: 'no-store' });
        const data = await response.json();

        if (data.error) {
            console.error("Meta API Error Details:", JSON.stringify(data.error));
            return 0;
        }

        if (data.data && data.data.length > 0) {
            const totalSpend = data.data.reduce((acc: number, item: any) => acc + parseFloat(item.spend || 0), 0);
            console.log("Meta Spend Found and Calculated:", totalSpend);
            return totalSpend;
        }

        console.log("No spend data returned from Meta for this range.");
        return 0;
    } catch (error) {
        console.error("Error fetching Meta Ad Spend:", error);
        return 0;
    }
}
