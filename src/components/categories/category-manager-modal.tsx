"use client";

import { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Tag,
  Utensils,
  Home,
  Car,
  Film,
  ShoppingBag,
  Zap,
  HeartPulse,
  Briefcase,
  GraduationCap,
  Plane,
  Dumbbell,
  Sparkles,
  Coffee,
  Gift,
  Check,
} from "lucide-react";
import { useFinance } from "@/context/finance-context";
import { Category } from "@/lib/types";

const AVAILABLE_ICONS = [
  { name: "Tag", component: Tag },
  { name: "Utensils", component: Utensils },
  { name: "Home", component: Home },
  { name: "Car", component: Car },
  { name: "Film", component: Film },
  { name: "ShoppingBag", component: ShoppingBag },
  { name: "Zap", component: Zap },
  { name: "HeartPulse", component: HeartPulse },
  { name: "Briefcase", component: Briefcase },
  { name: "GraduationCap", component: GraduationCap },
  { name: "Plane", component: Plane },
  { name: "Dumbbell", component: Dumbbell },
  { name: "Coffee", component: Coffee },
  { name: "Gift", component: Gift },
  { name: "Sparkles", component: Sparkles },
];

const AVAILABLE_COLORS = [
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#64748b", // Slate
];

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCreatedCategory?: (category: Category) => void;
  initialType?: "expense" | "income";
}

export function CategoryManagerModal({
  isOpen,
  onClose,
  onSelectCreatedCategory,
  initialType = "expense",
}: CategoryManagerModalProps) {
  const { categories, addCategory, deleteCategory } = useFinance();

  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [name, setName] = useState("");
  const [type, setType] = useState<"expense" | "income">(initialType);
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState("Tag");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const created = await addCategory({
        name: name.trim(),
        type,
        color: selectedColor,
        icon: selectedIcon,
      });

      setName("");
      if (onSelectCreatedCategory) {
        onSelectCreatedCategory(created);
        onClose();
      } else {
        setActiveTab("list");
      }
    } finally {
      setSaving(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const item = AVAILABLE_ICONS.find((i) => i.name === iconName);
    const IconComp = item ? item.component : Tag;
    return <IconComp className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-lg bg-white dark:bg-[#121316] border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in-50 zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Tipos de Gastos & Categorias
            </h2>
            <p className="text-[11px] text-neutral-400">
              Personalize suas sessões de despesas e receitas
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs: Minhas Categorias vs Nova Categoria */}
        <div className="flex border-b border-border text-xs px-4 pt-2 gap-4">
          <button
            onClick={() => setActiveTab("list")}
            className={`pb-2.5 font-medium border-b-2 transition-colors ${
              activeTab === "list"
                ? "border-emerald-500 text-foreground"
                : "border-transparent text-neutral-400 hover:text-foreground"
            }`}
          >
            Minhas Categorias ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab("create")}
            data-testid="tab-create-category"
            className={`pb-2.5 font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "create"
                ? "border-emerald-500 text-foreground"
                : "border-transparent text-neutral-400 hover:text-foreground"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Nova Categoria</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 overflow-y-auto flex-1">
          {activeTab === "list" ? (
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-2.5 rounded-lg border border-border bg-neutral-50 dark:bg-neutral-900/60 flex items-center justify-between gap-2 group hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: cat.color || "#10b981" }}
                      >
                        {getIconComponent(cat.icon)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {cat.name}
                        </p>
                        <p className="text-[10px] text-neutral-400 capitalize">
                          {cat.type === "expense" ? "Despesa" : "Receita"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="p-1 rounded text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 opacity-60 group-hover:opacity-100 transition-all"
                      title="Excluir categoria"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-3">
                <button
                  onClick={() => setActiveTab("create")}
                  className="w-full py-2 border border-dashed border-border hover:border-emerald-500/50 rounded-lg text-xs text-neutral-500 hover:text-emerald-500 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Tipo Personalizado</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              {/* Nome */}
              <div>
                <label className="block text-neutral-400 font-medium mb-1">
                  Nome da Categoria / Sessão
                </label>
                <input
                  type="text"
                  data-testid="input-category-name"
                  placeholder="Ex: Cursos & Livros, Pet Shop, Games..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all text-xs"
                />
              </div>

              {/* Tipo: Despesa ou Receita */}
              <div>
                <label className="block text-neutral-400 font-medium mb-1">
                  Tipo de Fluxo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType("expense")}
                    className={`py-2 px-3 rounded-lg border font-medium flex items-center justify-center gap-1.5 transition-all ${
                      type === "expense"
                        ? "border-rose-500 bg-rose-500/10 text-rose-500 font-semibold"
                        : "border-border text-neutral-400 hover:text-foreground"
                    }`}
                  >
                    Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("income")}
                    className={`py-2 px-3 rounded-lg border font-medium flex items-center justify-center gap-1.5 transition-all ${
                      type === "income"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-semibold"
                        : "border-border text-neutral-400 hover:text-foreground"
                    }`}
                  >
                    Receita
                  </button>
                </div>
              </div>

              {/* Seletor de Cores */}
              <div>
                <label className="block text-neutral-400 font-medium mb-1.5">
                  Cor de Identificação
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                      style={{ backgroundColor: col }}
                    >
                      {selectedColor === col && (
                        <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seletor de Ícones */}
              <div>
                <label className="block text-neutral-400 font-medium mb-1.5">
                  Ícone Representativo
                </label>
                <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1 border border-border rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
                  {AVAILABLE_ICONS.map((item) => {
                    const IconComp = item.component;
                    const isSelected = selectedIcon === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setSelectedIcon(item.name)}
                        className={`p-2 rounded-md flex flex-col items-center justify-center gap-1 transition-all ${
                          isSelected
                            ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 font-semibold"
                            : "text-neutral-400 hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        }`}
                        title={item.name}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botão Salvar */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setActiveTab("list")}
                  className="px-3 py-1.5 border border-border rounded-lg text-neutral-400 hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  data-testid="submit-create-category"
                  disabled={saving || !name.trim()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs transition-all"
                >
                  {saving ? "Salvando..." : "Criar Categoria"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
