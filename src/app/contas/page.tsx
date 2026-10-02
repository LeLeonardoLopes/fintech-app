"use client";

import { useState } from "react";
import { useFinance } from "@/context/finance-context";
import { Header } from "@/components/layout/header";
import { formatCurrency } from "@/lib/utils";
import { Plus, CreditCard, Building2, Wallet, Calendar, AlertCircle } from "lucide-react";
import { NewAccountModal } from "@/components/accounts/new-account-modal";

export default function ContasPage() {
  const { accounts } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const bankAccounts = accounts.filter((a) => a.type !== "credit_card");
  const creditCards = accounts.filter((a) => a.type === "credit_card");

  const totalBankBalance = bankAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalCreditDebt = creditCards.reduce((sum, a) => sum + Math.abs(a.balance), 0);
  const totalCreditLimit = creditCards.reduce((sum, a) => sum + (a.credit_limit || 0), 0);

  return (
    <>
      <Header title="Contas & Cartões" subtitle="Gerenciamento de saldo bancário e limites de cartões" />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Top summary row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
            <span className="text-xs font-medium text-neutral-400">Total em Contas</span>
            <div className="text-xl font-bold font-mono text-emerald-500 mt-1">
              {formatCurrency(totalBankBalance)}
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">{bankAccounts.length} contas cadastradas</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
            <span className="text-xs font-medium text-neutral-400">Faturas de Cartão (A pagar)</span>
            <div className="text-xl font-bold font-mono text-purple-500 mt-1">
              {formatCurrency(totalCreditDebt)}
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">{creditCards.length} cartões ativos</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-neutral-400">Limite de Crédito Total</span>
              <div className="text-xl font-bold font-mono text-foreground mt-1">
                {formatCurrency(totalCreditLimit)}
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Disponível: {formatCurrency(totalCreditLimit - totalCreditDebt)}
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          </div>
        </div>

        {/* Seção 1: Cartões de Crédito */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xs tracking-tight text-foreground uppercase flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-500" />
              Cartões de Crédito
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {creditCards.map((card) => {
              const currentDebt = Math.abs(card.balance);
              const limit = card.credit_limit || 1;
              const usedPercent = Math.min(100, Math.round((currentDebt / limit) * 100));

              return (
                <div
                  key={card.id}
                  className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-xs relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: card.color || "#820ad1" }}
                  />

                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{card.name}</h3>
                      <p className="text-[11px] text-neutral-400">{card.institution}</p>
                    </div>
                    <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400">
                      <CreditCard className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-neutral-400">Fatura Atual</div>
                    <div className="text-xl font-bold font-mono text-foreground">
                      {formatCurrency(currentDebt)}
                    </div>
                  </div>

                  {/* Barra de Limite */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                      <span>{usedPercent}% utilizado</span>
                      <span>Limite: {formatCurrency(limit)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usedPercent > 80
                            ? "bg-red-500"
                            : usedPercent > 50
                            ? "bg-amber-500"
                            : "bg-purple-500"
                        }`}
                        style={{ width: `${usedPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-neutral-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-neutral-500" />
                      <span>Fecha dia {card.closing_day}</span>
                    </div>
                    <div>
                      <span>Vence dia {card.due_day}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seção 2: Contas Bancárias & Dinheiro */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xs tracking-tight text-foreground uppercase flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-500" />
              Contas Correntes & Carteiras
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankAccounts.map((acc) => {
              return (
                <div
                  key={acc.id}
                  className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-xs relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: acc.color || "#10b981" }}
                  />

                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{acc.name}</h3>
                      <p className="text-[11px] text-neutral-400">{acc.institution}</p>
                    </div>
                    <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500">
                      {acc.type === "cash" ? (
                        <Wallet className="w-4 h-4" />
                      ) : (
                        <Building2 className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-neutral-400">Saldo Atual</div>
                    <div className="text-xl font-bold font-mono text-emerald-500">
                      {formatCurrency(acc.balance)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <NewAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
