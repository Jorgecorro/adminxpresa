'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { User } from '@supabase/supabase-js';

interface UseAuthReturn {
    user: User | null;
    profile: Profile | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const supabase = getSupabaseClient();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // 1. Check for manual bypass session in localStorage
                const savedSession = localStorage.getItem('xpresa_session');
                if (savedSession) {
                    const { user: savedUser } = JSON.parse(savedSession);
                    setUser(savedUser);
                    setProfile({
                        id: savedUser.id,
                        full_name: savedUser.user_metadata.full_name,
                        avatar_url: '',
                        updated_at: new Date().toISOString()
                    } as Profile);
                    setIsLoading(false);
                    return;
                }

                // 2. Fallback to Supabase Auth if no bypass
                const { data: { user: authUser } } = await supabase.auth.getUser();
                setUser(authUser);

                if (authUser) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', authUser.id)
                        .single();

                    setProfile(profile);
                }
            } catch (err) {
                console.error('Auth check error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    setUser(session.user);
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();
                    setProfile(profile);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase]);

    const signOut = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('xpresa_session');
        document.cookie = "xpresa_auth_bypass=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        setUser(null);
        setProfile(null);
        window.location.href = '/login';
    };

    return {
        user,
        profile,
        isLoading,
        signOut,
    };
}

export default useAuth;
