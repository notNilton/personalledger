import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PrivacyAmount from '../components/PrivacyAmount';
import { TransactionModal } from '../components/TransactionModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ImportModal } from '../components/ImportModal';
import { api } from '../lib/api';
import {
  Plus,
  FileUp,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Tag,
  CreditCard,
  Edit2,
  Trash2,
  Loader2,
} from 'lucide-react';
import {
  type Tx,
  type TxCategory,
  formatMonthLabelPtBr,
  monthKey,
  currentMonthKey,
  startOfPreviousMonthLocal,
  startOfMonthLocal,
  sumExpenses,
  sumIncome,
  useFutureTransactions,
  useTransactionsList,
} from './transactions.queries';

export const Route = createFileRoute('/transactions')({
  component: TransactionsPage,
});

function TransactionsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'INCOME' | 'EXPENSE'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [tab, setTab] = useState<'current' | 'past' | 'future'>('current');
  const [futureMonth, setFutureMonth] = useState<string>('');
  const [pastMonth, setPastMonth] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingTransaction, setEditingTransaction] = useState<Tx | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Record<string, true>>({});
  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);

  const monthStart = startOfMonthLocal();
  const prevMonthStart = startOfPreviousMonthLocal();
  const { data: transactions = [], isLoading } = useTransactionsList({
    search,
    filterType,
    selectedCategory,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<TxCategory[]>('/categories'),
    staleTime: 1000 * 60 * 5,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () =>
      api.get<
        Array<{
          id: string;
          name: string;
          cards?: Array<{ id: string; accountId: string; name: string; type: 'CREDIT' | 'DEBIT' }>;
        }>
      >('/accounts'),
    staleTime: 1000 * 60 * 5,
  });

  const handleImported = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['transactions-future'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => api.delete(`/transactions/${id}`)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-future'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleCreate = () => {
    setModalMode('create');
    setEditingTransaction(null);
    setIsModalOpen(true);
  };
  const handleEdit = (t: Tx) => {
    setModalMode('edit');
    setEditingTransaction(t);
    setIsModalOpen(true);
  };
  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
    setConfirmDeleteOpen(true);
  };
  const handleDeleteRow = (t: Tx) => {
    if (tab === 'future' && (t.isVirtual || t.id.startsWith('recurring:'))) {
      alert(
        'Esta é uma transação futura gerada por recorrência. Para parar, edite a transação base e desative a recorrência.',
      );
      return;
    }
    handleDelete(t.id);
  };
  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const thisMonthKey = currentMonthKey();
  const currentTransactions = transactions.filter((t) => t.date.slice(0, 7) === thisMonthKey);
  const totalSpentMonth = sumExpenses(currentTransactions);
  const totalIncomeMonth = sumIncome(currentTransactions);

  const pastMonthOptions = Array.from(
    new Set(transactions.filter((t) => new Date(t.date) < monthStart).map((t) => monthKey(t.date))),
  )
    .sort()
    .reverse();

  if (tab === 'past' && pastMonthOptions.length > 0 && !pastMonth)
    setPastMonth(pastMonthOptions[0]);
  if (tab === 'past' && pastMonth && !pastMonthOptions.includes(pastMonth))
    setPastMonth(pastMonthOptions[0] ?? '');

  const pastTransactions =
    tab === 'past' && pastMonth
      ? transactions.filter((t) => monthKey(t.date) === pastMonth)
      : transactions.filter((t) => {
          const d = new Date(t.date);
          return d >= prevMonthStart && d < monthStart;
        });

  const { data: futureTransactions = [] } = useFutureTransactions({
    enabled: tab === 'future',
    search,
    filterType,
    selectedCategory,
  });

  const futureMonthOptions = Array.from(
    new Set(futureTransactions.map((t) => monthKey(t.date))),
  ).sort();

  if (tab === 'future' && futureMonthOptions.length > 0 && !futureMonth)
    setFutureMonth(futureMonthOptions[0]);
  if (tab === 'future' && futureMonth && !futureMonthOptions.includes(futureMonth))
    setFutureMonth(futureMonthOptions[0] ?? '');

  const futureTransactionsFiltered =
    tab === 'future' && futureMonth
      ? futureTransactions.filter((t) => monthKey(t.date) === futureMonth)
      : futureTransactions;

  const tableTransactions =
    tab === 'future'
      ? futureTransactionsFiltered
      : tab === 'past'
        ? pastTransactions
        : currentTransactions;

  const totalFutureSpent = sumExpenses(futureTransactionsFiltered);
  const totalFutureIncome = sumIncome(futureTransactionsFiltered);
  const totalPastSpent = sumExpenses(pastTransactions);
  const totalPastIncome = sumIncome(pastTransactions);

  const isDeletableRow = (t: Tx) =>
    !(tab === 'future' && (t.isVirtual || t.id.startsWith('recurring:')));
  const truncate = (s: string, max: number) => {
    const str = (s ?? '').trim();
    return str.length <= max ? str : str.slice(0, max - 1).trimEnd() + '…';
  };

  const selectedList = Object.keys(selectedIds);
  const selectedDeletable = tableTransactions.filter((t) => selectedIds[t.id] && isDeletableRow(t));
  const selectedNonDeletable = tableTransactions.filter(
    (t) => selectedIds[t.id] && !isDeletableRow(t),
  );
  const allDeletableIds = tableTransactions.filter(isDeletableRow).map((t) => t.id);
  const isAllSelected =
    allDeletableIds.length > 0 && allDeletableIds.every((id) => selectedIds[id]);
  const isSomeSelected = allDeletableIds.some((id) => selectedIds[id]);

  const summaryExpenses =
    tab === 'future' ? totalFutureSpent : tab === 'past' ? totalPastSpent : totalSpentMonth;
  const summaryIncome =
    tab === 'future' ? totalFutureIncome : tab === 'past' ? totalPastIncome : totalIncomeMonth;

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6">
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        title="Excluir transação"
        description="Esta ação não pode ser desfeita. Se for parcelada, as parcelas futuras também podem ser removidas."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onCancel={() => {
          if (deleteMutation.isPending) return;
          setConfirmDeleteOpen(false);
          setConfirmDeleteId(null);
        }}
        onConfirm={async () => {
          if (!confirmDeleteId) return;
          await deleteMutation.mutateAsync(confirmDeleteId);
          setConfirmDeleteOpen(false);
          setConfirmDeleteId(null);
        }}
      />
      <ConfirmDialog
        isOpen={confirmBulkDeleteOpen}
        title={`Excluir ${selectedDeletable.length} transação(ões)`}
        description={
          selectedNonDeletable.length > 0
            ? `Transações futuras por recorrência serão ignoradas (${selectedNonDeletable.length}).`
            : 'Esta ação não pode ser desfeita.'
        }
        confirmText="Excluir selecionadas"
        cancelText="Cancelar"
        variant="danger"
        isLoading={bulkDeleteMutation.isPending}
        onCancel={() => {
          if (bulkDeleteMutation.isPending) return;
          setConfirmBulkDeleteOpen(false);
        }}
        onConfirm={async () => {
          const ids = selectedDeletable.map((t) => t.id);
          if (ids.length === 0) {
            setConfirmBulkDeleteOpen(false);
            return;
          }
          await bulkDeleteMutation.mutateAsync(ids);
          setSelectedIds({});
          setConfirmBulkDeleteOpen(false);
        }}
      />
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        accounts={accounts}
        onImported={handleImported}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Transações</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Histórico completo e importação de extratos.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-smooth"
          >
            <FileUp className="w-3.5 h-3.5" />
            Importar
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-smooth"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Transação
          </button>
        </div>
      </div>

      {/* Resumo + Tabs numa linha */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 bg-muted/30 rounded-xl border border-border">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Despesas
            </p>
            <PrivacyAmount
              value={-summaryExpenses}
              className="text-2xl font-bold font-display tracking-tight block text-rose-500"
            />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Receitas
            </p>
            <PrivacyAmount
              value={summaryIncome}
              className="text-2xl font-bold font-display tracking-tight block text-emerald-500"
            />
          </div>
          <div className="pl-6 border-l border-border">
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Saldo
            </p>
            <PrivacyAmount
              value={summaryIncome - summaryExpenses}
              showSign
              className={`text-2xl font-bold font-display tracking-tight block ${summaryIncome - summaryExpenses >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Seletor de mês (future/past) */}
          {tab === 'future' && futureMonthOptions.length > 0 && (
            <select
              value={futureMonth}
              onChange={(e) => setFutureMonth(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-bold outline-none cursor-pointer"
            >
              {futureMonthOptions.map((key) => (
                <option key={key} value={key}>
                  {formatMonthLabelPtBr(key)}
                </option>
              ))}
            </select>
          )}
          {tab === 'past' && pastMonthOptions.length > 0 && (
            <select
              value={pastMonth}
              onChange={(e) => setPastMonth(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-bold outline-none cursor-pointer"
            >
              {pastMonthOptions.map((key) => (
                <option key={key} value={key}>
                  {formatMonthLabelPtBr(key)}
                </option>
              ))}
            </select>
          )}

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {(
              [
                { key: 'current', label: 'Atual' },
                { key: 'past', label: 'Passado' },
                { key: 'future', label: 'Futuro' },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md uppercase tracking-wider transition-smooth ${
                  tab === t.key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted-foreground/5'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-xs focus:ring-2 focus:ring-primary/20 outline-none w-[200px]"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'INCOME' | 'EXPENSE')}
            className="px-3 py-2 bg-card border border-border rounded-lg text-xs font-medium hover:bg-muted transition-smooth outline-none cursor-pointer"
          >
            <option value="all">Todos os tipos</option>
            <option value="INCOME">Entradas</option>
            <option value="EXPENSE">Saídas</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-xs font-medium hover:bg-muted transition-smooth outline-none cursor-pointer"
          >
            <option value="all">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.description ?? cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {selectedList.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedIds({})}
              className="text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              Limpar seleção
            </button>
          )}
          <button
            type="button"
            onClick={() => setConfirmBulkDeleteOpen(true)}
            disabled={selectedDeletable.length === 0 || bulkDeleteMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-smooth disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Excluir ({selectedDeletable.length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card-premium overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-3 py-2.5 w-[36px]">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = !isAllSelected && isSomeSelected;
                  }}
                  onChange={(e) => {
                    if (!e.target.checked) {
                      setSelectedIds({});
                      return;
                    }
                    const next: Record<string, true> = {};
                    for (const id of allDeletableIds) next[id] = true;
                    setSelectedIds(next);
                  }}
                  className="h-3.5 w-3.5 accent-primary cursor-pointer"
                />
              </th>
              {['Data', 'Descrição', 'Categoria', 'Conta', 'Valor'].map((h, i) => (
                <th
                  key={h}
                  className={`px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground ${i === 4 ? 'text-right' : ''}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground">Carregando...</p>
                  </div>
                </td>
              </tr>
            ) : tableTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center">
                  <p className="text-xs text-muted-foreground">
                    {tab === 'future'
                      ? 'Nenhuma transação futura.'
                      : 'Nenhuma transação encontrada.'}
                  </p>
                  {tab === 'current' && (
                    <button
                      onClick={handleCreate}
                      className="mt-2 text-xs font-bold text-primary hover:underline"
                    >
                      + Adicionar a primeira transação
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              tableTransactions.map((t) => {
                const isIncome = t.type === 'INCOME';
                const value = Math.abs(Number(t.amount));
                return (
                  <tr
                    key={t.id}
                    className="hover:bg-muted/20 transition-smooth group cursor-pointer"
                  >
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={!!selectedIds[t.id]}
                        disabled={!isDeletableRow(t)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          setSelectedIds((prev) => {
                            const next = { ...prev };
                            if (e.target.checked) next[t.id] = true;
                            else delete next[t.id];
                            return next;
                          });
                        }}
                        className="h-3.5 w-3.5 accent-primary cursor-pointer disabled:opacity-40"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        timeZone: 'UTC',
                      })}
                    </td>
                    <td className="px-3 py-2.5 text-sm font-medium" title={t.description}>
                      {truncate(t.description ?? '', 45)}
                    </td>
                    <td className="px-3 py-2.5">
                      {t.category ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/10">
                          <Tag className="w-2.5 h-2.5" />
                          {t.category.name}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CreditCard className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[100px]">{t.account?.name ?? '—'}</span>
                      </div>
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        {t.card ? (
                          <span
                            className="inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border"
                            style={{
                              backgroundColor: `${t.card.color ?? '#64748B'}15`,
                              borderColor: `${t.card.color ?? '#64748B'}35`,
                              color: t.card.color ?? '#64748B',
                            }}
                          >
                            {t.card.type === 'CREDIT' ? 'crédito' : 'débito'}
                          </span>
                        ) : (
                          <>
                            <span
                              className="inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border"
                              style={{
                                backgroundColor: '#64748B15',
                                borderColor: '#64748B35',
                                color: '#64748B',
                              }}
                            >
                              {t.channel === 'PIX'
                                ? 'pix'
                                : t.channel === 'CARD_DEBIT'
                                  ? 'débito'
                                  : t.channel === 'CARD_CREDIT'
                                    ? 'crédito'
                                    : 'bancária'}
                            </span>
                            {t.classification === 'TRANSFER' && (
                              <span
                                className="inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border"
                                style={{
                                  backgroundColor: '#F59E0B15',
                                  borderColor: '#F59E0B35',
                                  color: '#F59E0B',
                                }}
                              >
                                fatura
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td
                      className={`px-3 py-2.5 text-right font-bold text-sm ${isIncome ? 'text-emerald-500' : 'text-foreground'}`}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-smooth">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(t);
                            }}
                            className="p-1 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-smooth"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRow(t);
                            }}
                            disabled={deleteMutation.isPending}
                            className="p-1 rounded-md hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-smooth disabled:opacity-40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center">
                          {isIncome ? (
                            <ArrowUpRight className="inline w-3 h-3 mr-0.5" />
                          ) : (
                            <ArrowDownLeft className="inline w-3 h-3 mr-0.5" />
                          )}
                          <PrivacyAmount value={value} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <TransactionModal
        key={editingTransaction?.id ?? 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        mode={modalMode}
        initialData={editingTransaction}
      />
    </div>
  );
}
