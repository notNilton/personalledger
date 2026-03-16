import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Flame,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Target,
} from 'lucide-react';
import PrivacyAmount from '../components/PrivacyAmount';
import { api } from '../lib/api';
import type { Budget } from './_types';
import { BudgetModal } from '../components/BudgetModal';

export const Route = createFileRoute('/budgets')({
  component: BudgetsPage,
});

function BudgetCard({ budget, onClick }: { budget: Budget; onClick: () => void }) {
  const spent = Number(budget.spent);
  const limit = Number(budget.amountLimit);
  const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const isOver = spent > limit;

  return (
    <button
      onClick={onClick}
      className="card-premium p-5 flex flex-col gap-5 hover:border-primary/20 transition-all duration-300 group text-left w-full h-full"
    >
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          {budget.category?.icon ? (
            <span className="text-xl">{budget.category.icon}</span>
          ) : (
            <Target className="w-5 h-5" />
          )}
        </div>
        <div
          className={`px-2 py-1 rounded-md flex items-center gap-1.5 ${isOver ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}
        >
          <span className="text-[9px] font-black uppercase tracking-widest">
            {isOver ? 'Excedido' : 'No Limite'}
          </span>
        </div>
      </div>

      <div>
        <h3 className="font-black text-sm text-foreground mb-4 group-hover:text-primary transition-colors">
          {budget.category?.name ?? 'Geral'}
        </h3>

        <div className="flex items-baseline justify-between mb-2">
          <div
            className={`text-xl font-black font-display tracking-tight ${isOver ? 'text-rose-500' : 'text-foreground'}`}
          >
            <PrivacyAmount value={spent} />
          </div>
          <div className="text-[10px] text-foreground/40 font-black uppercase tracking-widest">
            de <PrivacyAmount value={limit} />
          </div>
        </div>

        <div className="h-1.5 bg-muted rounded-full overflow-hidden relative">
          <div
            className={`h-full transition-all duration-1000 ease-out rounded-full ${isOver ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-end mt-2">
          <span
            className={`text-[10px] font-black uppercase tracking-widest ${isOver ? 'text-rose-500' : 'text-primary'}`}
          >
            {percent.toFixed(0)}%
          </span>
        </div>
      </div>
    </button>
  );
}

function BudgetsPage() {
  const queryClient = useQueryClient();
  const [now, setNow] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', year, month],
    queryFn: () => api.get<Budget[]>(`/budgets?year=${year}&month=${month}`),
    staleTime: 1000 * 60,
  });

  const totalLimit = budgets.reduce((acc, b) => acc + Number(b.amountLimit), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + Number(b.spent), 0);
  const overCount = budgets.filter((b) => Number(b.spent) > Number(b.amountLimit)).length;
  const globalPercent = totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0;

  const handleCreate = () => {
    setSelectedBudget(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (budget: Budget) => {
    setSelectedBudget(budget);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handlePrevMonth = () => {
    setNow(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setNow(new Date(year, month, 1));
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header / Summary */}
      <div className="card-premium p-6 sm:p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 text-primary opacity-[0.02] -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-1000">
          <TrendingUp className="w-48 h-48" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex-1 text-center sm:text-left">
            <div className="text-foreground/40 font-black text-[10px] uppercase tracking-widest mb-2 flex items-center justify-center sm:justify-start gap-2">
              <div className="w-1 h-1 rounded-full bg-primary" />
              Controle de Orçamentos
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
              <div className="flex flex-col">
                <div className="text-3xl sm:text-4xl font-black font-display tracking-tight text-foreground flex items-baseline justify-center sm:justify-start gap-2">
                  <PrivacyAmount value={totalSpent} />
                  <span className="text-sm text-foreground/20 font-bold">
                    / <PrivacyAmount value={totalLimit} />
                  </span>
                </div>
                <div className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mt-1">
                  Total Gasto em{' '}
                  {now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </div>
              </div>

              {/* Month Navigator */}
              <div className="flex items-center justify-center gap-2 bg-muted/20 p-1 rounded-xl border border-border/50">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-muted rounded-lg transition-smooth"
                >
                  <TrendingDown className="w-4 h-4" />
                </button>
                <div className="px-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <CalendarIcon className="w-3 h-3" />
                  {now.toLocaleDateString('pt-BR', { month: 'short' })}
                </div>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-muted rounded-lg transition-smooth"
                >
                  <TrendingUp className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <div className="text-[10px] font-black text-foreground/60 uppercase tracking-widest flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-full">
                <span>{globalPercent.toFixed(1)}%</span>
                <span className="w-1 h-1 rounded-full bg-foreground/20" />
                <span>Utilizado</span>
              </div>
              {overCount > 0 && (
                <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2 bg-rose-500/5 px-3 py-1.5 rounded-full">
                  <Flame className="w-3 h-3" />
                  <span>{overCount} Estourados</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleCreate}
            className="group relative flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-white/20 rounded-3xl scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
            <Plus className="w-4 h-4 relative z-10 group-hover:rotate-180 transition-transform duration-500" />
            <span className="relative z-10">Novo Orçamento</span>
          </button>
        </div>
      </div>

      {budgetsLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 animate-pulse">
            Sincronizando orçamentos...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {budgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} onClick={() => handleEdit(budget)} />
          ))}

          {/* Empty state hint if no budgets */}
          {budgets.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center text-center opacity-40">
              <TrendingDown className="w-12 h-12 mb-4" />
              <p className="font-bold">Nenhum orçamento planejado para este período</p>
              <p className="text-sm">Comece definindo seus limites de gastos.</p>
            </div>
          )}
        </div>
      )}

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: budgets.length > 0 ? ['budgets'] : ['budgets', year, month],
          });
        }}
        mode={modalMode}
        initialData={selectedBudget}
      />
    </div>
  );
}
