"use client";

import { useState } from "react";
import { useFinance } from "@/context/finance-context";
import { Header } from "@/components/layout/header";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, ShieldCheck, Plus, Landmark, PieChart, Coins } from "lucide-react";
import { NewInvestmentModal } from "@/components/investments/new-investment-modal";

export default function InvestimentosPage() {
  const { investments, transactions } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cálculos
  const totalInvested = investments.reduce((sum, i) => sum + i.amount_invested, 0);
  const totalCurrentValue = investments.reduce((sum, i) => sum + i.current_value, 0);
  const totalProfit = totalCurrentValue - totalInvested;
  const profitPercentage =
    totalInvested > 0 ? ((totalProfit / totalInvested) * 100).toFixed(2) : "0.00";

  // Reserva de Emergência
  const emergencyFunds = investments.filter((i) => i.type === "emergency_fund");
  const totalEmergency = emergencyFunds.reduce((sum, i) => sum + i.current_value, 0);

  // Média estimada de gastos mensais
  const monthlyExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0) || 2500;

  const monthsCovered = (totalEmergency / monthlyExpenses).toFixed(1);

  return (
    <>
      <Header
        title="Investimentos & Reserva"
        subtitle="Acompanhamento patrimonial e segurança financeira"
      />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Patrimônio Atualizado */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
            <span className="text-xs font-medium text-neutral-400">Patrimônio Investido Total</span>
            <div className="text-xl font-bold font-mono text-foreground mt-1">
              {formatCurrency(totalCurrentValue)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono">
              <span className={totalProfit >= 0 ? "text-emerald-500 font-semibold" : "text-red-500 font-semibold"}>
                {totalProfit >= 0 ? `+${formatCurrency(totalProfit)}` : formatCurrency(totalProfit)}
              </span>
              <span className="text-neutral-400">({profitPercentage}%)</span>
            </div>
          </div>

          {/* Reserva de Emergência */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-medium">Reserva de Emergência</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-bold font-mono text-emerald-500 mt-1">
                {formatCurrency(totalEmergency)}
              </div>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Garante aproximadamente <strong>{monthsCovered} meses</strong> do seu custo de vida
            </p>
          </div>

          {/* Ação rápida */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-neutral-400">Total de Ativos</span>
              <div className="text-xl font-bold font-mono text-foreground mt-1">
                {investments.length}
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">Diversificados em carteira</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Ativo</span>
            </button>
          </div>
        </div>

        {/* Tabela de Ativos */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-xs tracking-tight text-foreground uppercase">
                Posições & Carteira
              </h2>
              <p className="text-[11px] text-neutral-400">Lista discriminada de investimentos</p>
            </div>
          </div>

          <div className="divide-y divide-border/60">
            {investments.map((inv) => {
              const profit = inv.current_value - inv.amount_invested;
              const percent = ((profit / inv.amount_invested) * 100).toFixed(1);

              return (
                <div
                  key={inv.id}
                  className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                      {inv.type === "emergency_fund" ? (
                        <ShieldCheck className="w-4 h-4" />
                      ) : inv.type === "crypto" ? (
                        <Coins className="w-4 h-4" />
                      ) : (
                        <TrendingUp className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-foreground flex items-center gap-2">
                        <span>{inv.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border border-border">
                          {inv.liquidity === "immediate"
                            ? "Liquidez Imediata"
                            : inv.liquidity === "d+1"
                            ? "D+1"
                            : "Longo Prazo"}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        {inv.institution} {inv.notes && `• ${inv.notes}`}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-xs font-semibold text-foreground">
                      {formatCurrency(inv.current_value)}
                    </div>
                    <div className="text-[10px] font-mono mt-0.5">
                      <span className="text-neutral-400">Aporte: {formatCurrency(inv.amount_invested)} </span>
                      <span
                        className={
                          profit >= 0 ? "text-emerald-500 font-medium" : "text-red-500 font-medium"
                        }
                      >
                        ({profit >= 0 ? `+${percent}%` : `${percent}%`})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <NewInvestmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
