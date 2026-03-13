import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import PrivacyAmount from '../components/PrivacyAmount';
import { api } from '../lib/api';
import {
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  CreditCard,
  PieChart,
  History as HistoryIcon,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Wallet,
  Loader2,
  type LucideIcon,
} from 'lucide-react';

export const Route = createFileRoute('/')({
  component: UserDashboard,
});

interface DashboardData {
  userName: string;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  safeToSpend: number;
  accounts: Array<{
    label: string;
    val: number;
    color: string;
    icon: string;
  }>;
  recentTransactions: Array<{
    label: string;
    cat: string;
    val: number;
    date: string;
    icon: string;
  }>;
  budgets: Array<{
    label: string;
    spent: number;
    limit: number;
  }>;
  cashFlow: Array<{
    day: string;
    value: number;
  }>;
}

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: React.ReactNode;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <div className="card-premium p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground border border-border/50">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {detail}
        </span>
      </div>
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </h3>
        <div className="text-2xl font-bold font-display mt-1">{value}</div>
      </div>
    </div>
  );
}

function UserDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<DashboardData>('/dashboard'),
    staleTime: 1000 * 60, // 1 min
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">
          Carregando seu panorama...
        </p>
      </div>
    );
  }

  if (!data) return null;

  const currentMonth = new Date().toLocaleString('pt-BR', { month: 'short' }).replace('.', '');

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Welcome & Quick Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Olá, {data.userName}</h1>
          <p className="text-muted-foreground mt-1">Aqui está o resumo das suas finanças hoje.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-smooth">
          <Plus className="w-4 h-4" />
          Novo Lançamento
        </button>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Saldo Total"
          value={<PrivacyAmount value={data.totalBalance} className="font-display" />}
          detail={`Em ${data.accounts.length} contas`}
          icon={CreditCard}
        />
        <MetricCard
          title={`Receitas (${currentMonth})`}
          value={<PrivacyAmount value={data.monthlyIncome} className="font-display" />}
          detail="Este mês"
          icon={ArrowUpCircle}
        />
        <MetricCard
          title={`Despesas (${currentMonth})`}
          value={<PrivacyAmount value={data.monthlyExpenses} className="font-display" />}
          detail="Planejado vs Real"
          icon={ArrowDownCircle}
        />
        <MetricCard
          title="Pode Gastar"
          value={<PrivacyAmount value={data.safeToSpend} className="font-display" />}
          detail="Safe-to-Spend"
          icon={ShieldCheck}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Chart + Transactions */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Cash Flow Chart */}
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Fluxo de Caixa (7 dias)
              </h2>
            </div>
            <div className="h-[250px] flex items-end gap-3 px-2">
              {data.cashFlow.map((day, i) => {
                const maxValue = Math.max(...data.cashFlow.map((d) => d.value), 1);
                const height = (day.value / maxValue) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col gap-1 items-center group">
                    <div className="w-full bg-muted/30 group-hover:bg-muted/50 rounded-t h-[180px] flex flex-col justify-end overflow-hidden">
                      <div
                        className="w-full bg-primary/40 group-hover:bg-primary/60 transition-smooth"
                        style={{ height: `${height === 0 ? 5 : height}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase mt-2">
                      {day.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <HistoryIcon className="w-4 h-4" />
                Atividade Recente
              </h2>
              <button className="text-[11px] font-bold text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
                Ver Tudo
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-col">
              {data.recentTransactions.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-4 border-b border-border last:border-0 hover:bg-muted/30 px-2 -mx-2 rounded-lg transition-smooth cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg shadow-sm">
                      {t.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.cat} • {t.date}
                      </p>
                    </div>
                  </div>
                  <PrivacyAmount
                    value={t.val}
                    showSign={true}
                    className={`font-bold text-sm ${t.val > 0 ? 'text-emerald-500' : 'text-foreground'}`}
                  />
                </div>
              ))}
              {data.recentTransactions.length === 0 && (
                <p className="text-center py-8 text-sm text-muted-foreground italic">
                  Nenhuma transação encontrada.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Budgets + Accounts */}
        <div className="flex flex-col gap-6">
          {/* Budgets */}
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Orçamentos
              </h2>
            </div>
            <div className="flex flex-col gap-5">
              {data.budgets.map((b) => (
                <div key={b.label}>
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider mb-1.5">
                    <span>{b.label}</span>
                    <span className="text-muted-foreground font-mono">
                      {((b.spent / b.limit) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-smooth"
                      style={{ width: `${Math.min((b.spent / b.limit) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              {data.budgets.length === 0 && (
                <p className="text-center py-4 text-xs text-muted-foreground italic">
                  Crie orçamentos para acompanhar seus gastos.
                </p>
              )}
            </div>
            <button className="w-full mt-6 py-2.5 rounded-lg border border-border text-[11px] font-bold uppercase tracking-widest hover:bg-muted transition-smooth">
              Gerenciar
            </button>
          </div>

          {/* Accounts */}
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Suas Contas
              </h2>
              <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">
                Gerenciar
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {data.accounts.map((acc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-smooth group cursor-pointer border border-transparent hover:border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{acc.label}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        {acc.icon || 'Principal'}
                      </p>
                    </div>
                  </div>
                  <PrivacyAmount value={acc.val} className="text-sm font-bold" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
