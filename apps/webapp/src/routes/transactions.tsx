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
  Calendar,
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
  startOfPreviousMonthLocal,
  startOfMonthLocal,
  splitByToday,
  sumExpenses,
  useFutureTransactions,
  useMonthExpenses,
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
  const [futureMonth, setFutureMonth] = useState<string>(''); // YYYY-MM
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
  const { data: monthExpenses = [] } = useMonthExpenses();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<TxCategory[]>('/categories'),
    staleTime: 1000 * 60 * 5, // 5 min — categorias mudam raramente
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
    queryClient.invalidateQueries({ queryKey: ['transactions-month-expenses'] });
    queryClient.invalidateQueries({ queryKey: ['transactions-future'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  // Delete mutation
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
      queryClient.invalidateQueries({ queryKey: ['transactions-month-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-future'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleCreate = () => {
    setModalMode('create');
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEdit = (transaction: Tx) => {
    setModalMode('edit');
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
    setConfirmDeleteOpen(true);
  };

  const handleDeleteRow = (t: Tx) => {
    if (tab === 'future' && (t.isVirtual || t.id.startsWith('recurring:'))) {
      alert(
        'Esta é uma transação futura gerada por recorrência e não existe no banco para excluir. Para parar essas futuras, edite a transação base e desative a recorrência.',
      );
      return;
    }
    handleDelete(t.id);
  };

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['transactions-month-expenses'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const totalSpentMonth = sumExpenses(monthExpenses);
  const monthLabel = new Date().toLocaleString('pt-BR', { month: 'long' });

  const { current: currentTransactions } = splitByToday(transactions);
  const pastTransactions = transactions.filter((t) => {
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

  // Ajusta mês selecionado quando muda a lista (ex.: filtros/search)
  if (tab === 'future' && futureMonthOptions.length > 0 && !futureMonth) {
    // primeiro mês disponível
    setFutureMonth(futureMonthOptions[0]);
  }
  if (tab === 'future' && futureMonth && !futureMonthOptions.includes(futureMonth)) {
    setFutureMonth(futureMonthOptions[0] ?? '');
  }

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
  const totalPastSpent = sumExpenses(pastTransactions);

  const isDeletableRow = (t: Tx) =>
    !(tab === 'future' && (t.isVirtual || t.id.startsWith('recurring:')));

  const truncate = (s: string, max: number) => {
    const str = (s ?? '').trim();
    if (str.length <= max) return str;
    return str.slice(0, Math.max(0, max - 1)).trimEnd() + '…';
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

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        title="Excluir transação"
        description="Esta ação não pode ser desfeita. Se a transação for parcelada, as parcelas futuras relacionadas também podem ser removidas."
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
            ? `As transações futuras geradas por recorrência não podem ser excluídas (${selectedNonDeletable.length} selecionada(s) serão ignoradas).`
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
          <h1 className="text-3xl font-display font-bold">Transações</h1>
          <p className="text-muted-foreground mt-1">Histórico completo e importação de extratos.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border font-semibold hover:bg-muted transition-smooth"
          >
            <FileUp className="w-4 h-4" />
            Importar CSV
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-smooth"
          >
            <Plus className="w-4 h-4" />
            Novo Lançamento
          </button>
        </div>
      </div>

      {/* Resumo (mês atual ou futuro) */}
      <div className="card-premium p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {tab === 'future'
                ? 'Total gasto futuro'
                : tab === 'past'
                  ? 'Total gasto no mês passado'
                  : 'Total gasto no mês'}
            </p>

            {tab === 'future' && (
              <div className="w-full sm:w-auto">
                <div className="flex items-center justify-center sm:justify-end">
                  <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-2xl px-3 py-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Mês
                    </span>
                    <div className="w-[1px] h-4 bg-border" />
                    <select
                      value={futureMonth}
                      onChange={(e) => setFutureMonth(e.target.value)}
                      className="bg-transparent outline-none cursor-pointer text-sm font-semibold min-w-[170px] text-center sm:text-right"
                    >
                      {futureMonthOptions.length === 0 ? (
                        <option value="">Sem transações</option>
                      ) : (
                        futureMonthOptions.map((key) => (
                          <option key={key} value={key}>
                            {formatMonthLabelPtBr(key)}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-1">
            {tab === 'future'
              ? futureMonth
                ? `Total previsto para ${formatMonthLabelPtBr(futureMonth)}`
                : 'Somente despesas com data após hoje'
              : tab === 'past'
                ? `De ${prevMonthStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} até ${new Date(monthStart.getTime() - 1).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`
                : `De ${monthStart.getDate()} ${monthLabel} até hoje`}
          </p>
        </div>

        <PrivacyAmount
          value={
            tab === 'future'
              ? -totalFutureSpent
              : tab === 'past'
                ? -totalPastSpent
                : -totalSpentMonth
          }
          className={`text-2xl font-bold font-display ${tab === 'future' ? 'text-rose-500' : ''}`}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-2xl w-fit border border-border">
        <button
          type="button"
          onClick={() => setTab('current')}
          className={`px-4 py-2 text-xs font-bold rounded-xl uppercase tracking-wider transition-smooth ${
            tab === 'current'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Transações atuais
        </button>
        <button
          type="button"
          onClick={() => setTab('past')}
          className={`px-4 py-2 text-xs font-bold rounded-xl uppercase tracking-wider transition-smooth ${
            tab === 'past'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Transações passadas
        </button>
        <button
          type="button"
          onClick={() => setTab('future')}
          className={`px-4 py-2 text-xs font-bold rounded-xl uppercase tracking-wider transition-smooth ${
            tab === 'future'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Transações futuras
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none w-[240px]"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'INCOME' | 'EXPENSE')}
            className="px-3 py-2 bg-card border border-border rounded-xl text-sm font-medium hover:bg-muted transition-smooth outline-none cursor-pointer"
          >
            <option value="all">Todos os Tipos</option>
            <option value="INCOME">Entradas</option>
            <option value="EXPENSE">Saídas</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-card border border-border rounded-xl text-sm font-medium hover:bg-muted transition-smooth outline-none cursor-pointer"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {selectedList.length > 0 ? (
            <button
              type="button"
              onClick={() => setSelectedIds({})}
              className="text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              Limpar seleção
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setConfirmBulkDeleteOpen(true)}
            disabled={selectedDeletable.length === 0 || bulkDeleteMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-border font-semibold hover:bg-muted transition-smooth disabled:opacity-50"
            title={
              selectedDeletable.length === 0
                ? 'Selecione transações para excluir'
                : 'Excluir transações selecionadas'
            }
          >
            <Trash2 className="w-4 h-4" />
            Excluir ({selectedDeletable.length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card-premium overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-4 py-3 w-[44px]">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = !isAllSelected && isSomeSelected;
                  }}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (!checked) {
                      setSelectedIds({});
                      return;
                    }
                    const next: Record<string, true> = {};
                    for (const id of allDeletableIds) next[id] = true;
                    setSelectedIds(next);
                  }}
                  className="h-4 w-4 accent-primary cursor-pointer"
                  title="Selecionar todas"
                />
              </th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Data
              </th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Descrição
              </th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Categoria
              </th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Conta
              </th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-right">
                Valor
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-7 h-7 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Carregando transações...</p>
                  </div>
                </td>
              </tr>
            ) : tableTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <p className="text-sm text-muted-foreground">
                    {tab === 'future'
                      ? 'Nenhuma transação futura encontrada.'
                      : 'Nenhuma transação encontrada.'}
                  </p>
                  {tab === 'current' && (
                    <button
                      onClick={handleCreate}
                      className="mt-3 text-xs font-bold text-primary hover:underline"
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
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={!!selectedIds[t.id]}
                        disabled={!isDeletableRow(t)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectedIds((prev) => {
                            const next = { ...prev };
                            if (checked) next[t.id] = true;
                            else delete next[t.id];
                            return next;
                          });
                        }}
                        className="h-4 w-4 accent-primary cursor-pointer disabled:opacity-40"
                        title={
                          isDeletableRow(t)
                            ? 'Selecionar'
                            : 'Transação virtual (recorrência) não pode ser excluída'
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        {new Date(t.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          timeZone: 'UTC',
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-sm" title={t.description}>
                      {truncate(t.description ?? '', 50)}
                    </td>
                    <td className="px-4 py-3">
                      {t.category ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/10">
                          <Tag className="w-3 h-3" />
                          {t.category.name}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span className="truncate">{t.account?.name ?? '—'}</span>
                      </div>
                      {t.card ? (
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                            style={{
                              backgroundColor: `${t.card.color ?? '#64748B'}15`,
                              borderColor: `${t.card.color ?? '#64748B'}35`,
                              color: t.card.color ?? '#64748B',
                            }}
                            title={
                              t.card.type === 'CREDIT' ? 'Cartão de crédito' : 'Cartão de débito'
                            }
                          >
                            {t.card.type === 'CREDIT' ? 'crédito' : 'débito'}
                          </span>
                          <span className="text-xs font-semibold text-foreground truncate">
                            {t.card.name}
                          </span>
                        </div>
                      ) : (
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          {t.channel === 'PIX' ? (
                            <span
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                              style={{
                                backgroundColor: '#8B5CF615',
                                borderColor: '#8B5CF635',
                                color: '#8B5CF6',
                              }}
                              title="Transação via PIX"
                            >
                              pix
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                              style={{
                                backgroundColor: '#64748B15',
                                borderColor: '#64748B35',
                                color: '#64748B',
                              }}
                              title="Transação bancária"
                            >
                              bancária
                            </span>
                          )}

                          {t.classification === 'TRANSFER' ? (
                            <span
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                              style={{
                                backgroundColor: '#F59E0B15',
                                borderColor: '#F59E0B35',
                                color: '#F59E0B',
                              }}
                              title="Quitação/transferência (ex.: pagamento de fatura)"
                            >
                              fatura
                            </span>
                          ) : null}
                        </div>
                      )}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-bold text-sm ${isIncome ? 'text-emerald-500' : 'text-foreground'}`}
                    >
                      <div className="flex items-center justify-end gap-2">
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-smooth">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(t);
                            }}
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-smooth"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRow(t);
                            }}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-smooth disabled:opacity-40"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center">
                          {isIncome ? (
                            <ArrowUpRight className="inline w-3 h-3 mr-1" />
                          ) : (
                            <ArrowDownLeft className="inline w-3 h-3 mr-1" />
                          )}
                          <PrivacyAmount value={isIncome ? value : -value} />
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
