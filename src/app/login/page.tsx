"use client";

import { useState, useEffect } from "react";
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
  Database,
  ShieldCheck,
  Loader2,
  MailCheck,
  RefreshCw,
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
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(null);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendConfirmation = async (targetEmail: string) => {
    if (resendingEmail || resendCooldown > 0) return;
    setResendingEmail(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    const supabase = createClient();
    if (!supabase) {
      setResendingEmail(false);
      return;
    }

    try {
      const redirectUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`;
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: targetEmail,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        setErrorMsg("Não foi possível reenviar: " + error.message);
      } else {
        setSuccessMsg(`Novo e-mail de ativação enviado para ${targetEmail}!`);
        setResendCooldown(60);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao reenviar confirmação.");
    } finally {
      setResendingEmail(false);
    }
  };

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
            email: email.trim(),
            password,
          });
          if (error) {
            if (error.message.toLowerCase().includes("email not confirmed")) {
              setErrorMsg("Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada (ou spam) para ativar sua conta.");
              setConfirmationSentTo(email.trim());
            } else if (error.message.toLowerCase().includes("invalid login credentials")) {
              setErrorMsg("E-mail ou senha incorretos. Por favor, verifique os dados digitados.");
            } else {
              setErrorMsg(error.message);
            }
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
          const targetEmail = email.trim();
          const redirectUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`;

          const { data, error } = await supabase.auth.signUp({
            email: targetEmail,
            password,
            options: {
              data: {
                full_name: fullName.trim(),
                cpf: cleanCpf,
              },
              emailRedirectTo: redirectUrl,
            },
          });

          // Bloqueio rigoroso contra duplicidade de e-mail:
          const isAlreadyRegistered =
            error?.message?.toLowerCase().includes("already registered") ||
            error?.message?.toLowerCase().includes("user already exists") ||
            (!error && data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0);

          if (isAlreadyRegistered) {
            setErrorMsg("Este e-mail já está cadastrado no sistema. Por favor, acesse a aba 'Entrar' para fazer login.");
            setLoading(false);
            return;
          }

          if (error) {
            if (error.message.toLowerCase().includes("rate limit")) {
              setErrorMsg("Muitas tentativas em pouco tempo. Aguarde alguns instantes antes de tentar novamente.");
            } else {
              setErrorMsg(error.message);
            }
            setLoading(false);
            return;
          }

          // Se a confirmação de e-mail estiver ativa (sessão é null até confirmar)
          if (!data?.session) {
            setConfirmationSentTo(targetEmail);
            setErrorMsg(null);
            setSuccessMsg(null);
          } else {
            // Caso a confirmação esteja desligada no Supabase
            if (data.user) {
              setUser({
                id: data.user.id,
                email: data.user.email || targetEmail,
                name: fullName.trim() || targetEmail.split("@")[0],
                cpf: cpf,
              });
            }
            setSuccessMsg("Conta criada e autenticada com sucesso! Redirecionando...");
            setTimeout(() => router.push("/"), 800);
          }
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Ocorreu um erro na autenticação.");
      }
    } else {
      setErrorMsg("Serviço de autenticação não inicializado. Verifique as configurações de ambiente.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-background p-6 select-none">
      {/* Top Header */}
      <div className="max-w-md mx-auto w-full flex items-center justify-end">
        {/* Supabase status badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-border text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-neutral-500 font-medium">Supabase Conectado</span>
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

        {confirmationSentTo ? (
          <div className="text-center space-y-4 py-1 animate-in fade-in-50 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 flex items-center justify-center mx-auto mb-2">
              <MailCheck className="w-7 h-7 text-emerald-500 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">Confirme seu e-mail</h2>
              <p className="text-xs text-neutral-400">
                Enviamos um link de ativação para:
              </p>
              <p className="text-xs font-mono font-semibold text-emerald-500 break-all bg-emerald-500/10 py-1 px-2.5 rounded-md inline-block">
                {confirmationSentTo}
              </p>
            </div>

            <div className="text-[11.5px] text-neutral-500 dark:text-neutral-400 leading-relaxed bg-neutral-100 dark:bg-neutral-900 p-3 rounded-lg border border-border text-left space-y-1.5">
              <p>
                ✉️ Acesse sua caixa de entrada e clique no link de confirmação para ativar sua conta antes de entrar.
              </p>
              <p className="text-[10.5px] text-neutral-400">
                Caso não encontre o e-mail em alguns instantes, verifique também sua pasta de <strong>Spam</strong> ou <strong>Lixo Eletrônico</strong>.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2 text-left">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleResendConfirmation(confirmationSentTo)}
                disabled={resendingEmail || resendCooldown > 0}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendingEmail ? "animate-spin" : ""}`} />
                <span>
                  {resendingEmail
                    ? "Reenviando link..."
                    : resendCooldown > 0
                    ? `Aguarde ${resendCooldown}s para reenviar`
                    : "Reenviar e-mail de ativação"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setConfirmationSentTo(null);
                  setMode("login");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="w-full py-2 px-3 border border-border hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-400 hover:text-foreground rounded-lg transition-colors text-xs font-medium"
              >
                Voltar para a tela de Login
              </button>
            </div>
          </div>
        ) : (
          <>
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
        </>
      )}
    </div>

      {/* Footer minimalista */}
      <div className="text-center text-[11px] text-neutral-400 space-y-1">
        <p>Fin-Tech • Gestão Financeira Pessoal Inteligente</p>
        <p className="font-mono text-[10px] text-neutral-500">PostgreSQL • Supabase Auth • RLS Enabled</p>
      </div>
    </div>
  );
}
