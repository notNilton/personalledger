import { useState } from 'react';
import {
  X,
  Loader2,
  Wallet,
  Building,
  PiggyBank,
  Banknote,
  Palette,
  User,
  Briefcase,
} from 'lucide-react';
import { api } from '../lib/api';

interface Account {
  id: string;
  name: string;
  balance: number | string;
  creditLimit?: number | string | null;
  type: string;
  ownership?: string;
  bankName?: string;
  cpf?: string;
  cnpj?: string;
  color: string;
  icon: string;
}

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'create' | 'edit';
  initialData?: Account | null;
}

const ACCOUNT_TYPES = [
  { value: 'CHECKING', label: 'Conta Corrente', icon: Building },
  { value: 'SAVINGS', label: 'Conta Poupança', icon: PiggyBank },
  { value: 'CASH', label: 'Dinheiro em Espécie', icon: Banknote },
  { value: 'INVESTMENT', label: 'Investimento', icon: Wallet },
];

export function AccountModal({
  isOpen,
  onClose,
  onSuccess,
  mode = 'create',
  initialData,
}: AccountModalProps) {
  const isEditing = mode === 'edit';
  const [name, setName] = useState(initialData?.name ?? '');
  const [type, setType] = useState(initialData?.type ?? 'CHECKING');
  const [ownership, setOwnership] = useState<'PERSONAL' | 'BUSINESS'>(
    (initialData?.ownership as 'PERSONAL' | 'BUSINESS') ?? 'PERSONAL',
  );
  const [bankName, setBankName] = useState(initialData?.bankName ?? '');
  const [cpf, setCpf] = useState(initialData?.cpf ?? '');
  const [cnpj, setCnpj] = useState(initialData?.cnpj ?? '');
  const [balance, setBalance] = useState(initialData?.balance?.toString() ?? '0');
  const [creditLimit, setCreditLimit] = useState(
    initialData?.creditLimit != null ? initialData.creditLimit.toString() : '',
  );
  const [color, setColor] = useState(initialData?.color ?? '#6366f1');
  const [icon, setIcon] = useState(initialData?.icon ?? 'Wallet');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        name,
        type,
        ownership,
        bankName: bankName || undefined,
        cpf: ownership === 'PERSONAL' && cpf ? cpf : undefined,
        cnpj: ownership === 'BUSINESS' && cnpj ? cnpj : undefined,
        balance: Number(balance),
        ...(creditLimit !== '' && { creditLimit: Number(creditLimit) }),
        color,
        icon,
      };

      if (isEditing && initialData) {
        await api.patch(`/accounts/${initialData.id}`, payload);
      } else {
        await api.post('/accounts', payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar conta.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold font-display tracking-tight">
              {isEditing ? 'Editar Conta' : 'Nova Conta'}
            </h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
              Gerencie suas instituições financeiras
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
          <div className="grid grid-cols-2 gap-4">
            {/* Ownership */}
            <div className="col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                Titularidade
              </label>
              <div className="flex gap-2 p-1 bg-muted rounded-xl">
                <button
                  type="button"
                  onClick={() => setOwnership('PERSONAL')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-smooth ${ownership === 'PERSONAL' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted-foreground/5'}`}
                >
                  <User className="w-3.5 h-3.5" />
                  Pessoal
                </button>
                <button
                  type="button"
                  onClick={() => setOwnership('BUSINESS')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-smooth ${ownership === 'BUSINESS' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted-foreground/5'}`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Empresarial
                </button>
              </div>
            </div>

            {/* Name */}
            <div className="col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                Nome da Conta
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Nubank, Itaú, Carteira"
                className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
              />
            </div>

            {/* Bank Name */}
            <div className="col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                Nome do Banco / Instituição
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Ex: Nubank, Itaú, Bradesco"
                className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
              />
            </div>

            {/* CPF or CNPJ */}
            {ownership === 'PERSONAL' ? (
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  CPF do Titular
                </label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
                />
              </div>
            ) : (
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  CNPJ da Empresa
                </label>
                <input
                  type="text"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
                />
              </div>
            )}

            {/* Type */}
            <div className="col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                Tipo de Conta
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ACCOUNT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      setType(t.value);
                      setIcon(t.icon.name);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-smooth text-left ${
                      type === t.value
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-muted/20 border-border hover:border-muted-foreground/30'
                    }`}
                  >
                    <t.icon className="w-4 h-4" />
                    <span className="text-xs font-bold">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Initial Balance */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                Saldo Inicial
              </label>
              <input
                required
                type="number"
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
              />
            </div>

            {/* Credit Limit */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                Limite de Crédito
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                placeholder="Opcional"
                className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
              />
            </div>

            {/* Color */}
            <div className="col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                Cor Identificadora
              </label>
              <div className="relative">
                <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-[42px] bg-muted/40 border border-border rounded-xl pl-10 pr-4 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth cursor-pointer"
                />
              </div>
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
              className="flex-[2] flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:scale-100 transition-smooth"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
