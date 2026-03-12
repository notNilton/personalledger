import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import PrivacyAmount from '../components/PrivacyAmount';
import { TransactionModal } from '../components/TransactionModal';
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
} from 'lucide-react';

export const Route = createFileRoute('/transactions')({
  component: TransactionsPage,
});

const INITIAL_TRANSACTIONS = [
  {
    date: '2026-03-12',
    desc: 'Supermercado Silva',
    cat: 'Alimentação',
    account: 'Nubank',
    val: -184.5,
    type: 'expense',
  },
  {
    date: '2026-03-10',
    desc: 'Salário Março',
    cat: 'Renda',
    account: 'Itaú',
    val: 5200.0,
    type: 'income',
  },
  {
    date: '2026-03-08',
    desc: 'Posto Shell Jabaquara',
    cat: 'Transporte',
    account: 'PicPay',
    val: -220.0,
    type: 'expense',
  },
  {
    date: '2026-03-05',
    desc: 'Assinatura Netflix',
    cat: 'Lazer',
    account: 'Nubank',
    val: -55.9,
    type: 'expense',
  },
  {
    date: '2026-03-02',
    desc: 'Academia Bluefit',
    cat: 'Saúde',
    account: 'Nubank',
    val: -129.9,
    type: 'expense',
  },
  {
    date: '2026-02-28',
    desc: 'Aluguel Apartamento',
    cat: 'Moradia',
    account: 'Itaú',
    val: -2100.0,
    type: 'expense',
  },
  {
    date: '2026-02-25',
    desc: 'Transferência Recebida',
    cat: 'Outros',
    account: 'Nubank',
    val: 150.0,
    type: 'income',
  },
  {
    date: '2026-02-20',
    desc: 'Restaurante Coco Bambu',
    cat: 'Lazer',
    account: 'Nubank',
    val: -340.0,
    type: 'expense',
  },
  {
    date: '2026-02-15',
    desc: 'Internet Vivo Fibra',
    cat: 'Moradia',
    account: 'Itaú',
    val: -120.0,
    type: 'expense',
  },
  {
    date: '2026-02-10',
    desc: 'Freelance Design',
    cat: 'Renda',
    account: 'Nubank',
    val: 1200.0,
    type: 'income',
  },
  {
    date: '2026-02-05',
    desc: 'Farmácia Drogasil',
    cat: 'Saúde',
    account: 'PicPay',
    val: -85.2,
    type: 'expense',
  },
  {
    date: '2026-01-30',
    desc: 'Uber Viagens',
    cat: 'Transporte',
    account: 'Nubank',
    val: -45.6,
    type: 'expense',
  },
];

const CATEGORIES = ['Alimentação', 'Lazer', 'Transporte', 'Moradia', 'Saúde', 'Renda', 'Outros'];

function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterRange, setFilterRange] = useState<'month' | 'custom'>('month');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  const handleCreate = () => {
    setModalMode('create');
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEdit = (transaction: any) => {
    setModalMode('edit');
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const filteredTransactions = useMemo(() => {
    const today = new Date('2026-03-12');
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    return INITIAL_TRANSACTIONS.filter((t) => {
      const transDate = new Date(t.date);

      const matchesSearch = t.desc.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesCategory = selectedCategory === 'all' || t.cat === selectedCategory;

      let matchesDate = true;
      if (filterRange === 'month') {
        matchesDate = transDate >= thirtyDaysAgo && transDate <= today;
      } else if (filterRange === 'custom') {
        if (startDate) matchesDate = matchesDate && transDate >= new Date(startDate);
        if (endDate) matchesDate = matchesDate && transDate <= new Date(endDate);
      }

      return matchesSearch && matchesType && matchesCategory && matchesDate;
    });
  }, [search, filterType, filterRange, selectedCategory, startDate, endDate]);

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Atividade</h1>
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

      {/* Filters & Search */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none w-[300px]"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium hover:bg-muted transition-smooth outline-none cursor-pointer"
          >
            <option value="all">Tipos</option>
            <option value="income">Entradas</option>
            <option value="expense">Saídas</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium hover:bg-muted transition-smooth outline-none cursor-pointer"
          >
            <option value="all">Todas as Categorias</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterRange('month')}
            className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-smooth ${filterRange === 'month' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
          >
            Últimos 30 dias
          </button>
          <button
            onClick={() => setFilterRange('custom')}
            className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-smooth ${filterRange === 'custom' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
          >
            Personalizado
          </button>
        </div>
      </div>

      {filterRange === 'custom' && (
        <div className="flex gap-4 p-4 bg-muted/30 rounded-2xl border border-border/50 animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
              Início
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-card border border-border rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
              Fim
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-card border border-border rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      )}

      {/* Transactions List */}
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
            {filteredTransactions.map((t, i) => (
              <tr key={i} className="hover:bg-muted/20 transition-smooth group cursor-pointer">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    {new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-sm">{t.desc}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/10">
                    <Tag className="w-3 h-3" />
                    {t.cat}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <CreditCard className="w-3.5 h-3.5" />
                    {t.account}
                  </div>
                </td>
                <td
                  className={`px-6 py-4 text-right font-bold text-sm ${t.type === 'income' ? 'text-emerald-500' : 'text-foreground'}`}
                >
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(t);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-smooth"
                      title="Editar Transação"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center">
                      {t.type === 'income' ? (
                        <ArrowUpRight className="inline w-3 h-3 mr-1" />
                      ) : (
                        <ArrowDownLeft className="inline w-3 h-3 mr-1" />
                      )}
                      <PrivacyAmount value={t.val} />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        initialData={editingTransaction}
      />
    </div>
  );
}
