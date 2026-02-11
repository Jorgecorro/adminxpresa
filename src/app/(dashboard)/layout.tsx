import { cookies } from 'next/headers';
import { Sidebar } from '@/components/layout';
import { createClient } from '@/lib/supabase/server';
import { Profile } from '@/types/database';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const cookieStore = cookies();

    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const hasBypass = cookieStore.get('xpresa_auth_bypass')?.value === 'true';

    let profile: Profile | null = null;

    if (user) {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        profile = data;
    }

    return (
        <div className="min-h-screen bg-background">
            <Sidebar user={profile} />
            {/* 
                ml-0 on mobile, ml-64 on desktop
                pt-16 on mobile for the fixed header, pt-0 on desktop
            */}
            <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
                <div className="p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
