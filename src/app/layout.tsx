import type { Metadata } from "next";
import "./globals.css";
import { FinanceProvider } from "@/context/finance-context";
import { Sidebar } from "@/components/layout/sidebar";
import { NewTransactionModal } from "@/components/transactions/new-transaction-modal";

export const metadata: Metadata = {
  title: "Fin-Tech | Gestão Financeira Pessoal Minimalista",
  description: "Controle de despesas, contas, cartões de crédito e metas com design refinado.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased min-h-screen bg-background text-foreground flex">
        <FinanceProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
            {children}
          </div>
          <NewTransactionModal />
        </FinanceProvider>
      </body>
    </html>
  );
}
