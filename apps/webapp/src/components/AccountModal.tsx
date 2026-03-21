import { useEffect, useRef, useState } from 'react';
import {
  X,
  Loader2,
  Wallet,
  Building,
  PiggyBank,
  Banknote,
  User,
  Briefcase,
  ChevronDown,
} from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
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
  hasDebit?: boolean;
  hasPix?: boolean;
  hasCredit?: boolean;
}

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'create' | 'edit';
  initialAccount?: Account | null;
}

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'CHECKING', label: 'Conta Corrente', icon: Building },
  { value: 'SAVINGS', label: 'Conta Poupança', icon: PiggyBank },
  { value: 'CASH', label: 'Dinheiro em Espécie', icon: Banknote },
  { value: 'WALLET', label: 'Carteira Digital', icon: Wallet },
  { value: 'INVESTMENT', label: 'Investimento', icon: Wallet },
];

function TypeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = ACCOUNT_TYPE_OPTIONS.find((o) => o.value === value);
  const Icon = selected?.icon ?? Wallet;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
      >
        <div className="flex items-center gap-2 font-medium">
          <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
          <span>{selected?.label ?? 'Selecione'}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-[calc(100%+0.5rem)] left-0 right-0 z-50 bg-card border border-border rounded-xl shadow-xl shadow-primary/10 overflow-hidden animate-in fade-in slide-in-from-top-2 p-1 ring-1 ring-black/5">
            {ACCOUNT_TYPE_OPTIONS.map((opt) => {
              const OptIcon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-smooth hover:bg-muted/60 ${value === opt.value ? 'bg-primary/5 text-primary font-bold' : 'text-foreground'}`}
                >
                  <OptIcon className="w-4 h-4 shrink-0" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const ICON_BY_TYPE: Record<string, string> = {
  CHECKING: 'Building',
  SAVINGS: 'PiggyBank',
  CASH: 'Banknote',
  WALLET: 'Wallet',
  INVESTMENT: 'Wallet',
};

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full h-[38px] rounded-lg border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
        style={{ backgroundColor: value }}
      />
      {open && (
        <div className="absolute top-[calc(100%+6px)] right-0 z-50 p-2 bg-card border border-border rounded-xl shadow-xl shadow-primary/10 animate-in fade-in slide-in-from-top-2">
          <HexColorPicker color={value} onChange={onChange} />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-2 w-full text-xs text-center bg-muted/40 border border-border rounded-lg px-2 py-1 outline-none font-mono"
            maxLength={7}
          />
        </div>
      )}
    </div>
  );
}

export function AccountModal({
  isOpen,
  onClose,
  onSuccess,
  mode = 'create',
  initialAccount,
}: AccountModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('CHECKING');
  const [ownership, setOwnership] = useState<'PERSONAL' | 'BUSINESS'>('PERSONAL');
  const [bankName, setBankName] = useState('');
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [balance, setBalance] = useState('0');
  const [color, setColor] = useState('#6366f1');
  const [hasDebit, setHasDebit] = useState(true);
  const [hasPix, setHasPix] = useState(true);
  const [hasCredit, setHasCredit] = useState(false);
  const [creditLimit, setCreditLimit] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setName(initialAccount?.name ?? '');
    setType(initialAccount?.type ?? 'CHECKING');
    setOwnership((initialAccount?.ownership as 'PERSONAL' | 'BUSINESS') ?? 'PERSONAL');
    setBankName(initialAccount?.bankName ?? '');
    setCpf(initialAccount?.cpf ?? '');
    setCnpj(initialAccount?.cnpj ?? '');
    setBalance(
      initialAccount ? Math.floor(Math.abs(Number(initialAccount.balance)) * 100).toString() : '0',
    );
    setColor(initialAccount?.color ?? '#6366f1');
    setHasDebit(initialAccount?.hasDebit ?? true);
    setHasPix(initialAccount?.hasPix ?? true);
    const existingLimit = Number(initialAccount?.creditLimit ?? 0);
    setHasCredit(initialAccount?.hasCredit ?? existingLimit > 0);
    setCreditLimit(existingLimit > 0 ? Math.floor(existingLimit * 100).toString() : '0');
  }, [isOpen, initialAccount]);

  if (!isOpen) return null;

  const fmt = (cents: string) =>
    (Number(cents) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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
        balance: Number(balance) / 100,
        color,
        icon: ICON_BY_TYPE[type] ?? 'Wallet',
        hasDebit,
        hasPix,
        hasCredit,
        creditLimit: hasCredit ? Number(creditLimit) / 100 : null,
      };

      if (mode === 'edit' && initialAccount) {
        await api.patch(`/accounts/${initialAccount.id}`, payload);
      } else {
        await api.post('/accounts', payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar conta.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls =
    'w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth';
  const labelCls =
    'text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl shadow-primary/5 p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold font-display">
            {mode === 'edit' ? 'Editar Conta' : 'Nova Conta'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-smooth text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Titularidade */}
          <div>
            <label className={labelCls}>Titularidade</label>
            <div className="flex gap-1.5 p-1 bg-muted rounded-lg">
              {(['PERSONAL', 'BUSINESS'] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOwnership(o)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold transition-smooth ${
                    ownership === o
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted-foreground/5'
                  }`}
                >
                  {o === 'PERSONAL' ? (
                    <User className="w-3 h-3" />
                  ) : (
                    <Briefcase className="w-3 h-3" />
                  )}
                  {o === 'PERSONAL' ? 'Pessoal' : 'Empresarial'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {/* Nome + Banco */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Nome da Conta</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Nubank"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Banco</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Ex: Itaú"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Tipo + Cor */}
            <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 48px' }}>
              <div>
                <label className={labelCls}>Tipo</label>
                <TypeSelect value={type} onChange={setType} />
              </div>
              <div>
                <label className={labelCls}>Cor</label>
                <ColorPicker value={color} onChange={setColor} />
              </div>
            </div>

            {/* CPF / CNPJ */}
            <div>
              <label className={labelCls}>{ownership === 'PERSONAL' ? 'CPF' : 'CNPJ'}</label>
              <input
                type="text"
                value={ownership === 'PERSONAL' ? cpf : cnpj}
                onChange={(e) =>
                  ownership === 'PERSONAL' ? setCpf(e.target.value) : setCnpj(e.target.value)
                }
                placeholder={ownership === 'PERSONAL' ? '000.000.000-00' : '00.000.000/0000-00'}
                maxLength={ownership === 'PERSONAL' ? 14 : 18}
                className={inputCls}
              />
            </div>

            {/* Métodos de pagamento */}
            <div>
              <label className={labelCls}>Métodos de Pagamento</label>
              <div className="flex gap-2 p-1 bg-muted rounded-xl">
                {(
                  [
                    {
                      key: 'debit',
                      label: 'Débito',
                      active: hasDebit,
                      toggle: () => setHasDebit((v) => !v),
                    },
                    {
                      key: 'pix',
                      label: 'PIX',
                      active: hasPix,
                      toggle: () => setHasPix((v) => !v),
                    },
                    {
                      key: 'credit',
                      label: 'Crédito',
                      active: hasCredit,
                      toggle: () => setHasCredit((v) => !v),
                    },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={m.toggle}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-smooth ${
                      m.active
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted-foreground/5'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {(hasDebit || hasPix) && (
                <div className="mt-3">
                  <label className={labelCls}>Saldo Atual</label>
                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    value={fmt(balance)}
                    onChange={(e) => setBalance(e.target.value.replace(/\D/g, ''))}
                    className={`${inputCls} font-bold`}
                  />
                </div>
              )}

              {hasCredit && (
                <div className="mt-3">
                  <label className={labelCls}>Limite de Crédito</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={fmt(creditLimit)}
                    onChange={(e) => setCreditLimit(e.target.value.replace(/\D/g, ''))}
                    className={`${inputCls} font-bold`}
                  />
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border font-bold text-sm hover:bg-muted transition-smooth"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-60 transition-smooth"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
