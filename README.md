# 📊 Fin-Tech — Gestão Financeira Pessoal

> Uma plataforma moderna, ágil e segura para você gerenciar receitas, despesas, contas, cartões, metas e investimentos em tempo real.

Conectado nativamente ao **Supabase (PostgreSQL com Row Level Security)** e construído em **Next.js 14 + Tailwind CSS**.

---

## 🚀 Destaques Rápidos

- 💳 **Gestão Completa de Contas & Cartões:** Acompanhe saldos bancários e faturas com limites visuais.
- 🏷️ **Categorias Autônomas:** Cada usuário cria, personaliza (com cores e ícones) e deleta suas próprias categorias de forma independente.
- ⚡ **Atualização Imediata:** Novos lançamentos e exclusões recalculam saldos e faturas instantaneamente.
- 🎯 **Metas & Tetos de Gastos:** Estabeleça tetos orçamentários por categoria e acompanhe objetivos.
- 📈 **Investimentos & Reserva de Emergência:** Cálculo automático de colchão de segurança recomendado.
- 🔒 **Segurança por Linha (RLS):** Seus dados são totalmente isolados; cada usuário acessa somente o que lhe pertence.
- 🌓 **Modo Escuro / Claro:** Alternância suave de tema e tipografia balanceada em Tahoma.

---

## 📖 Documentação Completa

Para detalhes sobre arquitetura, módulos, banco de dados, fluxo de autenticação e passos de configuração, consulte:
👉 **[DOCUMENTACAO.md](./DOCUMENTACAO.md)**

---

## 🛠️ Como Iniciar

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente (.env.local baseado em .env.example)
# NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui

# 3. Rodar em ambiente de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.
