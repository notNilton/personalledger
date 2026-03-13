import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';

export const Route = createFileRoute('/evolution')({
  component: EvolutionLayout,
});

function EvolutionLayout() {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { id: 'budgets', label: 'Orçamentos', path: '/evolution/budgets' },
    { id: 'goals', label: 'Metas', path: '/evolution/goals' },
    { id: 'fuel', label: 'Combustível', path: '/evolution/fuel' },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold font-title text-foreground">
            Evolução
          </h1>
          <p className="text-foreground/50 mt-1 text-xs sm:text-sm font-medium italic">
            Planejamento e metas do seu patrimônio.
          </p>
        </div>

        <div className="flex bg-muted/50 p-1.5 rounded-xl border border-border/50 w-full md:w-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              to={tab.path}
              className={`flex-1 md:flex-none text-center px-4 sm:px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                currentPath.includes(tab.path)
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-foreground/60 hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <Outlet />
    </div>
  );
}
