export type AccountType = "checking" | "credit_card" | "cash" | "savings" | "investment";

export interface Account {
  id: string;
  user_id?: string;
  name: string;
  type: AccountType;
  institution: string; // ex: Nubank, Itaú, Inter, Dinheiro
  balance: number;
  color?: string;
  // Campos específicos para cartão de crédito
  credit_limit?: number;
  available_limit?: number;
  closing_day?: number;
  due_day?: number;
  created_at?: string;
}

export type TransactionType = "expense" | "income" | "transfer";
export type TransactionStatus = "completed" | "pending";

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  user_id?: string;
  description: string;
  amount: number;
  type: TransactionType;
  category_id: string;
  category?: Category;
  account_id: string;
  account?: Account;
  date: string;
  status: TransactionStatus;
  notes?: string;
  attachment_url?: string;
  tags?: string[];
  // Recorrência e parcelamento
  is_recurring?: boolean;
  recurrence_period?: "monthly" | "weekly" | "yearly";
  is_installment?: boolean;
  installment_current?: number;
  installment_total?: number;
  parent_transaction_id?: string;
  created_at?: string;
}

export interface Goal {
  id: string;
  user_id?: string;
  title: string;
  target_amount: number;
  current_amount: number;
  category_id?: string;
  deadline?: string;
  color?: string;
  type: "saving" | "budget_limit"; // meta de economia ou teto de gastos mensal
  created_at?: string;
}

export type InvestmentType = "emergency_fund" | "fixed_income" | "equities" | "fii" | "crypto";

export interface Investment {
  id: string;
  user_id?: string;
  name: string;
  type: InvestmentType;
  institution: string;
  amount_invested: number;
  current_value: number;
  liquidity: "immediate" | "d+1" | "d+30" | "long_term";
  notes?: string;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  cpf?: string;
  avatar_url?: string;
}
