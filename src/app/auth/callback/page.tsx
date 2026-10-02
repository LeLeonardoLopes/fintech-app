"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useFinance } from "@/context/finance-context";
import { CheckCircle2, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setUser } = useFinance();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleAuthConfirmation = async () => {
      const supabase = createClient();
      if (!supabase) {
        setStatus("error");
        setErrorMessage("Erro ao conectar com o serviço de autenticação.");
        return;
      }

      try {
        // 1. Obter a sessão confirmada
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data.session?.user) {
          const u = data.session.user;
          setUser({
            id: u.id,
            email: u.email || "",
            name: u.user_metadata?.full_name || u.email?.split("@")[0] || "Usuário",
            cpf: u.user_metadata?.cpf,
          });
          setStatus("success");
          setTimeout(() => {
            router.replace("/");
          }, 1800);
          return;
        }

        // 2. Ouvinte de estado caso os parâmetros da URL estejam sendo processados
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === "SIGNED_IN" && session?.user) {
              const u = session.user;
              setUser({
                id: u.id,
                email: u.email || "",
                name: u.user_metadata?.full_name || u.email?.split("@")[0] || "Usuário",
                cpf: u.user_metadata?.cpf,
              });
              setStatus("success");
              setTimeout(() => {
                router.replace("/");
              }, 1800);
            }
          }
        );

        // Fallback para timeout de 4 segundos
        const timer = setTimeout(() => {
          if (status === "loading") {
            setStatus("success");
            router.replace("/login");
          }
        }, 4000);

        return () => {
          authListener.subscription.unsubscribe();
          clearTimeout(timer);
        };
      } catch (err: any) {
        console.error("Erro na confirmação:", err);
        setStatus("error");
        setErrorMessage(err.message || "O link de confirmação é inválido ou já expirou.");
      }
    };

    handleAuthConfirmation();
  }, [router, setUser, status]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-6 select-none">
      <div className="max-w-md w-full bg-card border border-border/80 rounded-2xl p-8 shadow-xl text-center space-y-6 animate-in fade-in-50 duration-300">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center text-emerald-500 font-bold text-xl mb-1">
          F
        </div>

        {status === "loading" && (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
            <h2 className="text-lg font-bold text-foreground">Confirmando seu e-mail...</h2>
            <p className="text-xs text-neutral-400">
              Estamos validando seu cadastro no Supabase. Aguarde um instante.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-foreground">E-mail Confirmado!</h2>
            <p className="text-xs text-neutral-400">
              Sua conta foi ativada com sucesso. Redirecionando para o seu painel...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 text-red-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Falha na Ativação</h2>
            <p className="text-xs text-red-400">
              {errorMessage}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition-colors"
            >
              <span>Ir para o Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
