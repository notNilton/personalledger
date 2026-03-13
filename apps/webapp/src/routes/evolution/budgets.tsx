import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Plus, Flame, Loader2 } from 'lucide-react';
import PrivacyAmount from '../../components/PrivacyAmount';
import { api } from '../../lib/api';
import type { Budget } from './_types';

export const Route = createFileRoute('/evolution/budgets')({
  component: BudgetsPage,
});

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

function BudgetsPage() {
  const now = new Date();

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', now.getFullYear(), now.getMonth() + 1],
    queryFn: () =>
      api.get<Budget[]>(`/budgets?year=${now.getFullYear()}&month=${now.getMonth() + 1}`),
    staleTime: 1000 * 60,
  });

  const totalBudgetLimit = budgets.reduce((acc, b) => acc + Number(b.amountLimit), 0);
  const totalBudgetSpent = budgets.reduce((acc, b) => acc + Number(b.spent), 0);
  const overBudgetCount = budgets.filter((b) => Number(b.spent) > Number(b.amountLimit)).length;

  return (
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
              <span className="text-xs font-bold uppercase tracking-widest">Novo Orçamento</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
