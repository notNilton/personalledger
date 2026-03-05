import { createFileRoute } from '@tanstack/react-router'
import {
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  CreditCard,
  PieChart,
  History,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Wallet,
  Building
} from 'lucide-react'

export const Route = createFileRoute('/')({
  component: UserDashboard,
})

function MetricCard({ title, value, detail, icon: Icon, color }: {
  title: string,
  value: string,
  detail: string,
  icon: any,
  color: string
}) {
  return (
    <div className="card-premium p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${color}/10 text-${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">{detail}</span>
      </div>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="text-2xl font-bold font-display mt-1">{value}</p>
      </div>
    </div>
  )
}

function UserDashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Welcome & Quick Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Olá, Nilton</h1>
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
          value="R$ 12.450,00"
          detail="Em 4 contas"
          icon={CreditCard}
          color="indigo-500"
        />
        <MetricCard
          title="Receitas (Mar)"
          value="R$ 8.200,00"
          detail="+R$ 1.200 vs Fev"
          icon={ArrowUpCircle}
          color="emerald-500"
        />
        <MetricCard
          title="Despesas (Mar)"
          value="R$ 3.840,50"
          detail="46% do planejado"
          icon={ArrowDownCircle}
          color="rose-500"
        />
        <MetricCard
          title="Pode Gastar"
          value="R$ 2.150,00"
          detail="Safe-to-Spend"
          icon={ShieldCheck}
          color="amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Transactions & Chart */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Spending Chart */}
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Fluxo de Caixa
              </h2>
              <select className="bg-muted text-xs font-medium px-3 py-1.5 rounded-lg border-none focus:ring-0">
                <option>Últimos 7 dias</option>
                <option>Últimos 30 dias</option>
              </select>
            </div>
            <div className="h-[250px] flex items-end gap-3 px-2">
              {[30, 45, 25, 60, 80, 55, 90].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col gap-1 items-center group">
                  <div className="w-full bg-primary/10 group-hover:bg-primary/20 rounded-t-md transition-smooth relative h-[180px] flex flex-col justify-end">
                    <div className="w-full bg-primary/40 group-hover:bg-primary/60 rounded-t-md" style={{ height: `${h}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase mt-2">Seg</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Transações Recentes
              </h2>
              <button className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                Ver tudo
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-col">
              {[
                { label: 'Supermercado Silva', cat: 'Alimentação', val: -184.50, date: 'Hoje', icon: '🛒' },
                { label: 'Salário Empresa X', cat: 'Renda', val: 5200.00, date: 'Ontem', icon: '💰' },
                { label: 'Netflix Streaming', cat: 'Lazer', val: -55.90, date: '02 Mar', icon: '🍿' },
                { label: 'Posto Shell', cat: 'Transporte', val: -220.00, date: '01 Mar', icon: '⛽' },
              ].map((t, i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-border last:border-0 hover:bg-muted/30 px-2 -mx-2 rounded-lg transition-smooth cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg shadow-sm">
                      {t.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.cat} • {t.date}</p>
                    </div>
                  </div>
                  <p className={`font-bold text-sm ${t.val > 0 ? 'text-emerald-500' : 'text-foreground'}`}>
                    {t.val > 0 ? '+' : ''} {t.val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Budgets & Accounts */}
        <div className="flex flex-col gap-6">
          {/* Budget Overview */}
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Orçamentos
              </h2>
            </div>
            <div className="flex flex-col gap-5">
              {[
                { label: 'Alimentação', spent: 850, limit: 1200, color: 'bg-indigo-500' },
                { label: 'Transporte', spent: 420, limit: 500, color: 'bg-emerald-500' },
                { label: 'Lazer', spent: 300, limit: 400, color: 'bg-amber-500' },
              ].map((b) => (
                <div key={b.label}>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span>{b.label}</span>
                    <span className="text-muted-foreground">R$ {b.spent} / R$ {b.limit}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${b.color} transition-smooth`}
                      style={{ width: `${(b.spent / b.limit) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-smooth">
              Configurar Metas
            </button>
          </div>

          {/* Accounts Mini */}
          <div className="card-premium p-6">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Suas Contas</h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">Nubank</span>
                </div>
                <span className="text-sm font-bold">R$ 4.250</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">Itaú</span>
                </div>
                <span className="text-sm font-bold">R$ 8.200</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
