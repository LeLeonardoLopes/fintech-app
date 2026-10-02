"use client";

import { useState } from "react";
import { useFinance } from "@/context/finance-context";
import { Header } from "@/components/layout/header";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Target, Plus, AlertTriangle, CheckCircle2, ShieldAlert, Calendar } from "lucide-react";
import { NewGoalModal } from "@/components/goals/new-goal-modal";

export default function MetasPage() {
  const { goals } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const savingGoals = goals.filter((g) => g.type === "saving");
  const budgetLimits = goals.filter((g) => g.type === "budget_limit");

  return (
    <>
      <Header title="Metas & Orçamentos" subtitle="Planejamento de poupança e controle de tetos de gastos" />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-xs tracking-tight text-foreground uppercase">
              Planejamento Estratégico
            </h2>
            <p className="text-[11px] text-neutral-400">
              Acompanhe o avanço dos seus objetivos e evite ultrapassar os limites mensais
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-medium transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Meta / Teto</span>
          </button>
        </div>

        {/* Tetos de Gastos por Categoria */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold text-xs tracking-tight text-foreground uppercase">
              Tetos de Gastos Mensais (Orçamento)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetLimits.map((b) => {
              const percent = Math.min(100, Math.round((b.current_amount / b.target_amount) * 100));
              const isOver = b.current_amount > b.target_amount;
              const isWarning = percent >= 80 && !isOver;

              return (
                <div
                  key={b.id}
                  className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-xs text-foreground">{b.title}</h4>
                      <p className="text-[10px] text-neutral-400">Limite mensal fixado</p>
                    </div>
                    {isOver ? (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        Estourado
                      </span>
                    ) : isWarning ? (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        Atenção
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        No controle
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className={isOver ? "text-red-500 font-bold" : "text-foreground font-semibold"}>
                        {formatCurrency(b.current_amount)}
                      </span>
                      <span className="text-neutral-400">Teto: {formatCurrency(b.target_amount)}</span>
                    </div>

                    <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOver ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                      <span>{percent}% gasto</span>
                      <span>
                        {isOver
                          ? `Excedido em ${formatCurrency(b.current_amount - b.target_amount)}`
                          : `Resta ${formatCurrency(b.target_amount - b.current_amount)}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Metas de Economia */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" />
            <h3 className="font-semibold text-xs tracking-tight text-foreground uppercase">
              Metas de Economia & Sonhos
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savingGoals.map((g) => {
              const percent = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));

              return (
                <div
                  key={g.id}
                  className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-xs text-foreground">{g.title}</h4>
                      {g.deadline && (
                        <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-2.5 h-2.5" />
                          Prazo: {formatDate(g.deadline)}
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-500">
                      {percent}%
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-foreground font-semibold">
                        {formatCurrency(g.current_amount)}
                      </span>
                      <span className="text-neutral-400">Alvo: {formatCurrency(g.target_amount)}</span>
                    </div>

                    <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                      <span>Falta: {formatCurrency(Math.max(0, g.target_amount - g.current_amount))}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <NewGoalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
