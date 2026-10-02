"use client";

import { useState } from "react";
import { X, Target, Calendar } from "lucide-react";
import { useFinance } from "@/context/finance-context";

interface NewGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewGoalModal({ isOpen, onClose }: NewGoalModalProps) {
  const { addGoal, categories } = useFinance();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<"saving" | "budget_limit">("saving");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [color, setColor] = useState("#10b981");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetAmount.replace(",", "."));
    const parsedCurrent = parseFloat(currentAmount.replace(",", ".")) || 0;

    if (!title || isNaN(parsedTarget) || parsedTarget <= 0) return;

    addGoal({
      title,
      type,
      target_amount: parsedTarget,
      current_amount: parsedCurrent,
      category_id: type === "budget_limit" ? categoryId : undefined,
      deadline: deadline || undefined,
      color,
    });

    setTitle("");
    setTargetAmount("");
    setCurrentAmount("");
    setDeadline("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#121316] border border-border w-full max-w-md rounded-xl shadow-2xl overflow-hidden relative">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-sm text-foreground">Nova Meta ou Teto</h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-foreground rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="text-neutral-400 font-medium block mb-1">Tipo de Planejamento</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("saving")}
                className={`p-2 rounded-lg border text-center transition-all ${
                  type === "saving"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-medium"
                    : "border-border text-neutral-400 hover:text-foreground"
                }`}
              >
                Meta de Economia
              </button>
              <button
                type="button"
                onClick={() => setType("budget_limit")}
                className={`p-2 rounded-lg border text-center transition-all ${
                  type === "budget_limit"
                    ? "border-amber-500 bg-amber-500/10 text-amber-500 font-medium"
                    : "border-border text-neutral-400 hover:text-foreground"
                }`}
              >
                Teto de Gastos Mensal
              </button>
            </div>
          </div>

          <div>
            <label className="text-neutral-400 font-medium block mb-1">Título</label>
            <input
              type="text"
              placeholder={
                type === "saving"
                  ? "Ex: Viagem de Férias, Carro Novo..."
                  : "Ex: Teto Alimentação & Mercado..."
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {type === "budget_limit" && (
            <div>
              <label className="text-neutral-400 font-medium block mb-1">Categoria Vinculada</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Selecione uma categoria (opcional)</option>
                {categories
                  .filter((c) => c.type === "expense")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-400 font-medium block mb-1">
                {type === "saving" ? "Valor Alvo da Meta (R$)" : "Limite Máximo (R$)"}
              </label>
              <input
                type="text"
                placeholder="0,00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-neutral-400 font-medium block mb-1">
                {type === "saving" ? "Já Acumulado (R$)" : "Gasto Atual (R$)"}
              </label>
              <input
                type="text"
                placeholder="0,00"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-neutral-400 font-medium block mb-1">Data Limite (Prazo Opcional)</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-foreground font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm transition-all"
            >
              Salvar Meta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
