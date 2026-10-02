import { Account, Category } from "./types";

export const DEFAULT_CATEGORIES: Category[] = [
  // Despesas
  { id: "cat-alim", name: "Alimentação & Mercado", type: "expense", icon: "Utensils", color: "#f97316" },
  { id: "cat-morad", name: "Moradia & Contas", type: "expense", icon: "Home", color: "#3b82f6" },
  { id: "cat-transp", name: "Transporte & Combustível", type: "expense", icon: "Car", color: "#eab308" },
  { id: "cat-lazer", name: "Lazer & Assinaturas", type: "expense", icon: "Film", color: "#a855f7" },
  { id: "cat-saude", name: "Saúde & Farmácia", type: "expense", icon: "HeartPulse", color: "#ef4444" },
  { id: "cat-educ", name: "Educação & Cursos", type: "expense", icon: "GraduationCap", color: "#06b6d4" },
  { id: "cat-comp", name: "Compras & Vestuário", type: "expense", icon: "ShoppingBag", color: "#ec4899" },
  // Receitas
  { id: "cat-sal", name: "Salário / Pro-labore", type: "income", icon: "Briefcase", color: "#10b981" },
  { id: "cat-free", name: "Freelance / Extra", type: "income", icon: "Zap", color: "#14b8a6" },
  { id: "cat-rend", name: "Rendimentos & Dividendos", type: "income", icon: "TrendingUp", color: "#6366f1" },
];

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: "acc-principal",
    name: "Conta Principal",
    type: "checking",
    institution: "Carteira / Banco",
    balance: 0.0,
    color: "#10b981",
  },
];
