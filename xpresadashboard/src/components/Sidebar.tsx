'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Receipt,
    Wallet,
    MessageSquare,
    Store,
    Percent,
    Package,
    Globe,
    Users
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Ventas', href: '/ventas', icon: Receipt },
    { name: 'Gastos', href: '/gastos', icon: Wallet },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Tiendas', href: '/tiendas', icon: Store },
    { name: 'Comisiones', href: '/comisiones', icon: Percent },
    { name: 'Productos', href: '/productos', icon: Package },
    { name: 'Xpresa Web', href: '/xpresa-web', icon: Globe },
    { name: 'Clientes', href: '/clientes', icon: Users },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-full">
            <div className="flex h-16 items-center flex-shrink-0 px-6 bg-slate-950">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                    Xpresa Admin
                </h1>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                                        ? 'bg-indigo-500/10 text-indigo-400'
                                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                    }`}
                            >
                                <Icon
                                    className={`flex-shrink-0 -ml-1 mr-3 h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400'
                                        }`}
                                    aria-hidden="true"
                                />
                                <span className="truncate">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <Users className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-200">Admin</span>
                        <span className="text-xs text-slate-500">Administrador</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
