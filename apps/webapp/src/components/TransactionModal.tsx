import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ArrowDownLeft, Calendar, Paperclip, Lock, X, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface Account {
  id: string;
  name: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'create' | 'edit';
  initialData?: Transaction | null;
}

interface Transaction {
  id: string;
  description: string;
  amount: number | string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  classification?: string;
  isRecurring?: boolean;
  notes?: string;
  categoryId?: string;
  accountId?: string;
  category?: Category;
  account?: Account;
}

export function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  mode = 'create',
  initialData,
}: TransactionModalProps) {
  const isEditing = mode === 'edit';
  const [isExpense, setIsExpense] = useState(initialData ? initialData.type === 'EXPENSE' : true);
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring ?? false);
  const [date, setDate] = useState(
    initialData?.date
      ? new Date(initialData.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  );
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [amount, setAmount] = useState(
    initialData ? String(Math.abs(Number(initialData.amount))) : '',
  );
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? '');
  const [accountId, setAccountId] = useState(initialData?.accountId ?? '');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/categories'),
    staleTime: 1000 * 60 * 5,
    enabled: isOpen,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => api.get<Account[]>('/accounts'),
    staleTime: 1000 * 60 * 5,
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        description,
        amount: Number(amount),
        date,
        type: isExpense ? 'EXPENSE' : 'INCOME',
        isRecurring,
        notes: notes || undefined,
        categoryId: categoryId || undefined,
        accountId,
      };

      if (isEditing && initialData) {
        await api.patch(`/transactions/${initialData.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar transação.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted transition-smooth text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {/* Expense / Income toggle */}
          <div
            className={`flex gap-2 p-1 bg-muted rounded-2xl ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isEditing && (
              <div className="absolute -top-6 right-0 flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <Lock className="w-3 h-3" />
                Bloqueado
              </div>
            )}
            <button
              type="button"
              onClick={() => !isEditing && setIsExpense(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-smooth ${isExpense ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-muted-foreground hover:bg-muted-foreground/10'}`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              Despesa
            </button>
            <button
              type="button"
              onClick={() => !isEditing && setIsExpense(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-smooth ${!isExpense ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-muted-foreground hover:bg-muted-foreground/10'}`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Receita
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Description */}
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
                required
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Salário Mensal"
                className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                Valor (R$)
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 outline-none transition-smooth ${isExpense ? 'text-rose-500 focus:ring-rose-500/20' : 'text-emerald-500 focus:ring-emerald-500/20'}`}
              />
            </div>

            {/* Date */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                Data
              </label>
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                Categoria
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth appearance-none"
              >
                <option value="">Sem categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Account */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                Conta
              </label>
              <select
                required
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth appearance-none"
              >
                <option value="">Selecione uma conta</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Recurring */}
            <div className="col-span-2 pt-1">
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

            {/* Notes */}
            <div className="col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                Observações
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionais..."
                className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-2xl border border-border font-bold text-sm hover:bg-muted transition-smooth"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-[3] flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm shadow-lg transition-smooth hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:scale-100 ${isExpense ? 'bg-rose-500 shadow-rose-500/20' : 'bg-emerald-500 shadow-emerald-500/20'}`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isEditing ? 'Salvar Alterações' : `Salvar ${isExpense ? 'Despesa' : 'Receita'}`}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
