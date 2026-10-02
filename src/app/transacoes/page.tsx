"use client";

import { useState } from "react";
import { useFinance } from "@/context/finance-context";
import { Header } from "@/components/layout/header";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Tag,
  Repeat,
  Hash,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { TransactionType } from "@/lib/types";
import { CategoryManagerModal } from "@/components/categories/category-manager-modal";

export default function TransacoesPage() {
  const { transactions, categories, accounts, deleteTransaction, setIsNewTxModalOpen } =
    useFinance();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | TransactionType>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === "all" || tx.type === filterType;
    const matchesCategory = filterCategory === "all" || tx.category_id === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  const totalFiltered = filteredTransactions.reduce((acc, tx) => {
    return tx.type === "income" ? acc + tx.amount : acc - tx.amount;
  }, 0);

  return (
    <>
      <Header title="Transações" subtitle="Histórico completo e lançamentos detalhados" />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-4">
        {/* Filtros e Barra de Ações */}
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Busca por texto */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por descrição ou tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Filtros de Tipo e Categoria */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Tipo */}
            <div className="flex bg-neutral-100 dark:bg-neutral-900 p-0.5 rounded-lg border border-border text-xs">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filterType === "all"
                    ? "bg-white dark:bg-neutral-800 text-foreground font-medium shadow-xs"
                    : "text-neutral-400 hover:text-foreground"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterType("expense")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filterType === "expense"
                    ? "bg-white dark:bg-neutral-800 text-red-500 font-medium shadow-xs"
                    : "text-neutral-400 hover:text-foreground"
                }`}
              >
                Despesas
              </button>
              <button
                onClick={() => setFilterType("income")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filterType === "income"
                    ? "bg-white dark:bg-neutral-800 text-emerald-500 font-medium shadow-xs"
                    : "text-neutral-400 hover:text-foreground"
                }`}
              >
                Receitas
              </button>
            </div>

            {/* Categoria dropdown */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Botão Gerenciar Categorias */}
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              data-testid="btn-manage-categories"
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-border hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-md text-xs font-medium transition-colors cursor-pointer"
              title="Criar, editar ou excluir categorias de gastos"
            >
              <Tag className="w-3.5 h-3.5 text-emerald-500" />
              <span>Categorias</span>
            </button>

            {/* Botão Novo */}
            <button
              onClick={() => setIsNewTxModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-medium transition-colors shadow-xs ml-auto md:ml-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo</span>
            </button>
          </div>
        </div>

        {/* Tabela de Transações */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
          <div className="px-4 py-3 border-b border-border/80 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50 text-xs text-neutral-400 font-medium">
            <span>{filteredTransactions.length} lançamentos encontrados</span>
            <span>
              Saldo do filtro:{" "}
              <strong
                className={`font-mono ${totalFiltered >= 0 ? "text-emerald-500" : "text-red-500"}`}
              >
                {totalFiltered >= 0 ? `+${formatCurrency(totalFiltered)}` : formatCurrency(totalFiltered)}
              </strong>
            </span>
          </div>

          <div className="divide-y divide-border/60">
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 text-xs">
                Nenhum lançamento corresponde aos filtros selecionados.
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const isExpense = tx.type === "expense";
                const cat = categories.find((c) => c.id === tx.category_id);
                const acc = accounts.find((a) => a.id === tx.account_id);

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
                        {isExpense ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-medium text-foreground flex items-center gap-2">
                          <span>{tx.description}</span>
                          {tx.is_installment && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-0.5">
                              <Hash className="w-2.5 h-2.5" />
                              Parcela {tx.installment_current}/{tx.installment_total}
                            </span>
                          )}
                          {tx.is_recurring && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-0.5">
                              <Repeat className="w-2.5 h-2.5" />
                              Recorrente
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                          <span>{formatDate(tx.date)}</span>
                          {cat && <span>• {cat.name}</span>}
                          {acc && <span>• {acc.name}</span>}
                          {tx.tags && tx.tags.length > 0 && (
                            <div className="flex items-center gap-1 text-[10px]">
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
      </main>
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </>
  );
}
