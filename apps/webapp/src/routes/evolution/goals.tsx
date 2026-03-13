import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Plus, CheckCircle2, Target, Calendar, Loader2 } from 'lucide-react';
import PrivacyAmount from '../../components/PrivacyAmount';
import { api } from '../../lib/api';
import type { Goal } from './_types';

export const Route = createFileRoute('/evolution/goals')({
  component: GoalsPage,
});

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

function GoalsPage() {
  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => api.get<Goal[]>('/goals'),
    staleTime: 1000 * 60,
  });

  const totalGoalsCurrent = goals.reduce((acc, g) => acc + Number(g.currentAmount), 0);
  const totalGoalsTarget = goals.reduce((acc, g) => acc + Number(g.targetAmount), 0);
  const totalGoalsPercent =
    totalGoalsTarget > 0 ? Math.min((totalGoalsCurrent / totalGoalsTarget) * 100, 100) : 0;

  return (
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
                Equivale a <span className="text-primary">{totalGoalsPercent.toFixed(0)}%</span> do
                planejado
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
  );
}
