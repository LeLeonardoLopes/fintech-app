"use client";

import { useState } from "react";
import { X, Calendar, Tag, CreditCard, Layers, Repeat, Hash, Plus } from "lucide-react";
import { useFinance } from "@/context/finance-context";
import { TransactionType } from "@/lib/types";
import { CategoryManagerModal } from "@/components/categories/category-manager-modal";

export function NewTransactionModal() {
  const { isNewTxModalOpen, setIsNewTxModalOpen, accounts, categories, addTransaction } = useFinance();

  const [type, setType] = useState<TransactionType>("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentTotal, setInstallmentTotal] = useState(2);
  const [tagsInput, setTagsInput] = useState("");
  const [notes, setNotes] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  if (!isNewTxModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(",", "."));
    if (!description || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    addTransaction({
      description,
      amount: parsedAmount,
      type,
      category_id: categoryId,
      account_id: accountId,
      date,
      status: "completed",
      is_recurring: isRecurring,
      recurrence_period: isRecurring ? "monthly" : undefined,
      is_installment: isInstallment,
      installment_current: isInstallment ? 1 : undefined,
      installment_total: isInstallment ? installmentTotal : undefined,
      tags,
      notes,
    });

    // Reset and close
    setDescription("");
    setAmount("");
    setIsRecurring(false);
    setIsInstallment(false);
    setTagsInput("");
    setNotes("");
    setIsNewTxModalOpen(false);
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-sm text-foreground">Novo Lançamento</h2>
            <div className="flex bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  type === "expense"
                    ? "bg-red-500/10 text-red-500 border border-red-500/20 font-semibold shadow-xs"
                    : "text-neutral-500 hover:text-foreground"
                }`}
              >
                Despesa
              </button>
              <button
                type="button"
                onClick={() => setType("income")}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  type === "income"
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold shadow-xs"
                    : "text-neutral-500 hover:text-foreground"
                }`}
              >
                Receita
              </button>
            </div>
          </div>
          <button
            onClick={() => setIsNewTxModalOpen(false)}
            className="p-1 text-neutral-400 hover:text-foreground rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Valor Principal em destaque */}
          <div>
            <label className="text-neutral-400 font-medium block mb-1">Valor (R$)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-neutral-400">
                R$
              </span>
              <input
                type="text"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-lg text-lg font-mono font-semibold text-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="text-neutral-400 font-medium block mb-1">Descrição</label>
            <input
              type="text"
              placeholder="Ex: Supermercado, Aluguel, Salário..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Categoria e Conta */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-neutral-400 font-medium flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Categoria
                </label>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  data-testid="btn-quick-new-category"
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Nova</span>
                </button>
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-neutral-400 font-medium flex items-center gap-1.5 mb-1">
                <CreditCard className="w-3.5 h-3.5" />
                Conta / Cartão
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.institution})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Data */}
          <div>
            <label className="text-neutral-400 font-medium flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              Data do Lançamento
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Opções Avançadas: Recorrência & Parcelamento */}
          <div className="pt-2 border-t border-border/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-neutral-600 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => {
                    setIsRecurring(e.target.checked);
                    if (e.target.checked) setIsInstallment(false);
                  }}
                  className="rounded border-border text-emerald-600 focus:ring-emerald-500"
                />
                <Repeat className="w-3.5 h-3.5 text-neutral-400" />
                <span>Despesa / Receita Recorrente Mensal</span>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-neutral-600 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={isInstallment}
                  onChange={(e) => {
                    setIsInstallment(e.target.checked);
                    if (e.target.checked) setIsRecurring(false);
                  }}
                  className="rounded border-border text-emerald-600 focus:ring-emerald-500"
                />
                <Hash className="w-3.5 h-3.5 text-neutral-400" />
                <span>Compra Parcelada no Cartão</span>
              </label>

              {isInstallment && (
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-400">Total de parcelas:</span>
                  <input
                    type="number"
                    min={2}
                    max={72}
                    value={installmentTotal}
                    onChange={(e) => setInstallmentTotal(parseInt(e.target.value) || 2)}
                    className="w-16 px-2 py-1 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-foreground text-center"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-neutral-400 font-medium flex items-center gap-1.5 mb-1">
              <Tag className="w-3.5 h-3.5" />
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              placeholder="ex: fixo, viagem, trabalho"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewTxModalOpen(false)}
              className="px-4 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-foreground font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm transition-all"
            >
              Salvar Lançamento
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Gerenciamento & Criação Rápida de Categorias */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        initialType={type}
        onSelectCreatedCategory={(newCat) => {
          setCategoryId(newCat.id);
        }}
      />
    </div>
  );
}
