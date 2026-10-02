"use client";

import { useState } from "react";
import { X, CreditCard, Building2, Wallet } from "lucide-react";
import { useFinance } from "@/context/finance-context";
import { AccountType } from "@/lib/types";

interface NewAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewAccountModal({ isOpen, onClose }: NewAccountModalProps) {
  const { addAccount } = useFinance();

  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("Nubank");
  const [type, setType] = useState<AccountType>("checking");
  const [balance, setBalance] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [closingDay, setClosingDay] = useState(25);
  const [dueDay, setDueDay] = useState(5);
  const [color, setColor] = useState("#820ad1");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBalance = parseFloat(balance.replace(",", ".")) || 0;
    const parsedLimit = parseFloat(creditLimit.replace(",", ".")) || 0;

    addAccount({
      name,
      institution,
      type,
      balance: type === "credit_card" ? -Math.abs(parsedBalance) : parsedBalance,
      credit_limit: type === "credit_card" ? parsedLimit : undefined,
      available_limit: type === "credit_card" ? parsedLimit - parsedBalance : undefined,
      closing_day: type === "credit_card" ? closingDay : undefined,
      due_day: type === "credit_card" ? dueDay : undefined,
      color,
    });

    setName("");
    setBalance("");
    setCreditLimit("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#121316] border border-border w-full max-w-md rounded-xl shadow-2xl overflow-hidden relative">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-sm text-foreground">Nova Conta ou Cartão</h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-foreground rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="text-neutral-400 font-medium block mb-1">Tipo de Registro</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType("checking")}
                className={`p-2 rounded-lg border text-center transition-all ${
                  type === "checking"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-medium"
                    : "border-border text-neutral-400 hover:text-foreground"
                }`}
              >
                Conta Corrente
              </button>
              <button
                type="button"
                onClick={() => setType("credit_card")}
                className={`p-2 rounded-lg border text-center transition-all ${
                  type === "credit_card"
                    ? "border-purple-500 bg-purple-500/10 text-purple-400 font-medium"
                    : "border-border text-neutral-400 hover:text-foreground"
                }`}
              >
                Cartão de Crédito
              </button>
              <button
                type="button"
                onClick={() => setType("cash")}
                className={`p-2 rounded-lg border text-center transition-all ${
                  type === "cash"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-medium"
                    : "border-border text-neutral-400 hover:text-foreground"
                }`}
              >
                Carteira Física
              </button>
            </div>
          </div>

          <div>
            <label className="text-neutral-400 font-medium block mb-1">Nome da Conta / Cartão</label>
            <input
              type="text"
              placeholder="Ex: Nubank Ultravioleta, Itaú Principal..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-400 font-medium block mb-1">Instituição</label>
              <input
                type="text"
                placeholder="Ex: Nubank, Inter, Itaú..."
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                required
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-neutral-400 font-medium block mb-1">Cor de Destaque</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-8 px-1 py-0.5 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="text-neutral-400 font-medium block mb-1">
              {type === "credit_card" ? "Fatura Atual em Aberto (R$)" : "Saldo Inicial (R$)"}
            </label>
            <input
              type="text"
              placeholder="0,00"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>

          {type === "credit_card" && (
            <div className="space-y-3 pt-2 border-t border-border">
              <div>
                <label className="text-neutral-400 font-medium block mb-1">Limite Total do Cartão (R$)</label>
                <input
                  type="text"
                  placeholder="Ex: 5000,00"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 font-medium block mb-1">Dia de Fechamento</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={closingDay}
                    onChange={(e) => setClosingDay(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-foreground"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 font-medium block mb-1">Dia de Vencimento</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={dueDay}
                    onChange={(e) => setDueDay(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-md text-foreground"
                  />
                </div>
              </div>
            </div>
          )}

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
              Salvar Conta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
