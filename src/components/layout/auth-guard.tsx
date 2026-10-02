"use client";

import { useFinance } from "@/context/finance-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthLoading } = useFinance();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = pathname === "/login" || pathname?.startsWith("/auth");

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user && !isPublicRoute) {
        router.replace("/login");
      }
    }
  }, [user, isAuthLoading, pathname, isPublicRoute, router]);

  // Em rotas públicas (login, confirmação de email), renderiza direto
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Enquanto verifica sessão persistida
  if (isAuthLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="w-7 h-7 animate-spin text-emerald-500 mb-2" />
        <span className="text-xs text-neutral-400 font-medium">Iniciando Fin-Tech...</span>
      </div>
    );
  }

  // Se não estiver logado, não renderiza as páginas protegidas (já estará redirecionando)
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
