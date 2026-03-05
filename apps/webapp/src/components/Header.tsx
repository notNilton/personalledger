import { Link } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  PieChart,
  FileUp,
  Settings,
  CircleDollarSign
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 px-4 backdrop-blur-lg">
      <nav className="max-w-7xl mx-auto flex flex-wrap items-center gap-x-6 gap-y-2 py-3 sm:py-4">
        <h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 rounded-xl border border-border bg-card/50 px-4 py-2 hover:border-primary/50 transition-colors"
          >
            <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center">
              <CircleDollarSign className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">BudgetWise</span>
          </Link>
        </h2>

        <div className="hidden sm:flex items-center gap-1.5 ml-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
            activeProps={{ className: 'text-foreground bg-accent' }}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            to="/transactions"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
            activeProps={{ className: 'text-foreground bg-accent' }}
          >
            <Receipt className="w-4 h-4" />
            Transações
          </Link>
          <Link
            to="/accounts"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
            activeProps={{ className: 'text-foreground bg-accent' }}
          >
            <Wallet className="w-4 h-4" />
            Contas
          </Link>
          <Link
            to="/budgets"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
            activeProps={{ className: 'text-foreground bg-accent' }}
          >
            <PieChart className="w-4 h-4" />
            Orçamentos
          </Link>
          <Link
            to="/import"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
            activeProps={{ className: 'text-foreground bg-accent' }}
          >
            <FileUp className="w-4 h-4" />
            Importar
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/settings"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
          >
            <Settings className="w-5 h-5" />
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
