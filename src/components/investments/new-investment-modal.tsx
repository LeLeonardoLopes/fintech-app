"use client";

import { useState } from "react";
import { X, TrendingUp } from "lucide-react";
import { useFinance } from "@/context/finance-context";
import { InvestmentType } from "@/lib/types";

interface NewInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewInvestmentModal({ isOpen, onClose }: NewInvestmentModalProps) {
  const { addInvestment } = useFinance();

  const [name, setName] = useState("");
  const [type, setType] = useState<InvestmentType>("emergency_fund");
  const [institution, setInstitution] = useState("Tesouro Direto");
  const [amountInvested, setAmountInvested] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [liquidity, setLiquidity] = useState<"immediate" | "d+1" | "d+30" | "long_term">("immediate");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedInvested = parseFloat(amountInvested.replace(",", "."));
    const parsedCurrent = parseFloat(currentValue.replace(",", ".")) || parsedInvested;

    if (!name || isNaN(parsedInvested) || parsedInvested <= 0) return;

    addInvestment({
      name,
      type,
      institution,
      amount_invested: parsedInvested,
      current_value: parsedCurrent,
      liquidity,
      notes,
    });

    setName("");
    setAmountInvested("");
    setCurrentValue("");
    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#121316] border border-border w-full max-w-md rounded-xl shadow-2xl overflow-hidden relative">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-sm text-foreground">Novo Ativo / Investimento</h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-foreground rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="text-neutral-400 font-medium block mb-1">Categoria do Ativo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as InvestmentType)}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="emergency_fund">Reserva de Emergência (Liquidez Alta)</option>
              <option value="fixed_income">Renda Fixa (CDB, LCI, LCA, Debênture)</option>
              <option value="equities">Ações / Ações Globais / ETFs</option>
              <option value="fii">Fundos Imobiliários (FIIs)</option>
              <option value="crypto">Criptomoedas</option>
            </select>
          </div>

          <div>
            <label className="text-neutral-400 font-medium block mb-1">Nome do Ativo</label>
            <input
              type="text"
              placeholder="Ex: Tesouro Selic 2029, CDB Inter, IVVB11..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-400 font-medium block mb-1">Instituição / Corretora</label>
              <input
                type="text"
                placeholder="Ex: NuInvest, XP, Inter..."
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                required
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-neutral-400 font-medium block mb-1">Liquidez / Resgate</label>
              <select
                value={liquidity}
                onChange={(e) =>
                  setLiquidity(e.target.value as "immediate" | "d+1" | "d+30" | "long_term")
                }
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-foreground focus:outline-hidden"
              >
                <option value="immediate">Imediata (D+0)</option>
                <option value="d+1">D+1 Útil</option>
                <option value="d+30">D+30</option>
                <option value="long_term">Longo Prazo / No Vencimento</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-400 font-medium block mb-1">Valor Aportado (R$)</label>
              <input
                type="text"
                placeholder="0,00"
                value={amountInvested}
                onChange={(e) => setAmountInvested(e.target.value)}
                required
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-neutral-400 font-medium block mb-1">Valor Atualizado (R$)</label>
              <input
                type="text"
                placeholder="0,00"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-neutral-400 font-medium block mb-1">Observações (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: Vencimento em 2029, isento de IR..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-foreground focus:outline-hidden"
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
              Salvar Ativo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
