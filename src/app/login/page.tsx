"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Database,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useFinance } from "@/context/finance-context";
import { maskCPF, isValidCPF } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { isSupabaseConnected, setUser } = useFinance();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [cpfError, setCpfError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCPF(e.target.value);
    setCpf(masked);
    const clean = masked.replace(/\D/g, "");
    if (clean.length === 11) {
      if (!isValidCPF(clean)) {
        setCpfError("CPF inválido (dígitos verificadores incorretos)");
      } else {
        setCpfError(null);
      }
    } else {
      if (clean.length > 0 && clean.length < 11) {
        setCpfError("CPF incompleto (informe 11 dígitos)");
      } else {
        setCpfError(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validação estrita do CPF no cadastro
    if (mode === "signup") {
      const cleanCPF = cpf.replace(/\D/g, "");
      if (!cleanCPF) {
        setErrorMsg("Por favor, informe seu CPF para realizar o cadastro.");
        return;
      }
      if (!isValidCPF(cleanCPF)) {
        setErrorMsg("O CPF informado é inválido. Por favor, verifique os dígitos digitados.");
        return;
      }
    }

    setLoading(true);

    const supabase = createClient();

    // Se o Supabase estiver configurado com chaves reais:
    if (supabase) {
      try {
        if (mode === "login") {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) {
            setErrorMsg(error.message);
          } else {
            setUser({
              id: data.user?.id || "usr-sb",
              email: data.user?.email || email,
              name: data.user?.user_metadata?.full_name || email.split("@")[0],
              cpf: data.user?.user_metadata?.cpf,
            });
            setSuccessMsg("Login realizado com sucesso! Redirecionando...");
            setTimeout(() => router.push("/"), 800);
          }
        } else {
          const cleanCpf = cpf.replace(/\D/g, "");
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                cpf: cleanCpf,
              },
            },
          });
          if (error) {
            setErrorMsg(error.message);
          } else {
            if (data.user) {
              setUser({
                id: data.user.id,
                email: data.user.email || email,
                name: fullName || email.split("@")[0],
                cpf: cpf,
              });
            }
            if (data.session) {
              setSuccessMsg("Conta criada e autenticada com sucesso! Redirecionando...");
              setTimeout(() => router.push("/"), 800);
            } else {
              setSuccessMsg("Conta criada com sucesso no Supabase! Verifique seu e-mail para confirmar ou acesse com seu login.");
            }
          }
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Ocorreu um erro na autenticação.");
      }
    } else {
      // Modo Local / Demo (sem Supabase conectado ainda)
      const demoUser = {
        id: "usr-" + Date.now(),
        name: fullName.trim() || (email ? email.split("@")[0] : "Leonardo Silva"),
        email: email.trim() || "leonardo@fintech.com",
        cpf: cpf.trim() || "123.456.789-09",
      };
      setUser(demoUser);

      setTimeout(() => {
        setSuccessMsg(
          mode === "login"
            ? "Autenticado no Modo Demonstração/Local! Redirecionando..."
            : "Conta de demonstração criada com sucesso! Redirecionando..."
        );
        setTimeout(() => router.push("/"), 700);
      }, 400);
    }

    setLoading(false);
  };

  const handleDemoAccess = () => {
    setUser({
      id: "usr-demo",
      name: "Leonardo Silva",
      email: "leonardo@fintech.com",
      cpf: "123.456.789-09",
    });
    router.push("/");
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-background p-6 select-none">
      {/* Top Header */}
      <div className="max-w-md mx-auto w-full flex items-center justify-end">
        {/* Supabase status badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-border text-[11px]">
          <span
            className={`w-2 h-2 rounded-full ${
              isSupabaseConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          <span className="text-neutral-500">
            {isSupabaseConnected ? "Supabase Conectado" : "Modo Local / Demo"}
          </span>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-md mx-auto w-full bg-card border border-border/80 rounded-2xl p-7 shadow-lg my-8 space-y-6">
        {/* Brand & Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center text-emerald-500 font-bold text-lg mb-1">
            F
          </div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Fin-Tech</h1>
          <p className="text-xs text-neutral-400">
            {mode === "login"
              ? "Entre na sua conta para sincronizar suas finanças"
              : "Crie sua conta para gerenciar seu patrimônio"}
          </p>
        </div>

        {/* Tabs: Entrar vs Criar Conta */}
        <div className="grid grid-cols-2 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-border text-xs">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-1.5 rounded-md font-medium transition-all ${
              mode === "login"
                ? "bg-white dark:bg-neutral-800 text-foreground shadow-xs font-semibold"
                : "text-neutral-400 hover:text-foreground"
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-1.5 rounded-md font-medium transition-all ${
              mode === "signup"
                ? "bg-white dark:bg-neutral-800 text-foreground shadow-xs font-semibold"
                : "text-neutral-400 hover:text-foreground"
            }`}
          >
            Criar Conta
          </button>
        </div>

        {/* Mensagens de Alerta */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === "signup" && (
            <>
              {/* Campo CPF com Validação Matemática */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-neutral-400 font-medium">CPF (Cadastro de Pessoa Física)</label>
                  {cpf.replace(/\D/g, "").length === 11 && (
                    <span
                      className={`text-[10px] font-medium flex items-center gap-1 ${
                        isValidCPF(cpf) ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {isValidCPF(cpf) ? "✓ CPF Válido" : "✕ CPF Inválido"}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <ShieldCheck
                    className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                      isValidCPF(cpf)
                        ? "text-emerald-500"
                        : cpfError
                        ? "text-rose-500"
                        : "text-neutral-400"
                    }`}
                  />
                  <input
                    type="text"
                    data-testid="input-cpf"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={handleCpfChange}
                    maxLength={14}
                    required={mode === "signup"}
                    className={`w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-900 border rounded-lg text-foreground font-mono focus:outline-hidden focus:ring-1 transition-all ${
                      isValidCPF(cpf)
                        ? "border-emerald-500/50 focus:ring-emerald-500"
                        : cpfError
                        ? "border-rose-500/50 focus:ring-rose-500"
                        : "border-border focus:ring-emerald-500"
                    }`}
                  />
                </div>

                {cpfError && (
                  <p data-testid="cpf-error-msg" className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <span>⚠ {cpfError}</span>
                  </p>
                )}
              </div>

              {/* Nome Completo */}
              <div>
                <label className="text-neutral-400 font-medium block mb-1">Nome Completo</label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    data-testid="input-fullname"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={mode === "signup"}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-neutral-400 font-medium block mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-neutral-400 font-medium">Senha</label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => alert("Para redefinir a senha, utilize o link de redefinição do Supabase.")}
                  className="text-[11px] text-neutral-400 hover:text-emerald-500 transition-colors"
                >
                  Esqueceu a senha?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-9 pr-10 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-neutral-400 hover:text-foreground absolute right-2.5 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? "Processando..." : mode === "login" ? "Entrar na Conta" : "Criar Minha Conta"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divisor */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-border w-full" />
          <span className="bg-card px-2 text-[11px] text-neutral-400 uppercase font-mono absolute">
            ou
          </span>
        </div>

        {/* Botão de Demonstração / Acesso Rápido */}
        <button
          type="button"
          onClick={handleDemoAccess}
          className="w-full py-2 px-3 border border-border hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:text-foreground rounded-lg transition-colors text-xs font-medium flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Continuar no Modo Local / Demonstração</span>
        </button>
      </div>

      {/* Footer minimalista */}
      <div className="text-center text-[11px] text-neutral-400 space-y-1">
        <p>Fin-Tech • Gestão Financeira Pessoal Inteligente</p>
        <p className="font-mono text-[10px] text-neutral-500">PostgreSQL • Supabase Auth • RLS Enabled</p>
      </div>
    </div>
  );
}
