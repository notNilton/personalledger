import { useEffect, useState } from 'react';
import {
  X,
  Loader2,
  Wallet,
  Building,
  PiggyBank,
  CreditCard,
  Banknote,
  Palette,
  Wallet as WalletIcon,
  CreditCard as CreditCardIcon,
} from 'lucide-react';
import { api } from '../lib/api';

export type AccountModalTab = 'account' | 'card';

interface Account {
  id: string;
  name: string;
  balance: number | string;
  type: string;
  color: string;
  icon: string;
  cards?: Card[];
}

interface Card {
  id: string;
  accountId: string;
  name: string;
  type: 'CREDIT' | 'DEBIT';
  creditLimit?: number | string | null;
  color?: string | null;
  account?: { id: string; name: string };
}

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** Versão do modal: formulário de conta ou de cartão (definido pelo botão que abriu). */
  activeTab?: AccountModalTab;
  mode?: 'create' | 'edit';
  initialAccount?: Account | null;
  initialCard?: Card | null;
  /** Ao abrir para criar cartão, pré-selecionar esta conta. */
  preselectedAccountId?: string | null;
}

const ACCOUNT_TYPES = [
  { value: 'CHECKING', label: 'Conta Corrente', icon: Building },
  { value: 'SAVINGS', label: 'Conta Poupança', icon: PiggyBank },
  { value: 'CASH', label: 'Dinheiro em Espécie', icon: Banknote },
  { value: 'WALLET', label: 'Carteira', icon: Wallet },
  { value: 'INVESTMENT', label: 'Investimento', icon: WalletIcon },
];

const CARD_TYPES = [
  { value: 'DEBIT', label: 'Débito', icon: CreditCard },
  { value: 'CREDIT', label: 'Crédito', icon: CreditCardIcon },
];

export function AccountModal({
  isOpen,
  onClose,
  onSuccess,
  activeTab: initialTab = 'account',
  mode = 'create',
  initialAccount,
  initialCard,
  preselectedAccountId,
}: AccountModalProps) {
  const variant = initialTab;

  // Conta
  const [accountName, setAccountName] = useState(initialAccount?.name ?? '');
  const [accountType, setAccountType] = useState(initialAccount?.type ?? 'CHECKING');
  const [balance, setBalance] = useState(
    initialAccount ? Math.floor(Math.abs(Number(initialAccount.balance)) * 100).toString() : '0',
  );
  const [accountColor, setAccountColor] = useState(initialAccount?.color ?? '#6366f1');

  // Cartão
  const [cardAccountId, setCardAccountId] = useState(
    initialCard?.accountId ?? preselectedAccountId ?? '',
  );
  const [cardName, setCardName] = useState(initialCard?.name ?? '');
  const [cardType, setCardType] = useState<'CREDIT' | 'DEBIT'>(initialCard?.type ?? 'DEBIT');
  const [creditLimit, setCreditLimit] = useState(
    initialCard?.creditLimit != null
      ? Math.floor(Math.abs(Number(initialCard.creditLimit)) * 100).toString()
      : '0',
  );
  const [cardColor, setCardColor] = useState(initialCard?.color ?? '#6366f1');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [accountsList, setAccountsList] = useState<Account[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (initialTab === 'account') {
      setAccountName(initialAccount?.name ?? '');
      setAccountType(initialAccount?.type ?? 'CHECKING');
      setBalance(
        initialAccount
          ? Math.floor(Math.abs(Number(initialAccount.balance)) * 100).toString()
          : '0',
      );
      setAccountColor(initialAccount?.color ?? '#6366f1');
    } else {
      setCardAccountId(initialCard?.accountId ?? preselectedAccountId ?? '');
      setCardName(initialCard?.name ?? '');
      setCardType(initialCard?.type ?? 'DEBIT');
      setCreditLimit(
        initialCard?.creditLimit != null
          ? Math.floor(Math.abs(Number(initialCard.creditLimit)) * 100).toString()
          : '0',
      );
      setCardColor(initialCard?.color ?? '#6366f1');
    }
  }, [isOpen, initialTab, initialAccount, initialCard, preselectedAccountId]);

  // Fetch accounts for card dropdown
  useEffect(() => {
    if (!isOpen) return;
    api
      .get<Account[]>('/accounts')
      .then((data) => setAccountsList(Array.isArray(data) ? data : []));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBalance(e.target.value.replace(/\D/g, ''));
  };
  const handleCreditLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreditLimit(e.target.value.replace(/\D/g, ''));
  };

  const formattedBalance = (Number(balance) / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  const formattedCreditLimit = (Number(creditLimit) / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const submitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        name: accountName,
        type: accountType,
        balance: Number(balance) / 100,
        color: accountColor,
        icon:
          {
            CHECKING: 'Building',
            SAVINGS: 'PiggyBank',
            CASH: 'Banknote',
            WALLET: 'Wallet',
            INVESTMENT: 'Wallet',
          }[accountType] ?? 'Wallet',
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

  const submitCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardAccountId) {
      setError('Selecione uma conta para vincular o cartão.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        accountId: cardAccountId,
        name: cardName,
        type: cardType,
        color: cardColor,
        ...(cardType === 'CREDIT' && { creditLimit: Number(creditLimit) / 100 }),
      };
      if (mode === 'edit' && initialCard) {
        await api.patch(`/cards/${initialCard.id}`, payload);
      } else {
        await api.post('/cards', payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar cartão.');
    } finally {
      setIsLoading(false);
    }
  };

  const bankAccounts = accountsList.filter((a) =>
    ['CHECKING', 'SAVINGS', 'CASH', 'WALLET', 'INVESTMENT'].includes(a.type),
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl shadow-primary/5 p-8 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold font-display tracking-tight">
              {variant === 'account'
                ? mode === 'edit'
                  ? 'Editar Conta'
                  : 'Nova Conta'
                : mode === 'edit'
                  ? 'Editar Cartão'
                  : 'Novo Cartão'}
            </h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
              {variant === 'account'
                ? 'Conta bancária, carteira ou investimento'
                : 'Cartão de crédito ou débito vinculado a uma conta'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted transition-smooth text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {variant === 'account' ? (
          <form className="flex flex-col gap-5" onSubmit={submitAccount}>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Nome da Conta
                </label>
                <input
                  required
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Ex: Nubank, Itaú, Carteira"
                  className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Tipo de Conta
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ACCOUNT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setAccountType(t.value)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-smooth text-left ${
                        accountType === t.value
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-muted/20 border-border hover:border-muted-foreground/30'
                      }`}
                    >
                      <t.icon className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-bold truncate">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Saldo Inicial
                </label>
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  value={formattedBalance}
                  onChange={handleBalanceChange}
                  className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Cor
                </label>
                <div className="relative">
                  <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="color"
                    value={accountColor}
                    onChange={(e) => setAccountColor(e.target.value)}
                    className="w-full h-[42px] bg-muted/40 border border-border rounded-xl pl-10 pr-4 py-1.5 cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
            </div>
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium">
                {error}
              </div>
            )}
            <div className="flex gap-3 pt-1">
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
                className="flex-[2] flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-60 transition-smooth"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Conta'}
              </button>
            </div>
          </form>
        ) : (
          <form className="flex flex-col gap-5" onSubmit={submitCard}>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Conta vinculada
                </label>
                <select
                  required
                  value={cardAccountId}
                  onChange={(e) => setCardAccountId(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                >
                  <option value="">Selecione a conta</option>
                  {bankAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Nome do Cartão
                </label>
                <input
                  required
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Ex: Nubank Gold, Itaú Débito"
                  className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Tipo de Cartão
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CARD_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setCardType(t.value as 'CREDIT' | 'DEBIT')}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-smooth text-left ${
                        cardType === t.value
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-muted/20 border-border hover:border-muted-foreground/30'
                      }`}
                    >
                      <t.icon className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-bold">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {cardType === 'CREDIT' && (
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                    Limite de Crédito
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formattedCreditLimit}
                    onChange={handleCreditLimitChange}
                    className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
                  />
                </div>
              )}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Cor
                </label>
                <div className="relative">
                  <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="color"
                    value={cardColor}
                    onChange={(e) => setCardColor(e.target.value)}
                    className="w-full h-[42px] bg-muted/40 border border-border rounded-xl pl-10 pr-4 py-1.5 cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
            </div>
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium">
                {error}
              </div>
            )}
            <div className="flex gap-3 pt-1">
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
                className="flex-[2] flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-60 transition-smooth"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Cartão'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
