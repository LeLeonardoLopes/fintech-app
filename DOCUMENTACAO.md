# 📊 Fin-Tech — Gestão Financeira Pessoal Inteligente

O **Fin-Tech** é uma plataforma moderna e intuitiva desenvolvida para você ter controle total e descomplicado da sua vida financeira. Com uma interface limpa, rápida e responsiva, o sistema reúne em um só lugar suas contas bancárias, cartões de crédito, transações diárias, planejamento de metas e acompanhamento de investimentos.

O projeto foi construído com foco em **clareza visual**, **autonomia do usuário** e **segurança de dados**, conectando um front-end ágil a um banco de dados em nuvem com isolamento individual por usuário.

---

## 🧭 Sumário

1. [Visão Geral e Diferenciais](#-visão-geral-e-diferenciais)
2. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
3. [Módulos do Sistema](#-módulos-do-sistema)
4. [Categorias Autônomas e Personalizadas](#-categorias-autônomas-e-personalizadas)
5. [Como Funciona o Banco de Dados (Supabase & RLS)](#-como-funciona-o-banco-de-dados-supabase--rls)
6. [Como Executar o Projeto Localmente](#-como-executar-o-projeto-localmente)
7. [Subindo para o Git e Vinculando ao Supabase](#-subindo-para-o-git-e-vinculando-ao-supabase)
8. [Estrutura de Pastas do Projeto](#-estrutura-de-pastas-do-projeto)

---

## 🌟 Visão Geral e Diferenciais

- **Design Minimalista e Eficiente:** Inspirado nos melhores padrões de usabilidade, com tipografia legível (Tahoma), espaçamentos balanceados e suporte nativo a temas Claro (Light) e Escuro (Dark).
- **Controle em Tempo Real:** Atualizações imediatas de saldo disponível, despesas consolidadas e projeções mensais a cada lançamento ou exclusão.
- **Autonomia Total:** Sem categorias engessadas. Você cria suas próprias categorias de gastos ou receitas com o nome, cor e ícone que fizerem sentido para a sua rotina.
- **Reserva de Emergência sob Medida:** Cálculo dinâmico que analisa seus gastos médios e indica quantos meses de segurança financeira você possui.
- **Privacidade por Padrão:** Cada usuário só enxerga e gerencia seus próprios dados.

---

## 🛠️ Tecnologias Utilizadas

- **Front-end:** [Next.js](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) com paleta moderna e modo escuro integrado
- **Ícones:** [Lucide React](https://lucide.dev/) (ícones vetoriais leves e consistentes)
- **Banco de Dados & Autenticação:** [Supabase](https://supabase.com/) (PostgreSQL relacional com Row Level Security)
- **Testes Automatizados:** [Playwright](https://playwright.dev/) para validação contínua de fluxos ponta a ponta

---

## 📱 Módulos do Sistema

### 1. 📈 Dashboard Geral (`/`)
- **Cards de Indicadores (KPIs):** Saldo total em contas, receitas do mês, despesas do mês e total de faturas de cartão abertas.
- **Gráfico de Fluxo Mensal:** Visualização interativa de entradas versus saídas ao longo dos meses, com alternador de orientação (vertical/horizontal) e filtros de períodos.
- **Últimos Lançamentos:** Listagem das transações mais recentes com opção rápida de exclusão e visualização de badges categorizados.

### 2. 💳 Transações (`/transacoes`)
- Extrato completo de movimentações com filtros por tipo (todas, despesas, receitas), categorias específicas e busca textual por descrição.
- Modal completo de **Novo Lançamento** com escolha de conta de origem, data, valor, categoria e tipo de movimentação.

### 3. 🏦 Contas & Cartões (`/contas`)
- Gestão centralizada de contas correntes, contas digitais, carteiras e contas poupança.
- Acompanhamento de cartões de crédito com barra visual de consumo do limite, data de vencimento e valor da fatura atual.

### 4. 🎯 Metas & Tetos de Gastos (`/metas`)
- Definição de objetivos financeiros (ex: Viagem, Fundo de Oportunidade, Reforma) com valor alvo, valor já guardado e prazo estipulado.
- Tetos mensais por categoria para você ser alertado visualmente caso esteja próximo do limite estipulado no mês.

### 5. 💼 Investimentos & Reserva (`/investimentos`)
- Painel de patrimônio investido dividido por classes (Renda Fixa, Ações, FIIs, Fundos, Cripto).
- **Calculadora Automática de Reserva de Emergência:** Estima o valor ideal para 6 ou 12 meses de cobertura com base nos seus gastos reais.

### 6. 🔐 Autenticação & Perfil (`/login`)
- Acesso com e-mail e senha diretamente integrado ao Supabase Auth.
- Modo demonstração para navegação rápida e validação de funcionalidades.

---

## 🏷️ Categorias Autônomas e Personalizadas

No Fin-Tech, não existem listas fixas que não combinam com a sua realidade. Você tem controle total:

1. **Criação pelo Gerenciador de Categorias:**
   - Acesse a tela de **Transações** e clique no botão **Categorias**.
   - Defina o nome, escolha se é uma categoria de Despesa ou Receita, selecione uma entre as cores vibrantes disponíveis e escolha um ícone representativo.
2. **Criação Rápida durante o Lançamento:**
   - Ao abrir o modal de **Nova Transação**, clique no botão **+ Nova** ao lado do seletor de categorias.
   - Crie a nova categoria sem interromper o fluxo; ela é salva no seu banco de dados e já fica selecionada para o lançamento em andamento.
3. **Exclusão Segura:**
   - Remova categorias que não utiliza mais diretamente pelo gerenciador.

---

## 🔒 Como Funciona o Banco de Dados (Supabase & RLS)

O Fin-Tech utiliza o **PostgreSQL** hospedado no Supabase. O grande diferencial de segurança é a ativação do **Row Level Security (RLS)** em todas as tabelas.

### O que é o RLS na prática?
Em um banco de dados tradicional, se você fizesse uma busca direta, poderia ver linhas de outros usuários caso a consulta não tivesse um filtro estrito. Com o RLS ativo no motor do PostgreSQL:
- O banco valida automaticamente quem está autenticado (`auth.uid() = user_id`).
- Mesmo que uma requisição tente acessar dados sem filtro, o próprio PostgreSQL bloqueia qualquer registro que não pertença ao usuário logado.

### Principais Tabelas:
- `profiles`: Dados cadastrais e preferências da conta.
- `accounts`: Contas bancárias e cartões com limites e saldos.
- `categories`: Categorias criadas pelo usuário (cada um possui as suas).
- `transactions`: Lançamentos de receitas e despesas vinculados às contas e categorias.
- `goals`: Metas de economia e tetos orçamentários.
- `investments`: Alocações de ativos e rendimentos.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos:
- [Node.js](https://nodejs.org/) versão 18 ou superior instalado.
- Conta gratuita no [Supabase](https://supabase.com).

### Passo a Passo:

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   cd App_Financeiro
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env.local` na raiz do projeto (use o `.env.example` como base):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica-aqui
   ```

4. **Execute as migrações no Supabase:**
   - Acesse o painel do seu projeto no Supabase.
   - Vá em **SQL Editor** -> **New Query**.
   - Copie o conteúdo do arquivo `supabase/schema.sql` e execute (`Run`).

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Abra no seu navegador: [http://localhost:3000](http://localhost:3000).

6. **Rodar os Testes Automatizados (Opcional):**
   ```bash
   node scripts/e2e-tests.js
   node scripts/test-categories.js
   node scripts/test-logout.js
   ```

---

## 🐙 Subindo para o Git e Vinculando ao Supabase

### 1. Inicializar o Repositório Local
Caso ainda não tenha inicializado o repositório Git no projeto:
```bash
git init
git add .
git commit -m "feat: lancamento inicial do Fin-Tech com Next.js, Supabase e categorias customizadas"
```

### 2. Criar o Repositório no GitHub
1. Acesse [github.com/new](https://github.com/new).
2. Dê um nome ao repositório (ex: `fintech-app`).
3. Deixe o repositório como **Público** ou **Privado** (conforme sua preferência).
4. **Não marque** as opções de criar README ou .gitignore (já temos no projeto).
5. Clique em **Create repository**.

### 3. Vincular e Enviar os Arquivos
Execute no terminal da pasta do projeto:
```bash
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/fintech-app.git
git push -u origin main
```

### 4. Conectar o Supabase ao Repositório GitHub
Para habilitar integrações contínuas, sincronização de schemas ou deploys automatizados:
1. No painel do **Supabase**, acesse **Project Settings** -> **Integrations**.
2. Conecte com sua conta do GitHub e selecione o repositório `fintech-app`.
3. Caso queira publicar a aplicação na web, você também pode importar o repositório na [Vercel](https://vercel.com) com 1 clique, inserindo as duas variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

---

## 📂 Estrutura de Pastas do Projeto

```text
App_Financeiro/
├── screenshot/             # Registros visuais e evidências de testes do sistema
├── scripts/                # Scripts de testes e validação com Playwright
│   ├── e2e-tests.js        # Bateria de testes de ponta a ponta
│   ├── test-categories.js  # Teste automatizado de criação de categorias
│   └── test-logout.js      # Teste do fluxo seguro de logout
├── src/
│   ├── app/                # Rotas da aplicação (Next.js App Router)
│   │   ├── contas/         # Página de Contas e Cartões
│   │   ├── investimentos/  # Página de Investimentos e Reserva de Emergência
│   │   ├── login/          # Tela de Login e Criação de Conta
│   │   ├── metas/          # Página de Metas e Tetos de Gastos
│   │   ├── transacoes/     # Extrato e Lançamentos
│   │   ├── layout.tsx      # Layout global com Sidebar, Header e Provedores
│   │   └── page.tsx        # Dashboard Principal
│   ├── components/         # Componentes modulares e reutilizáveis
│   │   ├── categories/     # Gerenciador autônomo de categorias
│   │   ├── dashboard/      # Cards de KPIs, Gráfico de Fluxo e Extrato
│   │   ├── layout/         # Header superior e Sidebar de navegação
│   │   └── transactions/   # Modal de criação de transações
│   ├── context/            # Gerenciamento de estado global (FinanceContext)
│   ├── lib/                # Configuração do cliente Supabase e utilitários
│   └── types/              # Tipagens TypeScript para segurança de código
├── supabase/
│   └── schema.sql          # Estrutura completa de tabelas e políticas RLS
├── .env.example            # Exemplo de configuração das chaves de ambiente
├── .gitignore              # Proteção contra envio de credenciais ao Git
└── package.json            # Dependências e scripts de execução
```

---

## 📄 Licença e Uso

Este projeto foi construído para uso pessoal e profissional em gestão financeira. Sinta-se à vontade para expandir, conectar novos provedores bancários ou personalizar conforme suas necessidades.
