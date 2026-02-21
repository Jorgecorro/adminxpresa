import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users, ShoppingCart } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { Order, Expense } from "@/types/database";

export default async function Dashboard() {
  const supabase = await createClient();

  // Fetch metrics in parallel
  const [
    { data: ordersData },
    { data: expensesData },
    { count: totalClients }
  ] = await Promise.all([
    supabase.from('orders').select('total_amount, created_at, temp_id'),
    supabase.from('expenses').select('amount, created_at'),
    supabase.from('profiles').select('*', { count: 'exact', head: true })
  ]);

  const orders = ordersData as Order[] | null;
  const expenses = expensesData as Expense[] | null;

  const totalSales = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
  const totalExpenses = expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;
  const netProfit = totalSales - totalExpenses;

  // Format currency
  const formatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });

  return (
    <div className="flex-1 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-50">Resumen General</h2>
          <p className="text-slate-400">Control global de operaciones y finanzas.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900 border-slate-800 hover:border-indigo-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Ventas Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">{formatter.format(totalSales)}</div>
            <p className="text-xs text-slate-500">
              Historico acumulado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 hover:border-red-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Gastos Totales
            </CardTitle>
            <Activity className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">{formatter.format(totalExpenses)}</div>
            <p className="text-xs text-slate-500">
              Egreso total registrado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Balance Neto
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-slate-50' : 'text-red-400'}`}>
              {formatter.format(netProfit)}
            </div>
            <p className="text-xs text-slate-500">
              Diferencia ingresos/egresos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 hover:border-purple-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Personal / Usuarios
            </CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">{totalClients || 0}</div>
            <p className="text-xs text-slate-500">
              Usuarios registrados
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-50">Estado de Operaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Placeholder for a chart or table */}
              <div className="h-[200px] flex items-center justify-center border border-dashed border-slate-700 rounded-lg text-slate-500">
                Gráfica de rendimiento próximamente
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-50 text-base">Últimas Órdenes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders?.slice(0, 5).map((order: any, i: number) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      Orden #{order.temp_id || i + 1}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    {formatter.format(order.total_amount)}
                  </div>
                </div>
              ))}
              {(!orders || orders.length === 0) && (
                <p className="text-center py-4 text-slate-500 text-sm italic">No hay órdenes recientes</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
