import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PrivacyAmount from '../../components/PrivacyAmount';
import {
  Plus,
  Wallet,
  Building,
  PiggyBank,
  CreditCard,
  CreditCard as CreditCardIcon,
  Banknote,
  ArrowRight,
  Edit2,
  Trash2,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { api } from '../../lib/api';
import { AccountModal, type AccountModalTab } from '../../components/AccountModal';

export const Route = createFileRoute('/settings/accounts')({
  component: AccountsPage,
});

interface Card {
  id: string;
  accountId: string;
  name: string;
  type: 'CREDIT' | 'DEBIT';
  creditLimit?: number | string | null;
  color?: string | null;
}

interface Account {
  id: string;
  name: string;
  balance: number | string;
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'CASH' | 'WALLET' | 'INVESTMENT';
  color: string;
  icon: string;
  cards?: Card[];
}

const TYPE_LABELS: Record<string, string> = {
  CHECKING: 'Corrente',
  SAVINGS: 'Poupança',
  CREDIT_CARD: 'Cartão',
  CASH: 'Dinheiro',
  WALLET: 'Carteira',
  INVESTMENT: 'Investimento',
};

const CARD_TYPE_LABELS: Record<string, string> = {
  CREDIT: 'Crédito',
  DEBIT: 'Débito',
};

const ICON_MAP: Record<string, LucideIcon> = {
  Wallet,
  Building,
  PiggyBank,
  CreditCard,
  Banknote,
};

function AccountCard({
  account,
  onEditAccount,
  onDeleteAccount,
  onAddCard,
  onEditCard,
  onDeleteCard,
}: {
  account: Account;
  onEditAccount: (a: Account) => void;
  onDeleteAccount: (id: string) => void;
  onAddCard: (accountId: string) => void;
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardId: string) => void;
}) {
  const Icon = ICON_MAP[account.icon] || Wallet;
  const balanceValue = Number(account.balance);
  const cards = account.cards ?? [];

  return (
    <div className="card-premium p-6 group relative overflow-hidden h-full flex flex-col">
      <div className="relative flex flex-col gap-5 flex-1">
        <div className="flex items-center justify-between">
          <div
            className="p-2.5 rounded-xl border"
            style={{
              backgroundColor: `${account.color}15`,
              color: account.color,
              borderColor: `${account.color}30`,
            }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/50 px-2 py-1 rounded">
              {TYPE_LABELS[account.type] || account.type}
            </span>
            <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-smooth">
              <button
                onClick={() => onEditAccount(account)}
                className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-smooth"
                title="Editar conta"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeleteAccount(account.id)}
                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-smooth"
                title="Excluir conta"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-muted-foreground text-xs font-medium">{account.name}</h3>
          <p className="text-2xl font-bold font-display mt-0.5 tracking-tight">
            <PrivacyAmount value={balanceValue} />
          </p>
        </div>

        {/* Cartões vinculados */}
        <div className="mt-auto pt-4 border-t border-border/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Cartões
            </span>
            <button
              type="button"
              onClick={() => onAddCard(account.id)}
              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Adicionar
            </button>
          </div>
          {cards.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic">Nenhum cartão vinculado</p>
          ) : (
            <ul className="space-y-1.5">
              {cards.map((card) => (
                <li
                  key={card.id}
                  className="flex items-center justify-between gap-2 py-2 px-3 rounded-xl bg-muted/30 border border-border/50 group/card"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="p-1.5 rounded-lg shrink-0"
                      style={{
                        backgroundColor: (card.color ?? account.color) + '20',
                        color: card.color ?? account.color,
                      }}
                    >
                      <CreditCardIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{card.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {CARD_TYPE_LABELS[card.type]}
                        {card.type === 'CREDIT' && card.creditLimit != null && (
                          <>
                            {' '}
                            · Limite{' '}
                            <PrivacyAmount value={Number(card.creditLimit)} className="inline" />
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover/card:opacity-100 transition-smooth shrink-0">
                    <button
                      onClick={() => onEditCard(card)}
                      className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-smooth"
                      title="Editar cartão"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteCard(card.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-smooth"
                      title="Excluir cartão"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-smooth translate-y-1 group-hover:translate-y-0 text-right justify-end">
          <span>Detalhes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

function AccountsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<AccountModalTab>('account');
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [preselectedAccountId, setPreselectedAccountId] = useState<string | null>(null);

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => api.get<Account[]>('/accounts'),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/accounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/cards/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  // Contas: saldos
  const totalBalance = accounts.reduce((acc, a) => acc + Number(a.balance), 0);
  const assets = accounts
    .filter((a) => Number(a.balance) > 0)
    .reduce((acc, a) => acc + Number(a.balance), 0);
  const liabilities = Math.abs(
    accounts.filter((a) => Number(a.balance) < 0).reduce((acc, a) => acc + Number(a.balance), 0),
  );

  // Cartões de crédito: limite total, usado e disponível
  const allCards = accounts.flatMap((a) => a.cards ?? []);
  const creditCards = allCards.filter((c) => c.type === 'CREDIT');
  const totalCreditLimit = creditCards.reduce(
    (acc, c) => acc + Math.max(0, Number(c.creditLimit ?? 0)),
    0,
  );
  const creditUsed = 0; // TODO: quando houver saldo de fatura por cartão, somar aqui
  const availableCredit = Math.max(0, totalCreditLimit - creditUsed);

  // Patrimônio líquido = ativos - passivos (contas) - dívida em cartões
  const netWorth = totalBalance - creditUsed;

  const openAddAccount = () => {
    setModalTab('account');
    setModalMode('create');
    setSelectedAccount(null);
    setSelectedCard(null);
    setPreselectedAccountId(null);
    setIsModalOpen(true);
  };

  const openAddCard = (accountId?: string) => {
    setModalTab('card');
    setModalMode('create');
    setSelectedAccount(null);
    setSelectedCard(null);
    setPreselectedAccountId(accountId ?? null);
    setIsModalOpen(true);
  };

  const openEditAccount = (account: Account) => {
    setModalTab('account');
    setModalMode('edit');
    setSelectedAccount(account);
    setSelectedCard(null);
    setPreselectedAccountId(null);
    setIsModalOpen(true);
  };

  const openEditCard = (card: Card) => {
    setModalTab('card');
    setModalMode('edit');
    setSelectedAccount(null);
    setSelectedCard(card);
    setPreselectedAccountId(null);
    setIsModalOpen(true);
  };

  const handleDeleteAccount = (id: string) => {
    if (
      confirm(
        'Tem certeza que deseja excluir esta conta? Todas as transações vinculadas serão mantidas, mas a conta não aparecerá mais.',
      )
    ) {
      deleteAccountMutation.mutate(id);
    }
  };

  const handleDeleteCard = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cartão?')) {
      deleteCardMutation.mutate(id);
    }
  };

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['accounts'] });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Suas Contas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas carteiras, contas bancárias, cartões e investimentos.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openAddCard}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border font-semibold hover:bg-muted/50 transition-smooth"
          >
            <CreditCardIcon className="w-4 h-4" />
            Adicionar Cartão
          </button>
          <button
            onClick={openAddAccount}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-smooth"
          >
            <Plus className="w-4 h-4" />
            Adicionar Conta
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Carregando suas contas...</p>
        </div>
      ) : (
        <>
          {/* Resumo financeiro: patrimônio, contas e cartões */}
          <div className="bg-muted/30 rounded-2xl p-8 border border-border flex flex-col gap-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest mb-1.5">
                  Patrimônio Líquido
                </p>
                <PrivacyAmount
                  value={netWorth}
                  className="text-4xl font-bold font-display tracking-tight block"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Contas − dívida em cartões</p>
              </div>
              <div className="flex flex-wrap gap-6 md:gap-8">
                <div className="text-left">
                  <p className="text-muted-foreground text-[10px] font-bold uppercase mb-1">
                    Ativos
                  </p>
                  <PrivacyAmount
                    value={assets}
                    className="text-emerald-600 font-bold text-lg block"
                  />
                </div>
                <div className="text-left md:border-l md:border-border md:pl-8">
                  <p className="text-muted-foreground text-[10px] font-bold uppercase mb-1">
                    Passivos
                  </p>
                  <PrivacyAmount
                    value={liabilities}
                    className="text-rose-600 font-bold text-lg block"
                  />
                </div>
              </div>
            </div>

            {creditCards.length > 0 && (
              <div className="pt-6 border-t border-border">
                <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest mb-3">
                  Cartões de Crédito
                </p>
                <div className="flex flex-wrap gap-6 md:gap-10">
                  <div>
                    <p className="text-muted-foreground text-[10px] font-bold uppercase mb-1">
                      Limite total
                    </p>
                    <PrivacyAmount
                      value={totalCreditLimit}
                      className="text-foreground font-bold text-lg block"
                    />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] font-bold uppercase mb-1">
                      Limite usado
                    </p>
                    <PrivacyAmount
                      value={creditUsed}
                      className="text-rose-600 font-bold text-lg block"
                    />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] font-bold uppercase mb-1">
                      Limite disponível
                    </p>
                    <PrivacyAmount
                      value={availableCredit}
                      className="text-emerald-600 font-bold text-lg block"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onEditAccount={openEditAccount}
                onDeleteAccount={handleDeleteAccount}
                onAddCard={openAddCard}
                onEditCard={openEditCard}
                onDeleteCard={handleDeleteCard}
              />
            ))}
          </div>
        </>
      )}

      <AccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        activeTab={modalTab}
        mode={modalMode}
        initialAccount={selectedAccount}
        initialCard={selectedCard}
        preselectedAccountId={preselectedAccountId}
      />
    </div>
  );
}
