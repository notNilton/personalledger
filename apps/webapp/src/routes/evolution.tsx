import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  CheckCircle2,
  Flame,
  Fuel,
  Car,
  Gauge,
  History,
  Loader2,
  Target,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import PrivacyAmount from '../components/PrivacyAmount';
import { api } from '../lib/api';

export const Route = createFileRoute('/evolution')({
  component: EvolutionPage,
});

// ─-─-─-─-─-─-─-─-─- Types ─-─-─-─-─-─-─-─-─-

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface Budget {
  id: string;
  categoryId?: string;
  amountLimit: number | string;
  spent: number;
  month: number;
  year: number;
  category?: Category;
}

interface Goal {
  id: string;
  name: string;
  targetAmount: number | string;
  currentAmount: number | string;
  deadline?: string;
  icon?: string;
  color?: string;
}

interface Vehicle {
  id: string;
  nickname?: string;
  make: string;
  model: string;
  licensePlate?: string;
}

interface RefuelingLog {
  id: string;
  createdAt: string;
  station?: string;
  fuelLiters: number | string;
  odometer: number | string;
  transaction: {
    amount: number | string;
    date: string;
  };
}

interface VehicleStats {
  avgConsumption: number;
  avgCost: number;
  autonomy: number;
}

// ─-─-─-─-─-─-─-─-─- Sub-components ─-─-─-─-─-─-─-─-─-

function BudgetProgress({ label, spent, limit }: { label: string; spent: number; limit: number }) {
  const percent = Math.min((spent / limit) * 100, 100);
  const isOver = spent > limit;

  return (
    <div className="card-premium p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground">
          {label}
        </h3>
        <span
          className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${isOver ? 'bg-rose-500/10 text-rose-500' : 'bg-muted text-muted-foreground'}`}
        >
          {isOver ? 'Estourado' : 'No Limite'}
        </span>
      </div>
      <div>
        <div className="flex items-end justify-between mb-2">
          <p className="text-xl font-bold font-display tracking-tight">
            <PrivacyAmount value={spent} />
            <span className="text-muted-foreground text-[10px] ml-1 uppercase font-bold">
              de <PrivacyAmount value={limit} />
            </span>
          </p>
          <p className={`text-xs font-bold ${isOver ? 'text-rose-500' : 'text-primary'}`}>
            {percent.toFixed(0)}%
          </p>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-smooth ${isOver ? 'bg-rose-500' : 'bg-primary'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const current = Number(goal.currentAmount);
  const target = Number(goal.targetAmount);
  const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isCompleted = percent >= 100;
  const deadline = goal.deadline
    ? new Date(goal.deadline).toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div className="card-premium p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between text-2xl">
        <span>{goal.icon ?? '🎯'}</span>
        {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
      </div>
      <div>
        <h3 className="font-bold text-sm mb-1">{goal.name}</h3>
        {deadline && (
          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-2">
            <Calendar className="w-3 h-3" />
            {deadline}
          </p>
        )}
        <div className="flex items-end justify-between mb-2">
          <p className="text-lg font-bold font-display tracking-tight">
            <PrivacyAmount value={current} />
          </p>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
            {percent.toFixed(0)}%
          </p>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-smooth ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          Faltam <PrivacyAmount value={Math.max(target - current, 0)} />
        </p>
      </div>
    </div>
  );
}

// ─-─-─-─-─-─-─-─-─- Main Page ─-─-─-─-─-─-─-─-─-

function EvolutionPage() {
  const [activeTab, setActiveTab] = useState<'budgets' | 'goals' | 'fuel'>('budgets');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const now = new Date();

  // ---- Budgets ----
  const { data: budgets = [], isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', now.getFullYear(), now.getMonth() + 1],
    queryFn: () =>
      api.get<Budget[]>(`/budgets?year=${now.getFullYear()}&month=${now.getMonth() + 1}`),
    enabled: activeTab === 'budgets',
    staleTime: 1000 * 60,
  });

  // ---- Goals ----
  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => api.get<Goal[]>('/goals'),
    enabled: activeTab === 'goals',
    staleTime: 1000 * 60,
  });

  const totalGoalsCurrent = goals.reduce((acc, g) => acc + Number(g.currentAmount), 0);
  const totalGoalsTarget = goals.reduce((acc, g) => acc + Number(g.targetAmount), 0);
  const totalGoalsPercent =
    totalGoalsTarget > 0 ? Math.min((totalGoalsCurrent / totalGoalsTarget) * 100, 100) : 0;

  // ---- Vehicles ----
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get<Vehicle[]>('/vehicles'),
    enabled: activeTab === 'fuel',
    staleTime: 1000 * 60 * 5,
  });

  // Auto-select first vehicle when list loads
  const activeVehicleId = selectedVehicleId ?? vehicles[0]?.id ?? null;

  const { data: refuelings = [], isLoading: refuelingsLoading } = useQuery({
    queryKey: ['vehicle-refuelings', activeVehicleId],
    queryFn: () => api.get<RefuelingLog[]>(`/vehicles/${activeVehicleId}/refuelings`),
    enabled: !!activeVehicleId && activeTab === 'fuel',
    staleTime: 1000 * 60,
  });

  const { data: vehicleStats } = useQuery({
    queryKey: ['vehicle-stats', activeVehicleId],
    queryFn: () => api.get<VehicleStats>(`/vehicles/${activeVehicleId}/stats`),
    enabled: !!activeVehicleId && activeTab === 'fuel',
    staleTime: 1000 * 60,
  });

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId);

  // Budget summary stats
  const totalBudgetLimit = budgets.reduce((acc, b) => acc + Number(b.amountLimit), 0);
  const totalBudgetSpent = budgets.reduce((acc, b) => acc + Number(b.spent), 0);
  const overBudgetCount = budgets.filter((b) => Number(b.spent) > Number(b.amountLimit)).length;

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Evolução</h1>
          <p className="text-muted-foreground mt-1">Planejamento e metas de longo prazo.</p>
        </div>
        <div className="flex bg-muted p-1 rounded-xl">
          {(['budgets', 'goals', 'fuel'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-smooth ${activeTab === tab ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {tab === 'budgets' && 'Orçamentos'}
              {tab === 'goals' && 'Metas'}
              {tab === 'fuel' && 'Combustível'}
            </button>
          ))}
        </div>
      </div>

      {/* ─── BUDGETS TAB ─── */}
      {activeTab === 'budgets' && (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {budgetsLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-premium p-6 bg-primary text-primary-foreground">
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-2">
                    Gasto no Mês
                  </p>
                  <div className="text-3xl font-bold font-display mb-2">
                    <PrivacyAmount value={totalBudgetSpent} />
                  </div>
                  <p className="text-xs opacity-80">
                    de{' '}
                    <b>
                      R${' '}
                      {Number(totalBudgetLimit).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </b>{' '}
                    orçado
                    {overBudgetCount > 0 &&
                      ` · ${overBudgetCount} categori${overBudgetCount === 1 ? 'a estourada' : 'as estouradas'}`}
                  </p>
                </div>
                <div className="card-premium p-6 flex flex-col justify-center">
                  <h2 className="text-sm font-bold flex items-center gap-2 mb-2">
                    <Flame className="w-4 h-4 text-amber-500" />
                    Insight do Mês
                  </h2>
                  {overBudgetCount > 0 ? (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Você estourou o orçamento em{' '}
                      <span className="text-rose-500 font-bold">
                        {overBudgetCount} {overBudgetCount === 1 ? 'categoria' : 'categorias'}
                      </span>
                      . Reveja seus limites ou reduza os gastos.
                    </p>
                  ) : budgets.length > 0 ? (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Parabéns! Todos os orçamentos estão{' '}
                      <span className="text-emerald-500 font-bold">dentro do limite</span> este mês.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Crie seus primeiros orçamentos para acompanhar os gastos por categoria.
                    </p>
                  )}
                </div>
              </div>

              {/* Budget cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {budgets.map((b) => (
                  <BudgetProgress
                    key={b.id}
                    label={b.category?.name ?? 'Geral'}
                    spent={Number(b.spent)}
                    limit={Number(b.amountLimit)}
                  />
                ))}
                <div className="card-premium border-dashed border-2 flex flex-col items-center justify-center p-6 text-muted-foreground hover:bg-muted/30 cursor-pointer transition-smooth">
                  <Plus className="w-5 h-5 mb-2" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Novo Orçamento
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── GOALS TAB ─── */}
      {activeTab === 'goals' && (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {goalsLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="bg-muted/40 rounded-2xl p-8 border border-border flex gap-8 items-center">
                <div className="flex-1">
                  <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest mb-2">
                    Total Acumulado
                  </p>
                  <PrivacyAmount
                    value={totalGoalsCurrent}
                    className="text-4xl font-bold font-display tracking-tight block mb-2"
                  />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Equivale a <span className="text-primary">{totalGoalsPercent.toFixed(0)}%</span>{' '}
                    do planejado
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-muted"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${totalGoalsPercent} ${100 - totalGoalsPercent}`}
                        strokeLinecap="round"
                        className="text-primary transition-all duration-700"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {goals.length} meta{goals.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {goals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
                <div className="card-premium border-dashed border-2 flex flex-col items-center justify-center p-6 text-muted-foreground hover:bg-muted/30 cursor-pointer transition-smooth">
                  <Plus className="w-5 h-5 mb-2" />
                  <span className="text-xs font-bold uppercase tracking-widest">Nova Meta</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── FUEL TAB ─── */}
      {activeTab === 'fuel' && (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {vehiclesLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
          ) : vehicles.length === 0 ? (
            <div className="card-premium p-12 flex flex-col items-center justify-center gap-4 text-center">
              <Car className="w-12 h-12 text-muted-foreground/40" />
              <div>
                <p className="font-bold">Nenhum veículo cadastrado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Cadastre um veículo em Veículos para ver o histórico de abastecimentos.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Vehicle selector */}
              <div className="flex items-center justify-between bg-card border border-border p-4 rounded-2xl shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-0.5">
                      Veículo em Análise
                    </label>
                    <select
                      value={activeVehicleId ?? ''}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="bg-transparent font-bold text-lg outline-none cursor-pointer hover:text-primary transition-smooth"
                    >
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.nickname ?? `${v.make} ${v.model}`}
                          {v.licensePlate ? ` (${v.licensePlate})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {refuelings[0] && (
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Último KM
                    </p>
                    <p className="font-bold text-lg">
                      {Number(refuelings[0].odometer).toLocaleString('pt-BR')} km
                    </p>
                  </div>
                )}
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card-premium p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                      <Gauge className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                      Consumo Médio
                    </h3>
                  </div>
                  <p className="text-2xl font-bold font-display tracking-tight">
                    {vehicleStats?.avgConsumption.toFixed(1) ?? '—'}{' '}
                    <span className="text-xs text-muted-foreground">km/L</span>
                  </p>
                </div>

                <div className="card-premium p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                      <Fuel className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                      Gasto Médio
                    </h3>
                  </div>
                  <p className="text-2xl font-bold font-display tracking-tight">
                    {vehicleStats ? <PrivacyAmount value={vehicleStats.avgCost} /> : '—'}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                    por abastecimento
                  </p>
                </div>

                <div className="card-premium p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                      Autonomia Est.
                    </h3>
                  </div>
                  <p className="text-2xl font-bold font-display tracking-tight">
                    {vehicleStats?.autonomy ?? '—'}{' '}
                    <span className="text-xs text-muted-foreground">km</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                    por tanque cheio
                  </p>
                </div>

                <div className="card-premium p-6 bg-primary text-primary-foreground">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-white/10 text-white">
                      <History className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-[10px] uppercase tracking-widest opacity-80">
                      Abastecimentos
                    </h3>
                  </div>
                  <p className="text-2xl font-bold font-display tracking-tight">
                    {refuelings.length}
                  </p>
                  <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest mt-1">
                    registrados
                  </p>
                </div>
              </div>

              {/* Refueling history table */}
              <div className="card-premium overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    Histórico de Abastecimentos
                  </h3>
                </div>
                {refuelingsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : refuelings.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    Nenhum abastecimento registrado.
                    <br />
                    <span className="text-xs">
                      Crie uma transação do tipo Combustível para começar.
                    </span>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Data
                        </th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Estabelecimento
                        </th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Litros
                        </th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          KM
                        </th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
                          Valor
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {refuelings.map((h) => (
                        <tr
                          key={h.id}
                          className="hover:bg-muted/20 transition-smooth cursor-pointer"
                        >
                          <td className="px-6 py-4 text-sm whitespace-nowrap">
                            {new Date(h.transaction.date).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              timeZone: 'UTC',
                            })}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            {h.station ?? activeVehicle?.make ?? '—'}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {Number(h.fuelLiters).toFixed(2)}L
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {Number(h.odometer).toLocaleString('pt-BR')} km
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-sm">
                            <PrivacyAmount value={Number(h.transaction.amount)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
