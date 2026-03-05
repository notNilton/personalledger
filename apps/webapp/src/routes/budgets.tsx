import { createFileRoute } from '@tanstack/react-router'
import { Plus, Target, Flame, Lightbulb, ArrowRight, ShieldCheck } from 'lucide-react'

export const Route = createFileRoute('/budgets')({
    component: BudgetsPage,
})

function BudgetProgress({ label, spent, limit, color }: { label: string, spent: number, limit: number, color: string }) {
    const percent = Math.min((spent / limit) * 100, 100)
    const isOver = spent > limit

    return (
        <div className="card-premium p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm tracking-tight">{label}</h3>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${isOver ? 'bg-rose-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                    {isOver ? 'Estourado' : 'Dentro'}
                </span>
            </div>
            <div>
                <div className="flex items-end justify-between mb-2">
                    <p className="text-2xl font-bold font-display tracking-tight">
                        R$ {spent.toLocaleString('pt-BR')}
                        <span className="text-muted-foreground text-sm font-medium"> / R$ {limit.toLocaleString('pt-BR')}</span>
                    </p>
                    <p className={`text-xs font-bold ${isOver ? 'text-rose-500' : 'text-primary'}`}>
                        {percent.toFixed(0)}%
                    </p>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-smooth ${isOver ? 'bg-rose-500' : color}`}
                        style={{ width: `${percent}%` }}
                    />
                </div>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-border mt-2">
                <p className="text-[10px] text-muted-foreground font-medium">RESTANTE: <span className={isOver ? 'text-rose-500' : 'text-foreground'}>R$ {Math.max(limit - spent, 0).toLocaleString('pt-BR')}</span></p>
                <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-smooth">
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

function BudgetsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col gap-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold">Orçamentos</h1>
                    <p className="text-muted-foreground mt-1">Planeje seus gastos e controle seus limites mensais.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-smooth">
                    <Target className="w-4 h-4" />
                    Novo Orçamento
                </button>
            </div>

            {/* Goal Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-8 text-white flex flex-col gap-6 shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-smooth">
                        <ShieldCheck className="w-24 h-24" />
                    </div>
                    <div className="relative">
                        <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Reserva Mensal</p>
                        <h2 className="text-4xl font-black font-display tracking-tight">R$ 2.500,00</h2>
                        <p className="text-indigo-100/70 text-sm mt-2">Você já economizou 80% da sua meta este mês.</p>
                    </div>
                    <button className="relative w-fit flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold transition-smooth">
                        Configurar Rollover
                        <ArrowRight className="w-3 h-3" />
                    </button>
                </div>

                <div className="bg-card border border-border rounded-3xl p-8 flex flex-col gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-primary/5 group-hover:scale-110 transition-smooth">
                        <Lightbulb className="w-24 h-24" />
                    </div>
                    <h2 className="text-lg font-bold flex items-center gap-2 relative">
                        <Flame className="w-5 h-5 text-amber-500" />
                        Insights de Gasto
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed relative">
                        Seus gastos com <span className="text-foreground font-bold italic">Lazer</span> estão 15% acima da média dos últimos 3 meses.
                        Que tal reduzir em R$ 100 essa semana?
                    </p>
                    <div className="h-1 bg-muted rounded-full overflow-hidden relative">
                        <div className="h-full bg-amber-500 w-2/3" />
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="flex flex-col gap-6">
                <h2 className="text-xl font-bold font-display">Categorias Principais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <BudgetProgress label="Alimentação" spent={950} limit={1200} color="bg-indigo-500" />
                    <BudgetProgress label="Transporte" spent={480} limit={500} color="bg-emerald-500" />
                    <BudgetProgress label="Lazer" spent={520} limit={400} color="bg-rose-500" />
                    <BudgetProgress label="Moradia" spent={2100} limit={2100} color="bg-blue-500" />
                    <BudgetProgress label="Saúde" spent={150} limit={600} color="bg-cyan-500" />
                    <BudgetProgress label="Outros" spent={240} limit={300} color="bg-slate-500" />
                </div>
            </div>
        </div>
    )
}
