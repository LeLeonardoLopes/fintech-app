"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Target,
  TrendingUp,
  Database,
  Moon,
  Sun,
  ShieldCheck,
  User,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useFinance } from "@/context/finance-context";
import { formatMaskedCPF } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/transacoes", label: "Transações", icon: ArrowLeftRight },
  { href: "/contas", label: "Contas & Cartões", icon: CreditCard },
  { href: "/metas", label: "Metas & Orçamentos", icon: Target },
  { href: "/investimentos", label: "Investimentos & Reserva", icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSupabaseConnected, user, logout } = useFinance();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const darkPref = localStorage.getItem("fintech_theme") === "dark";
      setIsDark(darkPref);
      if (darkPref) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("fintech_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("fintech_theme", "light");
    }
  };

  if (pathname === "/login" || pathname?.startsWith("/auth")) return null;

  return (
    <aside className="w-64 border-r border-border bg-[var(--sidebar)] flex flex-col justify-between h-screen sticky top-0 select-none">
      <div>
        {/* Brand header */}
        <div className="h-14 border-b border-border flex items-center px-4 gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-sm">
            F
          </div>
          <div>
            <div className="font-semibold text-sm tracking-tight text-foreground flex items-center gap-1.5">
              Fin-Tech
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-medium">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground text-neutral-400">Finanças Pessoais</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          <div className="px-2.5 py-1.5 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
            Menu Principal
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-neutral-200/80 dark:bg-neutral-800/90 text-foreground font-semibold shadow-xs"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-foreground hover:bg-neutral-100/80 dark:hover:bg-neutral-800/40"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r-full" />
                )}
                <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-emerald-500" : "text-neutral-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Status Area */}
      <div className="p-3 border-t border-border space-y-2">
        {/* Supabase Status Pill */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-900 border border-border text-[11px]">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span className="text-neutral-600 dark:text-neutral-300">
              {isSupabaseConnected ? "Supabase Conectado" : "Modo Local / Demo"}
            </span>
          </div>
          <Database className="w-3.5 h-3.5 text-neutral-400" />
        </div>

        {/* Dentro do sistema: Apenas a opção de sair da conta selecionada */}
        {user ? (
          <button
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
            data-testid="logout-btn-sidebar"
            type="button"
            className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border bg-neutral-100/60 dark:bg-neutral-900/60 hover:bg-rose-500/10 hover:border-rose-500/30 text-foreground transition-all group cursor-pointer"
            title={`Sair da conta selecionada (${user.name})`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-semibold truncate leading-tight group-hover:text-rose-500 transition-colors">
                  {user.name}
                </p>
                <p
                  data-testid="user-cpf-badge"
                  className="text-[10px] text-neutral-400 font-mono truncate leading-tight mt-0.5"
                >
                  {user.cpf ? `CPF ${formatMaskedCPF(user.cpf)}` : user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 pl-2 shrink-0">
              <span className="text-[10px] text-neutral-400 group-hover:text-rose-500 font-medium transition-colors">
                Sair
              </span>
              <LogOut className="w-3.5 h-3.5 text-neutral-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
            </div>
          </button>
        ) : (
          <Link
            href="/login"
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors font-medium"
          >
            <span className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-emerald-500" />
              <span>Acessar o Sistema</span>
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
              Entrar
            </span>
          </Link>
        )}


        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          type="button"
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:text-foreground transition-colors"
        >
          <span className="flex items-center gap-2">
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-500" />}
            <span>{isDark ? "Tema Claro" : "Tema Escuro"}</span>
          </span>
          <span className="text-[10px] font-mono text-neutral-400 uppercase">
            {isDark ? "DARK" : "LIGHT"}
          </span>
        </button>
      </div>
    </aside>
  );
}
