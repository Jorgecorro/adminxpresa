'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

export default function RegisterPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const supabase = getSupabaseClient();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setIsLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) {
                setError(error.message);
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError('Error al crear la cuenta');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="w-full max-w-md text-center">
                    <div className="inline-block p-4 rounded-full bg-green-500/20 border border-green-500/30 mb-6">
                        <svg className="w-12 h-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary mb-4">
                        ¡Cuenta creada exitosamente!
                    </h2>
                    <p className="text-text-secondary mb-6">
                        Revisa tu correo electrónico para confirmar tu cuenta.
                    </p>
                    <Button onClick={() => router.push('/login')} size="lg">
                        Ir a Iniciar Sesión
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
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
                            Únete a{' '}
                            <span className="text-accent">XpresaControl</span>
                        </h1>
                        <p className="text-text-secondary text-lg">
                            Crea tu cuenta y comienza a gestionar tus pedidos de forma profesional.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-text-primary mb-2">
                            Crear Cuenta
                        </h2>
                        <p className="text-text-secondary">
                            Completa el formulario para registrarte
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                            <Input
                                type="text"
                                placeholder="Nombre completo"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="pl-12"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                            <Input
                                type="email"
                                placeholder="correo@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-12"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-12 pr-12"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Confirmar contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pl-12"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="w-full"
                            size="lg"
                        >
                            Sign Up
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-text-muted text-sm">
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/login" className="text-accent hover:underline">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
