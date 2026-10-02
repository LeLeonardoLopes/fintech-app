"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Account, Category, Goal, Investment, Transaction, UserProfile } from "@/lib/types";
import {
  initialAccounts,
  initialCategories,
  initialGoals,
  initialInvestments,
  initialTransactions,
} from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_USER: UserProfile = {
  id: "usr-demo",
  name: "Leonardo Silva",
  email: "leonardo@fintech.com",
  cpf: "123.456.789-09",
};

interface FinanceContextType {
  user: UserProfile | null;
  isAuthLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  logout: () => Promise<void>;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  goals: Goal[];
  investments: Investment[];
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
  isSupabaseConnected: boolean;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (acc: Omit<Account, "id">) => void;
  addGoal: (goal: Omit<Goal, "id">) => void;
  addInvestment: (inv: Omit<Investment, "id">) => void;
  addCategory: (cat: Omit<Category, "id">) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  isNewTxModalOpen: boolean;
  setIsNewTxModalOpen: (open: boolean) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [investments, setInvestments] = useState<Investment[]>(initialInvestments);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date(2026, 9, 1)); // Outubro 2026
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);

  const fetchUserData = async (userId: string) => {
    const supabase = createClient();
    if (!supabase) return;

    try {
      const [accRes, catRes, txRes, goalRes, invRes] = await Promise.all([
        supabase.from("accounts").select("*").eq("user_id", userId),
        supabase.from("categories").select("*").eq("user_id", userId),
        supabase.from("transactions").select("*").eq("user_id", userId).order("date", { ascending: false }),
        supabase.from("goals").select("*").eq("user_id", userId),
        supabase.from("investments").select("*").eq("user_id", userId),
      ]);

      if (accRes.data && accRes.data.length > 0) setAccounts(accRes.data as any);
      if (catRes.data && catRes.data.length > 0) setCategories(catRes.data as any);
      if (txRes.data && txRes.data.length > 0) setTransactions(txRes.data as any);
      if (goalRes.data && goalRes.data.length > 0) setGoals(goalRes.data as any);
      if (invRes.data && invRes.data.length > 0) setInvestments(invRes.data as any);
    } catch (err) {
      console.error("Erro ao sincronizar dados com o Supabase:", err);
    }
  };

  // Carregar dados salvos no localStorage no primeiro load se houver
  useEffect(() => {
    const supabase = createClient();
    let authSub: { unsubscribe: () => void } | null = null;

    if (supabase) {
      setIsSupabaseConnected(true);
      // Checar sessão do Supabase se houver
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const profile: UserProfile = {
            id: session.user.id,
            email: session.user.email || "usuario@supabase.com",
            name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Usuário",
            cpf: session.user.user_metadata?.cpf,
          };
          setUser(profile);
          fetchUserData(session.user.id);
          try {
            localStorage.setItem("fintech_user", JSON.stringify(profile));
            localStorage.removeItem("fintech_logged_out");
          } catch {}
        }
        setIsAuthLoading(false);
      }).catch(() => {
        setIsAuthLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const profile: UserProfile = {
            id: session.user.id,
            email: session.user.email || "usuario@supabase.com",
            name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Usuário",
            cpf: session.user.user_metadata?.cpf,
          };
          setUser(profile);
          fetchUserData(session.user.id);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      });
      authSub = subscription;
    } else {
      setIsAuthLoading(false);
    }

    try {
      const loggedOut = localStorage.getItem("fintech_logged_out");
      const savedUser = localStorage.getItem("fintech_user");
      if (loggedOut === "true" || !savedUser) {
        setUser(null);
      } else {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      }

      const savedCat = localStorage.getItem("fintech_categories");
      if (savedCat) setCategories(JSON.parse(savedCat));

      const savedTx = localStorage.getItem("fintech_transactions");
      if (savedTx) setTransactions(JSON.parse(savedTx));

      const savedAcc = localStorage.getItem("fintech_accounts");
      if (savedAcc) setAccounts(JSON.parse(savedAcc));

      const savedGoals = localStorage.getItem("fintech_goals");
      if (savedGoals) setGoals(JSON.parse(savedGoals));

      const savedInv = localStorage.getItem("fintech_investments");
      if (savedInv) setInvestments(JSON.parse(savedInv));
    } catch {
      // Ignora erro no SSR
    }

    return () => {
      if (authSub) authSub.unsubscribe();
    };
  }, []);

  const addTransaction = (txData: Omit<Transaction, "id">) => {
    const newTx: Transaction = {
      ...txData,
      id: "tx-" + Date.now(),
      created_at: new Date().toISOString(),
    };

    const updated = [newTx, ...transactions];
    setTransactions(updated);
    try {
      localStorage.setItem("fintech_transactions", JSON.stringify(updated));
    } catch {}

    // Sincronizar com o Supabase se logado
    const supabase = createClient();
    if (supabase && user && !user.id.startsWith("usr-demo")) {
      supabase.from("transactions").insert({
        ...txData,
        user_id: user.id,
      }).then(({ error }) => {
        if (error) console.error("Erro ao salvar transação no Supabase:", error);
      });
    }

    // Atualizar saldo da conta/cartão automaticamente
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === txData.account_id) {
          const delta = txData.type === "income" ? txData.amount : -txData.amount;
          return {
            ...acc,
            balance: acc.balance + delta,
            available_limit:
              acc.type === "credit_card" && acc.available_limit !== undefined
                ? acc.available_limit - txData.amount
                : acc.available_limit,
          };
        }
        return acc;
      })
    );
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    try {
      localStorage.setItem("fintech_transactions", JSON.stringify(updated));
    } catch {}

    const supabase = createClient();
    if (supabase && user && !user.id.startsWith("usr-demo")) {
      supabase.from("transactions").delete().eq("id", id).then(({ error }) => {
        if (error) console.error("Erro ao deletar transação no Supabase:", error);
      });
    }
  };

  const addAccount = (accData: Omit<Account, "id">) => {
    const newAcc: Account = {
      ...accData,
      id: "acc-" + Date.now(),
      created_at: new Date().toISOString(),
    };
    const updated = [...accounts, newAcc];
    setAccounts(updated);
    try {
      localStorage.setItem("fintech_accounts", JSON.stringify(updated));
    } catch {}

    const supabase = createClient();
    if (supabase && user && !user.id.startsWith("usr-demo")) {
      supabase.from("accounts").insert({
        ...accData,
        user_id: user.id,
      }).then(({ error }) => {
        if (error) console.error("Erro ao salvar conta no Supabase:", error);
      });
    }
  };

  const addGoal = (goalData: Omit<Goal, "id">) => {
    const newGoal: Goal = {
      ...goalData,
      id: "goal-" + Date.now(),
      created_at: new Date().toISOString(),
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    try {
      localStorage.setItem("fintech_goals", JSON.stringify(updated));
    } catch {}

    const supabase = createClient();
    if (supabase && user && !user.id.startsWith("usr-demo")) {
      supabase.from("goals").insert({
        ...goalData,
        user_id: user.id,
      }).then(({ error }) => {
        if (error) console.error("Erro ao salvar meta no Supabase:", error);
      });
    }
  };

  const addInvestment = (invData: Omit<Investment, "id">) => {
    const newInv: Investment = {
      ...invData,
      id: "inv-" + Date.now(),
      created_at: new Date().toISOString(),
    };
    const updated = [...investments, newInv];
    setInvestments(updated);
    try {
      localStorage.setItem("fintech_investments", JSON.stringify(updated));
    } catch {}

    const supabase = createClient();
    if (supabase && user && !user.id.startsWith("usr-demo")) {
      supabase.from("investments").insert({
        ...invData,
        user_id: user.id,
      }).then(({ error }) => {
        if (error) console.error("Erro ao salvar investimento no Supabase:", error);
      });
    }
  };

  const addCategory = async (catData: Omit<Category, "id">): Promise<Category> => {
    const newCat: Category = {
      ...catData,
      id: "cat-" + Date.now(),
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    try {
      localStorage.setItem("fintech_categories", JSON.stringify(updated));
    } catch {}

    const supabase = createClient();
    if (supabase && user && !user.id.startsWith("usr-demo")) {
      try {
        const { data, error } = await supabase.from("categories").insert({
          name: catData.name,
          type: catData.type,
          icon: catData.icon || "Tag",
          color: catData.color || "#10b981",
          user_id: user.id,
        }).select().single();

        if (!error && data) {
          const syncedCat = data as Category;
          setCategories((prev) => prev.map((c) => (c.id === newCat.id ? syncedCat : c)));
          return syncedCat;
        }
      } catch (err) {
        console.error("Erro ao salvar categoria no Supabase:", err);
      }
    }
    return newCat;
  };

  const deleteCategory = async (id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    try {
      localStorage.setItem("fintech_categories", JSON.stringify(updated));
    } catch {}

    const supabase = createClient();
    if (supabase && user && !user.id.startsWith("usr-demo")) {
      try {
        await supabase.from("categories").delete().eq("id", id);
      } catch (err) {
        console.error("Erro ao deletar categoria no Supabase:", err);
      }
    }
  };

  const handleSetUser = (newUser: UserProfile | null) => {
    setUser(newUser);
    try {
      if (newUser) {
        localStorage.setItem("fintech_user", JSON.stringify(newUser));
        localStorage.removeItem("fintech_logged_out");
      } else {
        localStorage.removeItem("fintech_user");
        localStorage.setItem("fintech_logged_out", "true");
      }
    } catch {}
  };

  const logout = async () => {
    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Erro ao deslogar do Supabase:", err);
      }
    }
    handleSetUser(null);
  };

  return (
    <FinanceContext.Provider
      value={{
        user,
        isAuthLoading,
        setUser: handleSetUser,
        logout,
        accounts,
        categories,
        transactions,
        goals,
        investments,
        selectedMonth,
        setSelectedMonth,
        isSupabaseConnected,
        addTransaction,
        deleteTransaction,
        addAccount,
        addGoal,
        addInvestment,
        addCategory,
        deleteCategory,
        isNewTxModalOpen,
        setIsNewTxModalOpen,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance deve ser usado dentro de um FinanceProvider");
  }
  return context;
}
