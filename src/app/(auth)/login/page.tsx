'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { getSupabaseClient } from '@/lib/supabase/client';
import { User as UserIcon, Lock, Eye, EyeOff } from 'lucide-react';

const VENDEDORES = ['Alex', 'Cari', 'Sa', 'Diana', 'Fay', 'Mabe', 'Nidia', 'Gis', 'Luis', 'ESCRITORIO'];
const DEFAULT_PASS = 'Xpresa**++';

export default function LoginPage() {
    const [selectedSeller, setSelectedSeller] = useState('');
    const [password, setPassword] = useState(DEFAULT_PASS);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const supabase = getSupabaseClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSeller) {
            setError('Por favor selecciona un vendedor');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // BYPASS: Direct query to our custom table
            const { data, error: dbError } = await supabase
                .from('vendedores_acceso')
                .select('*')
                .eq('nombre', selectedSeller)
                .eq('password', password.trim())
                .single();

            if (dbError || !data) {
                setError('Contraseña incorrecta o vendedor no encontrado.');
                console.error('Login error:', dbError);
            } else {
                // Manual Session Management
                const sessionData = {
                    user: {
                        id: data.id,
                        email: `${selectedSeller.toLowerCase()}@xpresa.mx`,
                        user_metadata: { full_name: selectedSeller }
                    }
                };

                localStorage.setItem('xpresa_session', JSON.stringify(sessionData));

                // Cookie for middleware bypass
                document.cookie = `xpresa_auth_bypass=true; path=/; max-age=86400; samesite=lax`;

                window.location.href = '/dashboard';
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex relative">
            {/* Left Side */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-background-secondary to-background relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
                    <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-2xl" />
                </div>
                <div className="relative z-10 flex flex-col justify-center px-16">
                    <div className="mb-8">
                        <div className="inline-block p-4 rounded-2xl bg-accent/10 border border-accent/20 mb-6">
                            <svg className="w-12 h-12 text-accent" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold text-text-primary mb-4">
                            Xpresa<span className="text-accent">Control</span>
                        </h1>
                        <p className="text-text-secondary text-lg">Modo de mantenimiento: Acceso directo habilitado.</p>
                    </div>
                </div>
            </div>

            {/* Right Side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-text-primary mb-2">Entrar</h2>
                        <p className="text-text-secondary">Selecciona tu nombre para continuar</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary">Vendedor</label>
                            <div className="relative">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted z-10" size={20} />
                                <select
                                    value={selectedSeller}
                                    onChange={(e) => setSelectedSeller(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-background-secondary border border-card-border rounded-xl text-text-primary focus:border-accent appearance-none outline-none"
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    {VENDEDORES.map(name => <option key={name} value={name}>{name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3 bg-background-secondary border border-card-border rounded-xl text-text-primary focus:border-accent outline-none"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" isLoading={isLoading} className="w-full py-4 text-lg" size="lg">
                            ACCEDER AL SISTEMA
                        </Button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-card-border text-center">
                        <p className="text-text-muted text-xs">
                            © 2024 XpresaControl. Soporte técnico activado.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
