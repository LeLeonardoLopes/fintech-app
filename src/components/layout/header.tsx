"use client";

import { Plus, Calendar, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFinance } from "@/context/finance-context";
import { formatMonthYear } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter();
  const { selectedMonth, setSelectedMonth, setIsNewTxModalOpen, user, logout } = useFinance();

  const handlePrevMonth = () => {
    const prev = new Date(selectedMonth);
    prev.setMonth(prev.getMonth() - 1);
    setSelectedMonth(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(selectedMonth);
    next.setMonth(next.getMonth() + 1);
    setSelectedMonth(next);
  };

  return (
    <header className="h-14 border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-sm text-foreground">{title}</h1>
          {subtitle && <p className="text-xs text-neutral-400">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Month selector */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/80 px-2 py-1 rounded-md border border-border text-xs">
            <Calendar className="w-3.5 h-3.5 text-neutral-400 mr-1" />
            <span className="capitalize font-medium text-foreground min-w-[100px] text-center">
              {formatMonthYear(selectedMonth)}
            </span>
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
              title="Mês anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-neutral-500" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
              title="Próximo mês"
            >
              <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
            </button>
          </div>

          {/* Quick action button */}
          <button
            onClick={() => setIsNewTxModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Transação</span>
          </button>

          {/* Botão de Sair */}
          {user && (
            <button
              onClick={async () => {
                await logout();
                router.push("/login");
              }}
              data-testid="logout-btn-header"
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-neutral-500 dark:text-neutral-400 hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/10 text-xs font-medium transition-all"
              title={`Sair da conta (${user.email})`}
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
