import { createClient } from "@/utils/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Expense } from "@/types/database";
import { ExpenseFilters } from "@/components/ExpenseFilters";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { getMetaAdSpend } from "@/lib/meta";
import {
    ArrowDownRight,
    Wallet,
    Clock,
    FileText,
    User,
    AlertCircle,
    TrendingDown,
    Receipt,
    Facebook,
    ArrowUpRight
} from "lucide-react";

interface PageProps {
    searchParams: Promise<{
        range?: string;
        account?: string;
        from?: string;
        to?: string;
    }>;
}

export default async function GastosPage({ searchParams }: PageProps) {
    const supabase = await createClient();
    const { range, account, from, to } = await searchParams;

    // Build the Supabase query
    let query = supabase
        .from('expenses')
        .select(`
      *,
      vendedor:profiles(full_name)
    `)
        .order('created_at', { ascending: false });

    // Apply filters to query
    if (account && account !== 'all') {
        query = query.eq('account', account);
    }

    // Date Logic for query and Meta API
    const now = new Date();
    let dateSince: string | undefined;
    let dateUntil: string | undefined;

    if (range === 'today') {
        dateSince = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        query = query.gte('created_at', dateSince);
    } else if (range === 'yesterday') {
        const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        dateSince = yesterdayStart.toISOString();
        dateUntil = yesterdayEnd.toISOString();
        query = query.gte('created_at', dateSince).lt('created_at', dateUntil);
    } else if (range === '7d') {
        dateSince = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', dateSince);
    } else if (range === '30d') {
        dateSince = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', dateSince);
    } else if (range === 'custom' && from) {
        dateSince = new Date(from).toISOString();
        query = query.gte('created_at', dateSince);
        if (to) {
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            dateUntil = toDate.toISOString();
            query = query.lte('created_at', dateUntil);
        }
    }

    // Fetch both database expenses and Meta Ads spending in parallel
    let metaSpend = 0;
    let expensesData: any = null;

    try {
        const [dbResult, metaResult] = await Promise.all([
            query,
            getMetaAdSpend(dateSince, dateUntil)
        ]);
        expensesData = dbResult.data;
        metaSpend = metaResult;
    } catch (err) {
        console.error("Critical error in data fetching:", err);
    }

    const expenses = expensesData as (Expense & { vendedor: { full_name: string } | null })[] | null;

    // Fetch unique accounts dynamically from the database to ensure filtered values match exactly
    const { data: accountsData } = await supabase
        .from('expenses')
        .select('account');

    // Extract unique accounts and filter out nulls/empty
    const uniqueAccounts = Array.from(new Set(((accountsData || []) as { account: string }[]).map(d => d.account).filter(Boolean)));
    uniqueAccounts.sort();

    // Metrics
    const dbExpensesTotal = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
    const totalExpenses = dbExpensesTotal + metaSpend;
    const expenseCount = expenses?.length || 0;
    const avgExpense = expenseCount > 0 ? dbExpensesTotal / expenseCount : 0;

    const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-50">Control de Gastos</h2>
                    <p className="text-slate-400">Monitoreo de salidas de capital e inversión en Meta Ads.</p>
                </div>
                <AddExpenseModal />
            </div>

            <ExpenseFilters accounts={uniqueAccounts} />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gasto Operativo</p>
                                <h3 className="text-xl font-bold text-slate-100 mt-1">{formatter.format(dbExpensesTotal)}</h3>
                            </div>
                            <div className="p-2.5 bg-slate-800 rounded-lg">
                                <Wallet className="h-5 w-5 text-slate-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Inversión Meta Ads</p>
                                <h3 className="text-xl font-bold text-blue-400 mt-1">{formatter.format(metaSpend)}</h3>
                            </div>
                            <div className="p-2.5 bg-blue-500/10 rounded-lg">
                                <Facebook className="h-5 w-5 text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gasto Total Acumulado</p>
                                <h3 className="text-2xl font-black text-red-100 mt-1">{formatter.format(totalExpenses)}</h3>
                            </div>
                            <div className="p-2.5 bg-red-500/10 rounded-lg">
                                <TrendingDown className="h-6 w-6 text-red-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Eficiencia (ROAS)</p>
                                <h3 className="text-xl font-bold text-emerald-400 mt-1">Demo 4.2x</h3>
                            </div>
                            <div className="p-2.5 bg-emerald-500/10 rounded-lg">
                                <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-950/50">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Descripción</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Cuenta</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Monto</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Registró</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {expenses?.map((expense) => (
                                <tr key={expense.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-slate-400 font-medium">
                                            {new Date(expense.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-200 font-semibold block max-w-md truncate">
                                            {expense.description}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge variant="outline" className="border-slate-700 text-slate-400 bg-slate-800/20 capitalize">
                                            {expense.account.replace(/_/g, ' ')}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-bold text-red-400">
                                            {formatter.format(expense.amount)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 border border-slate-700">
                                                {expense.vendedor?.full_name?.charAt(0) || 'V'}
                                            </div>
                                            <span className="text-sm text-slate-400">
                                                {expense.vendedor?.full_name || 'Sistema'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {expenses?.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <AlertCircle className="h-8 w-8 text-slate-700" />
                                            <p className="text-slate-500 text-sm italic">No se encontraron gastos registrados.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
