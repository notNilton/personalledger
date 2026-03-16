import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PrivacyAmount from '../components/PrivacyAmount';
import { TransactionModal } from '../components/TransactionModal';
import { api } from '../lib/api';
import {
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Tag,
  CreditCard,
  FileUp,
  Edit2,
  Trash2,
  Loader2,
} from 'lucide-react';

export const Route = createFileRoute('/transactions')({
  component: TransactionsPage,
});

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface Account {
  id: string;
  name: string;
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
  vehicleId?: string;
  currentKm?: number;
  liters?: number;
  fuelType?: string;
  refuelingLog?: {
    vehicleId: string;
    odometer: number;
    fuelLiters: number;
    fuelType: string;
    pricePerLiter: number;
  };
}

function TransactionsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'INCOME' | 'EXPENSE'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Queries
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', search, filterType, selectedCategory],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterType !== 'all') params.set('type', filterType);
      if (selectedCategory !== 'all') params.set('categoryId', selectedCategory);
      // sem filtro de data: retorna todas as transações que a API permitir
      return api.get<Transaction[]>(`/transactions?${params.toString()}`);
    },
    staleTime: 1000 * 30,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/categories'),
    staleTime: 1000 * 60 * 5, // 5 min — categorias mudam raramente
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleCreate = () => {
    setModalMode('create');
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setModalMode('edit');
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;
    deleteMutation.mutate(id);
  };

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Transações</h1>
          <p className="text-muted-foreground mt-1">Histórico completo e importação de extratos.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border font-semibold hover:bg-muted transition-smooth">
            <FileUp className="w-4 h-4" />
            Importar
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
              className="pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none w-[260px]"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'INCOME' | 'EXPENSE')}
            className="px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium hover:bg-muted transition-smooth outline-none cursor-pointer"
          >
            <option value="all">Todos os Tipos</option>
            <option value="INCOME">Entradas</option>
            <option value="EXPENSE">Saídas</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium hover:bg-muted transition-smooth outline-none cursor-pointer"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card-premium overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Data
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Descrição
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Categoria
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Conta
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">
                Valor
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-7 h-7 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Carregando transações...</p>
                  </div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <p className="text-sm text-muted-foreground">Nenhuma transação encontrada.</p>
                  <button
                    onClick={handleCreate}
                    className="mt-3 text-xs font-bold text-primary hover:underline"
                  >
                    + Adicionar a primeira transação
                  </button>
                </td>
              </tr>
            ) : (
              transactions.map((t) => {
                const isIncome = t.type === 'INCOME';
                const value = Math.abs(Number(t.amount));
                return (
                  <tr
                    key={t.id}
                    className="hover:bg-muted/20 transition-smooth group cursor-pointer"
                  >
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4 font-medium text-sm">{t.description}</td>
                    <td className="px-6 py-4">
                      {t.category ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/10">
                          <Tag className="w-3 h-3" />
                          {t.category.name}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                        <CreditCard className="w-3.5 h-3.5" />
                        {t.account?.name ?? '—'}
                      </div>
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-bold text-sm ${isIncome ? 'text-emerald-500' : 'text-foreground'}`}
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
                              handleDelete(t.id);
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
