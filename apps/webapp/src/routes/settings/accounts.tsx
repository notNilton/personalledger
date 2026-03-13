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
  Banknote,
  ArrowRight,
  Edit2,
  Trash2,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { api } from '../../lib/api';
import { AccountModal } from '../../components/AccountModal';

export const Route = createFileRoute('/settings/accounts')({
  component: AccountsPage,
});

interface Account {
  id: string;
  name: string;
  balance: number | string;
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'CASH' | 'WALLET' | 'INVESTMENT';
  color: string;
  icon: string;
}

const TYPE_LABELS: Record<string, string> = {
  CHECKING: 'Corrente',
  SAVINGS: 'Poupança',
  CREDIT_CARD: 'Cartão',
  CASH: 'Dinheiro',
  WALLET: 'Carteira',
  INVESTMENT: 'Investimento',
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
  onEdit,
  onDelete,
}: {
  account: Account;
  onEdit: (a: Account) => void;
  onDelete: (id: string) => void;
}) {
  const Icon = ICON_MAP[account.icon] || Wallet;
  const balanceValue = Number(account.balance);

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
                onClick={() => onEdit(account)}
                className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-smooth"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(account.id)}
                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-smooth"
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
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-smooth translate-y-1 group-hover:translate-y-0 text-right justify-end mt-auto">
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
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => api.get<Account[]>('/accounts'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/accounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  const netWorth = accounts.reduce((acc, accnt) => acc + Number(accnt.balance), 0);
  const assets = accounts
    .filter((a) => Number(a.balance) > 0)
    .reduce((acc, accnt) => acc + Number(accnt.balance), 0);
  const liabilities = Math.abs(
    accounts
      .filter((a) => Number(a.balance) < 0)
      .reduce((acc, accnt) => acc + Number(accnt.balance), 0),
  );

  const handleAdd = () => {
    setModalMode('create');
    setSelectedAccount(null);
    setIsModalOpen(true);
  };

  const handleEdit = (account: Account) => {
    setModalMode('edit');
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (
      confirm(
        'Tem certeza que deseja excluir esta conta? Todas as transações vinculadas serão mantidas, mas a conta não aparecerá mais.',
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Suas Contas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas carteiras, contas bancárias e investimentos.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-smooth"
        >
          <Plus className="w-4 h-4" />
          Adicionar Conta
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Carregando suas contas...</p>
        </div>
      ) : (
        <>
          {/* Net Worth Summary */}
          <div className="bg-muted/30 rounded-2xl p-8 border border-border flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="relative">
              <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest mb-1.5">
                Patrimônio Líquido
              </p>
              <PrivacyAmount
                value={netWorth}
                className="text-4xl font-bold font-display tracking-tight block"
              />
            </div>
            <div className="flex gap-8 relative">
              <div className="text-left px-4">
                <p className="text-muted-foreground text-[10px] font-bold uppercase mb-1">Ativos</p>
                <PrivacyAmount
                  value={assets}
                  className="text-emerald-600 font-bold text-lg block"
                />
              </div>
              <div className="text-left px-4 border-l border-border">
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

          {/* Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}

      <AccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['accounts'] })}
        mode={modalMode}
        initialData={selectedAccount}
      />
    </div>
  );
}
