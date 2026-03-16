import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Plus, CheckCircle2, Target, Calendar, Loader2 } from 'lucide-react';
import PrivacyAmount from '../components/PrivacyAmount';
import { api } from '../lib/api';
import type { Goal } from './_types';
import { GoalModal } from '../components/GoalModal';

export const Route = createFileRoute('/goals')({
  component: GoalsPage,
});

function GoalCard({ goal, onClick }: { goal: Goal; onClick: () => void }) {
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
    <button
      onClick={onClick}
      className="card-premium p-5 flex flex-col gap-5 hover:border-primary/20 transition-all duration-300 group text-left w-full h-full"
    >
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          <Target className="w-5 h-5" />
        </div>
        {isCompleted && (
          <div className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            <span className="text-[9px] font-black uppercase tracking-widest">Concluída</span>
          </div>
        )}
      </div>

      <div>
        <h3 className="font-black text-sm text-foreground mb-1 group-hover:text-primary transition-colors">
          {goal.name}
        </h3>
        {deadline && (
          <div className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest flex items-center gap-1.5 mb-4">
            <Calendar className="w-3.5 h-3.5" />
            Até {deadline}
          </div>
        )}

        <div className="flex items-baseline justify-between mb-2">
          <div className="text-xl font-black font-display tracking-tight text-foreground">
            <PrivacyAmount value={current} />
          </div>
          <div className="text-[10px] text-foreground font-black uppercase tracking-widest">
            {percent.toFixed(0)}%
          </div>
        </div>

        <div className="h-2 bg-muted/30 rounded-full overflow-hidden mb-3 border border-border/10">
          <div
            className={`h-full transition-all duration-1000 ease-out ${
              isCompleted
                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                : 'bg-primary shadow-[0_0_8px_rgba(var(--primary),0.3)]'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
            Faltam{' '}
            <span className="text-foreground">
              <PrivacyAmount value={Math.max(target - current, 0)} />
            </span>
          </div>
          <div className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
            Alvo:{' '}
            <span className="text-foreground">
              <PrivacyAmount value={target} />
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function GoalsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => api.get<Goal[]>('/goals'),
    staleTime: 1000 * 60,
  });

  const totalGoalsCurrent = goals.reduce((acc, g) => acc + Number(g.currentAmount), 0);
  const totalGoalsTarget = goals.reduce((acc, g) => acc + Number(g.targetAmount), 0);
  const totalGoalsPercent =
    totalGoalsTarget > 0 ? Math.min((totalGoalsCurrent / totalGoalsTarget) * 100, 100) : 0;

  const handleOpenCreate = () => {
    setSelectedGoal(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: Goal) => {
    setSelectedGoal(goal);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['goals'] });
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {goalsLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
        </div>
      ) : (
        <>
          {/* Summary Dashboard Header */}
          <div className="card-premium p-6 sm:p-8 bg-gradient-to-br from-card to-muted/20 border-primary/5 flex flex-col sm:flex-row gap-8 items-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 text-primary opacity-[0.02] -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-1000">
              <Target className="w-48 h-48" />
            </div>

            <div className="flex-1 text-center sm:text-left z-10">
              <div className="text-foreground/40 font-black text-[10px] uppercase tracking-widest mb-2 flex items-center justify-center sm:justify-start gap-2">
                <div className="w-1 h-1 rounded-full bg-primary" />
                Capital Total Destinado
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-3 mt-1">
                <PrivacyAmount
                  value={totalGoalsCurrent}
                  className="text-3xl sm:text-5xl font-black font-display tracking-tighter text-foreground"
                />
                <span className="text-xs sm:text-sm font-bold text-foreground/40 uppercase tracking-widest">
                  Acumulado
                </span>
              </div>
              <div className="text-[10px] font-black text-foreground/60 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2 bg-primary/5 w-fit px-3 py-1.5 rounded-full mx-auto sm:mx-0">
                <span>{totalGoalsPercent.toFixed(1)}%</span>
                <span className="w-1 h-1 rounded-full bg-foreground/20" />
                <span>Progresso Global</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 z-10">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-border/40"
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
                    className="text-primary transition-all duration-1000 ease-in-out"
                    style={{ strokeDashoffset: '0' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Target className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm">
                <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
                  {goals.length} Meta{goals.length !== 1 ? 's' : ''} Ativa
                  {goals.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Goals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onClick={() => handleOpenEdit(goal)} />
            ))}
            <button
              onClick={handleOpenCreate}
              className="card-premium border-dashed border-2 border-border/50 flex flex-col items-center justify-center p-8 sm:p-12 text-foreground/30 hover:text-primary hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all duration-300 group min-h-[220px]"
            >
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-90 transition-all duration-500">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Nova Meta</span>
              <p className="text-[9px] text-center mt-2 opacity-50 px-4">
                Defina um objetivo financeiro e começe a poupar agora
              </p>
            </button>
          </div>
        </>
      )}

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        mode={modalMode}
        initialData={selectedGoal}
      />
    </div>
  );
}
