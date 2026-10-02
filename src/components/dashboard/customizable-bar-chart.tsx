"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart3,
  Sliders,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
} from "lucide-react";
import { Category, Transaction } from "@/lib/types";

interface ChartConfig {
  height: number; // em pixels (180 a 500)
  barThickness: number; // em pixels (12 a 48)
  borderRadius: number; // 0, 4, 8, 16, 999
  orientation: "vertical" | "horizontal";
  showValuesOnBars: boolean;
  viewMode: "categories" | "monthly_flow";
}

const defaultConfig: ChartConfig = {
  height: 220,
  barThickness: 28,
  borderRadius: 8,
  orientation: "vertical",
  showValuesOnBars: true,
  viewMode: "categories",
};

interface CustomizableBarChartProps {
  categories: Category[];
  transactions: Transaction[];
  totalExpense: number;
  totalIncome: number;
}

export function CustomizableBarChart({
  categories,
  transactions,
  totalExpense,
  totalIncome,
}: CustomizableBarChartProps) {
  const [config, setConfig] = useState<ChartConfig>(defaultConfig);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Carregar configurações visuais salvas pelo usuário
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fintech_chart_config");
      if (saved) {
        setConfig((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch {}
  }, []);

  const updateConfig = (newProps: Partial<ChartConfig>) => {
    const updated = { ...config, ...newProps };
    setConfig(updated);
    try {
      localStorage.setItem("fintech_chart_config", JSON.stringify(updated));
    } catch {}
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
    try {
      localStorage.setItem("fintech_chart_config", JSON.stringify(defaultConfig));
    } catch {}
  };

  // Dados para Modo Categorias
  const categoryData = categories
    .filter((c) => c.type === "expense")
    .map((cat) => {
      const amount = transactions
        .filter((t) => t.type === "expense" && t.category_id === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        label: cat.name,
        amount,
        color: cat.color || "#10b981",
        percent: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
      };
    })
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // Dados para Modo Comparativo Mensal (Últimos meses simulados + atual)
  const monthlyFlowData = [
    { label: "Jul", income: 6800, expense: 4200 },
    { label: "Ago", income: 7200, expense: 4600 },
    { label: "Set", income: 7100, expense: 3950 },
    { label: "Out (Atual)", income: totalIncome, expense: totalExpense },
  ];

  const maxCategoryAmount = Math.max(...categoryData.map((d) => d.amount), 1);
  const maxMonthlyAmount = Math.max(
    ...monthlyFlowData.map((d) => Math.max(d.income, d.expense)),
    1
  );

  return (
    <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4 transition-all">
      {/* Top Header com Botão de Configuração Visual */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-xs tracking-wider uppercase text-foreground">
              {config.viewMode === "categories"
                ? "Gráfico de Despesas por Categoria"
                : "Fluxo Comparativo: Receitas vs Despesas"}
            </h3>
            <p className="text-[11px] text-neutral-400">
              Análise visual de volume financeiro ({config.orientation === "vertical" ? "Barras Verticais" : "Barras Horizontais"})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Seletor de Modo */}
          <div className="flex bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg border border-border text-[11px]">
            <button
              onClick={() => updateConfig({ viewMode: "categories" })}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                config.viewMode === "categories"
                  ? "bg-white dark:bg-neutral-700 text-foreground shadow-xs font-semibold"
                  : "text-neutral-400 hover:text-foreground"
              }`}
            >
              Categorias
            </button>
            <button
              onClick={() => updateConfig({ viewMode: "monthly_flow" })}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                config.viewMode === "monthly_flow"
                  ? "bg-white dark:bg-neutral-700 text-foreground shadow-xs font-semibold"
                  : "text-neutral-400 hover:text-foreground"
              }`}
            >
              Fluxo Mensal
            </button>
          </div>

          {/* Botão de Abrir Painel de Dimensões Visuais */}
          <button
            onClick={() => setIsControlsOpen(!isControlsOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isControlsOpen
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                : "border-border bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 hover:text-foreground"
            }`}
            title="Ajustar dimensões, alturas e formas das barras"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configurar Visual</span>
            {isControlsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* PAINEL VISUAL DE AJUSTE DE DIMENSÕES (Aparece ao clicar em "Configurar Visual") */}
      {isControlsOpen && (
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-border space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Ajuste Interativo de Dimensões e Formas
            </span>
            <button
              onClick={resetConfig}
              className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-200"
            >
              <RotateCcw className="w-3 h-3" />
              Restaurar Padrão
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Altura do Gráfico */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-neutral-400">
                <span>Altura da Área:</span>
                <span className="font-mono font-semibold text-foreground">{config.height}px</span>
              </div>
              <input
                type="range"
                min={180}
                max={480}
                step={20}
                value={config.height}
                onChange={(e) => updateConfig({ height: Number(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>Baixo (180px)</span>
                <span>Alto (480px)</span>
              </div>
            </div>

            {/* Espessura das Barras */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-neutral-400">
                <span>Espessura da Barra:</span>
                <span className="font-mono font-semibold text-foreground">{config.barThickness}px</span>
              </div>
              <input
                type="range"
                min={12}
                max={56}
                step={4}
                value={config.barThickness}
                onChange={(e) => updateConfig({ barThickness: Number(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>Fina (12px)</span>
                <span>Larga (56px)</span>
              </div>
            </div>

            {/* Formas e Bordas (Border Radius) */}
            <div className="space-y-1.5">
              <span className="text-neutral-400 block">Formato das Pontas:</span>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { label: "Reto", r: 0 },
                  { label: "Suave", r: 4 },
                  { label: "Médio", r: 8 },
                  { label: "Pílula", r: 999 },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => updateConfig({ borderRadius: item.r })}
                    className={`py-1 rounded text-[11px] border font-medium transition-all ${
                      config.borderRadius === item.r
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-semibold"
                        : "border-border text-neutral-400 hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orientação (Vertical vs Horizontal) */}
            <div className="space-y-1.5">
              <span className="text-neutral-400 block">Orientação:</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => updateConfig({ orientation: "vertical" })}
                  className={`py-1.5 rounded-md text-[11px] border font-medium transition-all ${
                    config.orientation === "vertical"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-semibold"
                      : "border-border text-neutral-400 hover:text-foreground"
                  }`}
                >
                  Vertical
                </button>
                <button
                  onClick={() => updateConfig({ orientation: "horizontal" })}
                  className={`py-1.5 rounded-md text-[11px] border font-medium transition-all ${
                    config.orientation === "horizontal"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-semibold"
                      : "border-border text-neutral-400 hover:text-foreground"
                  }`}
                >
                  Horizontal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ÁREA DE RENDERIZAÇÃO DO GRÁFICO */}
      <div
        style={{ height: `${config.height}px` }}
        className="relative w-full flex items-end pt-4 pb-6 transition-all duration-300 select-none overflow-x-auto"
      >
        {/* Linhas de grade de fundo para dar referência visual elegante */}
        <div className="absolute inset-0 top-3 bottom-7 flex flex-col justify-between pointer-events-none opacity-30 px-2">
          <div className="border-b border-dashed border-border" />
          <div className="border-b border-dashed border-border" />
          <div className="border-b border-dashed border-border" />
        </div>

        {/* ================= MODO 1: CATEGORIAS ================= */}
        {config.viewMode === "categories" && (
          <>
            {config.orientation === "vertical" ? (
              // BARRAS VERTICAIS - CATEGORIAS (Centralizadas com espaçamento harmônico elegante)
              <div className="relative z-10 w-full h-full flex items-end justify-center gap-8 md:gap-14 px-4 border-b border-border/80">
                {categoryData.map((item, idx) => {
                  // Capped at 70% so the text above the bar has generous headroom and never goes above the top boundary
                  const heightPercent = Math.max(8, Math.round((item.amount / maxCategoryAmount) * 70));
                  const isHovered = hoveredIndex === idx;

                  return (
                    <div
                      key={item.label}
                      className="flex flex-col items-center justify-end h-full group relative cursor-pointer min-w-[64px]"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Tooltip flutuante no topo */}
                      <div
                        className={`absolute -top-9 px-2 py-1 rounded bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-[10px] whitespace-nowrap shadow-lg transition-all pointer-events-none z-20 ${
                          isHovered ? "opacity-100 scale-100 -translate-y-1" : "opacity-0 scale-95"
                        }`}
                      >
                        {item.label}: <strong>{formatCurrency(item.amount)}</strong> ({item.percent}%)
                      </div>

                      {/* Valor acima da barra com limite seguro */}
                      {config.showValuesOnBars && (
                        <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1 opacity-90 transition-opacity">
                          {formatCurrency(item.amount).replace("R$", "").trim()}
                        </span>
                      )}

                      {/* A Barra configurada */}
                      <div
                        style={{
                          height: `${heightPercent}%`,
                          width: `${config.barThickness}px`,
                          backgroundColor: item.color,
                          borderRadius: `${config.borderRadius}px ${config.borderRadius}px 0 0`,
                        }}
                        className="transition-all duration-300 hover:brightness-110 shadow-xs"
                      />

                      {/* Rótulo da Categoria na Base */}
                      <span
                        className="text-[11px] font-medium text-neutral-400 group-hover:text-foreground mt-2 truncate max-w-[80px] text-center"
                        title={item.label}
                      >
                        {item.label.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              // BARRAS HORIZONTAIS - CATEGORIAS
              <div className="relative z-10 w-full h-full flex flex-col justify-around gap-2 px-2 overflow-y-auto">
                {categoryData.map((item, idx) => {
                  const widthPercent = Math.max(5, Math.round((item.amount / maxCategoryAmount) * 85));

                  return (
                    <div key={item.label} className="flex items-center gap-3 text-xs group">
                      <span className="w-28 text-[11px] font-medium text-neutral-400 group-hover:text-foreground truncate text-right">
                        {item.label}
                      </span>

                      <div className="flex-1 flex items-center gap-2">
                        <div
                          style={{
                            width: `${widthPercent}%`,
                            height: `${config.barThickness}px`,
                            backgroundColor: item.color,
                            borderRadius: `0 ${config.borderRadius}px ${config.borderRadius}px 0`,
                          }}
                          className="transition-all duration-300 hover:brightness-110 shadow-xs"
                        />
                        <span className="text-[11px] font-medium text-neutral-400">
                          {formatCurrency(item.amount)} ({item.percent}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ================= MODO 2: FLUXO MENSAL (RECEITAS X DESPESAS) ================= */}
        {config.viewMode === "monthly_flow" && (
          <div className="relative z-10 w-full h-full flex items-end justify-center gap-10 md:gap-16 px-4 border-b border-border/80">
            {monthlyFlowData.map((item) => {
              const incomeHeight = Math.max(8, Math.round((item.income / maxMonthlyAmount) * 70));
              const expenseHeight = Math.max(8, Math.round((item.expense / maxMonthlyAmount) * 70));
              return (
                <div key={item.label} className="flex flex-col items-center justify-end h-full">
                  <div className="flex items-end gap-1.5">
                    {/* Barra Receita (Verde) */}
                    <div className="flex flex-col items-center">
                      {config.showValuesOnBars && (
                        <span className="text-[9px] font-semibold text-emerald-500 mb-1">
                          {formatCurrency(item.income).replace("R$", "").trim()}
                        </span>
                      )}
                      <div
                        style={{
                          height: `${incomeHeight}%`,
                          width: `${config.barThickness}px`,
                          borderRadius: `${config.borderRadius}px ${config.borderRadius}px 0 0`,
                        }}
                        className="bg-emerald-500 transition-all duration-300 hover:brightness-110"
                        title={`Receita: ${formatCurrency(item.income)}`}
                      />
                    </div>

                    {/* Barra Despesa (Vermelha) */}
                    <div className="flex flex-col items-center">
                      {config.showValuesOnBars && (
                        <span className="text-[9px] font-semibold text-red-500 mb-1">
                          {formatCurrency(item.expense).replace("R$", "").trim()}
                        </span>
                      )}
                      <div
                        style={{
                          height: `${expenseHeight}%`,
                          width: `${config.barThickness}px`,
                          borderRadius: `${config.borderRadius}px ${config.borderRadius}px 0 0`,
                        }}
                        className="bg-red-500 transition-all duration-300 hover:brightness-110"
                        title={`Despesa: ${formatCurrency(item.expense)}`}
                      />
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-neutral-400 mt-2">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legenda do Gráfico */}
      <div className="flex flex-wrap items-center justify-between text-xs text-neutral-400 pt-1 border-t border-border/60">
        {config.viewMode === "monthly_flow" ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Receitas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Despesas</span>
            </div>
          </div>
        ) : (
          <div className="text-[11px]">
            Mostrando <strong>{categoryData.length} categorias</strong> com lançamentos
          </div>
        )}

        <span className="text-[11px] font-mono text-neutral-400">
          Dimensões ativas: {config.height}px altura • {config.barThickness}px espessura
        </span>
      </div>
    </div>
  );
}
