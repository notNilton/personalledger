import { createFileRoute } from '@tanstack/react-router'
import { FileUp, FileText, CheckCircle2, AlertCircle, Info, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/import')({
    component: ImportPage,
})

function ImportPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col gap-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold">Importar Dados</h1>
                    <p className="text-muted-foreground mt-1">Sincronize seu extrato bancário (OFX ou CSV) de forma segura.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Zone */}
                <div className="lg:col-span-2">
                    <div className="card-premium h-[400px] border-2 border-dashed border-primary/20 hover:border-primary/50 transition-smooth flex flex-col items-center justify-center gap-6 group cursor-pointer bg-primary/5">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-smooth">
                            <FileUp className="w-10 h-10" />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold">Arraste seus arquivos aqui</p>
                            <p className="text-sm text-muted-foreground mt-1">Suporta arquivos .ofx, .csv e .xlsx</p>
                        </div>
                        <button className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20">
                            Selecionar Arquivo
                        </button>
                    </div>

                    <div className="mt-8 flex flex-col gap-4">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Arquivos Recentes</h3>
                        <div className="card-premium p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">extrato_nubank_março.ofx</p>
                                    <p className="text-xs text-muted-foreground">1.2 MB • Importado hoje às 14:20</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold">
                                <CheckCircle2 className="w-4 h-4" />
                                SUCESSO
                            </div>
                        </div>
                        <div className="card-premium p-4 flex items-center justify-between opacity-60">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">extrato_itau_fev.csv</p>
                                    <p className="text-xs text-muted-foreground">0.8 MB • Ontem às 09:15</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-orange-500 text-xs font-bold">
                                <AlertCircle className="w-4 h-4" />
                                CONCILIADO PARCIAL
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="flex flex-col gap-6">
                    <div className="card-premium p-6 bg-primary text-primary-foreground">
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="w-5 h-5" />
                            <h2 className="font-bold">Como funciona?</h2>
                        </div>
                        <ul className="text-xs space-y-4 opacity-90 leading-relaxed font-medium">
                            <li className="flex gap-3">
                                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">1</span>
                                Exportar o arquivo OFX diretamente do app do seu banco.
                            </li>
                            <li className="flex gap-3">
                                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">2</span>
                                Fazer o upload aqui e aguardar a categorização automática inteligente.
                            </li>
                            <li className="flex gap-3">
                                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">3</span>
                                Validar os lançamentos e atualizar seu saldo em tempo real.
                            </li>
                        </ul>
                        <button className="w-full mt-6 py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-smooth flex items-center justify-center gap-2">
                            Dúvidas sobre segurança?
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="card-premium p-6">
                        <h2 className="text-sm font-bold mb-4">Privacidade</h2>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Não armazenamos suas credenciais bancárias. A importação por arquivo é a forma mais segura de manter seu controle financeiro isolado e privado.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
