"use client";

import { useFinance } from "@/context/finance-context";
import { Header } from "@/components/layout/header";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Target,
  TrendingUp,
  Tag,
  Repeat,
  Hash,
  Trash2,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { CustomizableBarChart } from "@/components/dashboard/customizable-bar-chart";

export default function DashboardPage() {
  const {
    accounts,
    categories,
    transactions,
    goals,
    investments,
    deleteTransaction,
    setIsNewTxModalOpen,
  } = useFinance();

  // Cálculos financeiros
  const totalBalance = accounts
    .filter((a) => a.type !== "credit_card")
    .reduce((sum, a) => sum + a.balance, 0);

  const totalCreditDebt = accounts
    .filter((a) => a.type === "credit_card")
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const totalInvested = investments.reduce((sum, i) => sum + i.current_value, 0);


  return (
    <>
      <Header title="Visão Geral" subtitle="Acompanhamento financeiro em tempo real" />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-5">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Saldo Líquido em Contas */}
          <div className="bg-card border border-border/80 hover:border-neutral-400/50 dark:hover:border-neutral-700 rounded-xl p-5 min-h-[132px] shadow-xs transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Saldo em Contas</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {formatCurrency(totalBalance)}
              </div>
              <p className="text-[11px] text-neutral-400 mt-1.5">Disponível em conta corrente e dinheiro</p>
            </div>
          </div>

          {/* Receitas do Mês */}
          <div className="bg-card border border-border/80 hover:border-emerald-500/40 dark:hover:border-emerald-500/30 rounded-xl p-5 min-h-[132px] shadow-xs transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Receitas no Mês</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-emerald-500">
                {formatCurrency(totalIncome)}
              </div>
              <p className="text-[11px] text-neutral-400 mt-1.5">Salários, rendimentos e extras</p>
            </div>
          </div>

          {/* Despesas do Mês */}
          <div className="bg-card border border-border/80 hover:border-red-500/40 dark:hover:border-red-500/30 rounded-xl p-5 min-h-[132px] shadow-xs transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Despesas no Mês</span>
              <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-red-500">
                {formatCurrency(totalExpense)}
              </div>
              <p className="text-[11px] text-neutral-400 mt-1.5">Gastos fixos, variáveis e cartões</p>
            </div>
          </div>

          {/* Faturas de Cartão */}
          <div className="bg-card border border-border/80 hover:border-purple-500/40 dark:hover:border-purple-500/30 rounded-xl p-5 min-h-[132px] shadow-xs transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Faturas em Aberto</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-purple-500">
                {formatCurrency(totalCreditDebt)}
              </div>
              <p className="text-[11px] text-neutral-400 mt-1.5">Total acumulado nos cartões</p>
            </div>
          </div>
        </div>

        {/* Gráfico de Barras Customizável Visualmente */}
        <CustomizableBarChart
          categories={categories}
          transactions={transactions}
          totalExpense={totalExpense}
          totalIncome={totalIncome}
        />

        {/* Linha de Balanço e Reserva */}
        <div className="bg-card border border-border/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-neutral-400">Patrimônio Investido & Reserva</div>
              <div className="text-base font-bold tracking-tight text-foreground">
                {formatCurrency(totalInvested)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Resultado do Mês: </span>
            <span
              className={`text-sm font-bold ${
                netBalance >= 0 ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {netBalance >= 0 ? `+${formatCurrency(netBalance)}` : formatCurrency(netBalance)}
            </span>
          </div>
        </div>

        {/* 2 Colunas: Transações Recentes + Contas & Metas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1 & 2: Transações Recentes */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-xs tracking-tight text-foreground uppercase">
                  Últimos Lançamentos
                </h2>
                <p className="text-[11px] text-neutral-400">Histórico cronológico de movimentações</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsNewTxModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Lançamento</span>
                </button>
                <Link
                  href="/transacoes"
                  className="text-xs text-neutral-400 hover:text-foreground font-medium hover:underline"
                >
                  Ver todos
                </Link>
              </div>
            </div>

            <div className="divide-y divide-border/60">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-neutral-400 text-xs">
                  Nenhuma transação cadastrada ainda.
                </div>
              ) : (
                transactions.slice(0, 8).map((tx) => {
                  const isExpense = tx.type === "expense";
                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 px-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isExpense
                              ? "bg-red-500/10 text-red-500 border border-red-500/20"
                              : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          }`}
                        >
                          {isExpense ? "-" : "+"}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-foreground flex items-center gap-2">
                            <span>{tx.description}</span>
                            {tx.is_installment && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-0.5">
                                <Hash className="w-2.5 h-2.5" />
                                {tx.installment_current}/{tx.installment_total}
                              </span>
                            )}
                            {tx.is_recurring && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-0.5">
                                <Repeat className="w-2.5 h-2.5" />
                                Mensal
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                            <span>{formatDate(tx.date)}</span>
                            {tx.tags && tx.tags.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Tag className="w-2.5 h-2.5" />
                                <span>{tx.tags.join(", ")}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`font-mono font-medium text-xs ${
                            isExpense ? "text-foreground" : "text-emerald-500"
                          }`}
                        >
                          {isExpense ? `-${formatCurrency(tx.amount)}` : `+${formatCurrency(tx.amount)}`}
                        </span>
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 transition-opacity"
                          title="Excluir lançamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Coluna 3: Contas & Cartões + Metas Rápidas */}
          <div className="space-y-6">
            {/* Contas & Cartões */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-xs tracking-tight text-foreground uppercase">
                  Contas & Cartões
                </h3>
                <Link
                  href="/contas"
                  className="text-xs text-neutral-400 hover:text-foreground font-medium"
                >
                  Gerenciar
                </Link>
              </div>

              <div className="space-y-2">
                {accounts.map((acc) => {
                  const isCard = acc.type === "credit_card";
                  return (
                    <div
                      key={acc.id}
                      className="p-3 rounded-lg border border-border/80 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: acc.color || "#10b981" }}
                        />
                        <div>
                          <div className="text-xs font-medium text-foreground">{acc.name}</div>
                          <div className="text-[10px] text-neutral-400">
                            {isCard
                              ? `Fecha dia ${acc.closing_day} • Vence dia ${acc.due_day}`
                              : acc.institution}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-mono text-xs font-semibold ${
                            isCard ? "text-purple-500" : "text-foreground"
                          }`}
                        >
                          {formatCurrency(acc.balance)}
                        </div>
                        {isCard && acc.available_limit !== undefined && (
                          <div className="text-[10px] text-neutral-400">
                            Disp: {formatCurrency(acc.available_limit)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Metas em Destaque */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-xs tracking-tight text-foreground uppercase">
                  Metas & Tetos
                </h3>
                <Link
                  href="/metas"
                  className="text-xs text-neutral-400 hover:text-foreground font-medium"
                >
                  Ver todas
                </Link>
              </div>

              <div className="space-y-3">
                {goals.map((goal) => {
                  const percent = Math.min(
                    100,
                    Math.round((goal.current_amount / goal.target_amount) * 100)
                  );
                  const isBudget = goal.type === "budget_limit";

                  return (
                    <div key={goal.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground flex items-center gap-1.5">
                          <Target className="w-3 h-3 text-neutral-400" />
                          {goal.title}
                        </span>
                        <span className="font-mono text-[11px] text-neutral-400">
                          {percent}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isBudget && percent > 90
                              ? "bg-red-500"
                              : isBudget && percent > 75
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                        <span>{formatCurrency(goal.current_amount)}</span>
                        <span>Meta: {formatCurrency(goal.target_amount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
