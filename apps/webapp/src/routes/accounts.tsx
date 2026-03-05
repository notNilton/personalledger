import { createFileRoute } from '@tanstack/react-router'
import { Plus, Wallet, Building, PiggyBank, CreditCard, ArrowRight, TrendingUp } from 'lucide-react'

export const Route = createFileRoute('/accounts')({
    component: AccountsPage,
})

function AccountCard({ name, balance, type, color, icon: Icon }: {
    name: string,
    balance: string,
    type: string,
    color: string,
    icon: any
}) {
    return (
        <div className="card-premium p-6 group cursor-pointer relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 ${color}/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-smooth`} />
            <div className="relative flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl ${color}/10 text-${color} shadow-sm border border-${color}/20`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded-md">{type}</span>
                </div>
                <div>
                    <h3 className="text-muted-foreground text-sm font-medium">{name}</h3>
                    <p className="text-3xl font-bold font-display mt-1 tracking-tight">{balance}</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-smooth translate-x-[-10px] group-hover:translate-x-0">
                    <span>Ver detalhes</span>
                    <ArrowRight className="w-3 h-3" />
                </div>
            </div>
        </div>
    )
}

function AccountsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col gap-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold">Suas Contas</h1>
                    <p className="text-muted-foreground mt-1">Gerencie suas carteiras, contas bancárias e investimentos.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-smooth">
                    <Plus className="w-4 h-4" />
                    Adicionar Conta
                </button>
            </div>

            {/* Net Worth Summary */}
            <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 text-primary/5 select-none pointer-events-none">
                    <TrendingUp className="w-32 h-32" />
                </div>
                <div className="relative">
                    <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-2">Patrimônio Líquido</p>
                    <p className="text-5xl font-black font-display tracking-tight">R$ 42.850,00</p>
                </div>
                <div className="flex gap-4 relative">
                    <div className="text-center px-6 border-r border-primary/10">
                        <p className="text-muted-foreground text-[10px] font-bold uppercase mb-1">Total Ativos</p>
                        <p className="text-emerald-500 font-bold">R$ 48.000</p>
                    </div>
                    <div className="text-center px-6">
                        <p className="text-muted-foreground text-[10px] font-bold uppercase mb-1">Total Passivos</p>
                        <p className="text-rose-500 font-bold">R$ 5.150</p>
                    </div>
                </div>
            </div>

            {/* Accounts Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AccountCard
                    name="Nubank Principal"
                    balance="R$ 4.250,00"
                    type="Corrente"
                    color="indigo-500"
                    icon={Wallet}
                />
                <AccountCard
                    name="Conta Salário Itaú"
                    balance="R$ 8.200,00"
                    type="Corrente"
                    color="emerald-500"
                    icon={Building}
                />
                <AccountCard
                    name="Reserva de Emergência"
                    balance="R$ 25.000,00"
                    type="Investimento"
                    color="blue-500"
                    icon={PiggyBank}
                />
                <AccountCard
                    name="Cartão Infinite"
                    balance="-R$ 3.840,50"
                    type="Cartão"
                    color="violet-500"
                    icon={CreditCard}
                />
                <div className="rounded-2xl border-2 border-dashed border-border flex items-center justify-center p-6 text-muted-foreground hover:bg-muted/30 transition-smooth cursor-pointer group">
                    <div className="flex flex-col items-center gap-2 group-hover:scale-105 transition-smooth">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Plus className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium">Vincular nova conta</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
