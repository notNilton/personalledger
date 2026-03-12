import { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Calendar, Paperclip, Lock } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  initialData?: any;
}

export function TransactionModal({
  isOpen,
  onClose,
  mode = 'create',
  initialData,
}: TransactionModalProps) {
  const isEditing = mode === 'edit';
  const [type, setType] = useState<'common' | 'fuel'>(
    initialData?.type === 'fuel' ? 'fuel' : 'common',
  );
  const [isExpense, setIsExpense] = useState(initialData ? initialData.val < 0 : true);
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false);
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-xl rounded-3xl shadow-2xl shadow-primary/5 p-8 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold font-display tracking-tight">
              {isEditing ? 'Editar Lançamento' : 'Novo Lançamento'}
            </h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
              {isEditing ? 'Atualize os detalhes da transação' : 'Registro de atividade financeira'}
            </p>
          </div>
          <div
            className={`flex bg-muted p-1 rounded-xl relative ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isEditing ? 'O tipo de lançamento não pode ser alterado após a criação' : ''}
          >
            {isEditing && (
              <div className="absolute -top-6 right-0 flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <Lock className="w-3 h-3" />
                Bloqueado
              </div>
            )}
            <button
              onClick={() => setType('common')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-smooth ${type === 'common' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'} ${isEditing ? 'pointer-events-none' : ''}`}
            >
              Comum
            </button>
            <button
              onClick={() => setType('fuel')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-smooth ${type === 'fuel' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'} ${isEditing ? 'pointer-events-none' : ''}`}
            >
              Combustível
            </button>
          </div>
        </div>

        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            onClose();
          }}
        >
          {type === 'common' && (
            <div
              className={`flex gap-2 p-1 bg-muted rounded-2xl mb-2 relative ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={
                isEditing
                  ? 'A categoria (Despesa/Receita) não pode ser alterada após a criação'
                  : ''
              }
            >
              {isEditing && (
                <div className="absolute -top-6 right-0 flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <Lock className="w-3 h-3" />
                  Bloqueado
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsExpense(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-smooth ${isExpense ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-muted-foreground hover:bg-muted-foreground/10'} ${isEditing ? 'pointer-events-none' : ''}`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                Despesa
              </button>
              <button
                type="button"
                onClick={() => setIsExpense(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-smooth ${!isExpense ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-muted-foreground hover:bg-muted-foreground/10'} ${isEditing ? 'pointer-events-none' : ''}`}
              >
                <ArrowUpRight className="w-4 h-4" />
                Receita
              </button>
            </div>
          )}

          {type === 'common' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
                    Descrição
                  </label>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-smooth"
                  >
                    <Paperclip className="w-3 h-3" />
                    Anexar
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Ex: Salário Mensal"
                  className="w-full bg-muted/40 border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className={`w-full bg-muted/40 border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 outline-none transition-smooth ${isExpense ? 'text-rose-500 focus:ring-rose-500/20' : 'text-emerald-500 focus:ring-emerald-500/20'}`}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Data
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-muted/40 border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Categoria
                </label>
                <select className="w-full bg-muted/40 border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth appearance-none">
                  {isExpense ? (
                    <>
                      <option>Alimentação</option>
                      <option>Lazer</option>
                      <option>Transporte</option>
                      <option>Moradia</option>
                    </>
                  ) : (
                    <>
                      <option>Salário</option>
                      <option>Freelancer</option>
                      <option>Investimentos</option>
                      <option>Vendas</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Conta
                </label>
                <select className="w-full bg-muted/40 border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth appearance-none">
                  <option>Nubank</option>
                  <option>Itaú</option>
                  <option>XP Investimentos</option>
                </select>
              </div>

              <div className="col-span-2 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 transition-smooth"
                  />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest group-hover:text-foreground transition-smooth">
                      Lançamento Recorrente
                    </span>
                    <p className="text-[10px] text-muted-foreground">
                      Repetir automaticamente todos os meses
                    </p>
                  </div>
                </label>
              </div>

              {isRecurring && date && (
                <div className="col-span-2 animate-in slide-in-from-top-2 duration-200 bg-primary/5 border border-primary/10 p-3 rounded-xl flex items-center gap-3 font-medium">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                      Agendamento Automático
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Repetir todo{' '}
                      <span className="font-bold text-foreground underline underline-offset-4 decoration-primary/30 text-sm">
                        dia {new Date(date + 'T12:00:00').getDate()}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Observações
                </label>
                <textarea
                  rows={2}
                  placeholder="Notas adicionais..."
                  className="w-full bg-muted/40 border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
                    Veículo
                  </label>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-smooth"
                  >
                    <Paperclip className="w-3 h-3" />
                    Anexar Nota
                  </button>
                </div>
                <select className="w-full bg-muted/40 border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth appearance-none">
                  <option>Toyota Corolla (ABC-1234)</option>
                  <option>Honda CB 500X</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Posto / Estabelecimento
                </label>
                <input
                  type="text"
                  placeholder="Ex: Posto Ipiranga Jabaquara"
                  className="w-full bg-muted/40 border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Tipo de Combustível
                </label>
                <select className="w-full bg-muted/40 border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth appearance-none">
                  <option>Gasolina Comum</option>
                  <option>Gasolina Aditivada</option>
                  <option>Etanol</option>
                  <option>Diesel</option>
                  <option>GNV</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  KM Atual
                </label>
                <input
                  type="number"
                  className="w-full bg-muted/40 border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Data
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-muted/40 border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Valor Total
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-muted/40 border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Litros
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-muted/40 border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
                />
              </div>
              <div className="col-span-2 font-medium">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Observações de Abastecimento
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Calibragem dos pneus, troca de óleo..."
                  className="w-full bg-muted/40 border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth resize-none"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-2xl border border-border font-bold text-sm hover:bg-muted transition-smooth"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-3 px-6 py-3 rounded-2xl text-white font-bold text-sm shadow-lg transition-smooth hover:scale-[1.02] active:scale-95 ${isExpense ? 'bg-rose-500 shadow-rose-500/20' : 'bg-emerald-500 shadow-emerald-500/20'}`}
            >
              {isEditing ? 'Salvar Alterações' : `Salvar ${isExpense ? 'Despesa' : 'Receita'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
