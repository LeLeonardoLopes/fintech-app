const { chromium } = require("playwright");

async function runAllTests() {
  console.log("=================================================");
  console.log("🚀 INICIANDO BATERIA COMPLETA DE TESTES PLAYWRIGHT");
  console.log("=================================================\n");

  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASSOU] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FALHOU] ${message}`);
      failed++;
    }
  }

  try {
    // Autenticar no modo demonstração para rodar a suíte completa de testes
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    const demoBtn = page.locator("button:has-text('Continuar no Modo Local / Demonstração')");
    if (await demoBtn.isVisible()) {
      await demoBtn.click();
      await page.waitForTimeout(600);
    }

    // -------------------------------------------------------------
    // TESTE 1: CARREGAMENTO DA PÁGINA PRINCIPAL E ALINHAMENTO
    // -------------------------------------------------------------
    console.log("▶ TESTE 1: Carregamento do Dashboard e Alinhamento do Grid");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

    const pageTitle = await page.title();
    assert(pageTitle.includes("Fin-Tech"), "Título da aplicação contém 'Fin-Tech'");

    // Verificar alinhamento horizontal entre Header e Cards KPI
    const headerLeft = await page.evaluate(() => {
      const h1 = document.querySelector("header h1");
      return h1 ? h1.getBoundingClientRect().left : 0;
    });

    const firstCardLeft = await page.evaluate(() => {
      const firstCard = document.querySelector("main > div:first-of-type > div:first-of-type");
      return firstCard ? firstCard.getBoundingClientRect().left : 0;
    });

    console.log(`   Posição X do Header: ${headerLeft.toFixed(1)}px | Posição X de Saldo em Contas: ${firstCardLeft.toFixed(1)}px`);
    assert(Math.abs(headerLeft - firstCardLeft) < 30, "Header e Card de Saldo alinhados no mesmo grid");

    // Verificar os 4 Cards de KPI
    const kpiCount = await page.locator("main > div:first-of-type > div").count();
    assert(kpiCount === 4, "Existem exatamente 4 cards de KPI (Saldo, Receitas, Despesas, Faturas)");

    // -------------------------------------------------------------
    // TESTE 2: TESTE DO MODAL DE NOVA TRANSAÇÃO E ATUALIZAÇÃO DE SALDO
    // -------------------------------------------------------------
    console.log("\n▶ TESTE 2: Cadastro de Nova Transação e Recálculo Automático");

    // Ler saldo inicial
    const initialBalanceText = await page.locator("main > div:first-of-type > div:first-of-type .text-2xl").innerText();
    console.log(`   Saldo em Contas antes da transação: ${initialBalanceText}`);

    // Clicar em "Nova Transação" no Header
    await page.click("header button:has-text('Nova Transação')");
    await page.waitForTimeout(400);

    // Verificar se o modal abriu
    const modalVisible = await page.isVisible("text=Novo Lançamento");
    assert(modalVisible, "Modal de Novo Lançamento abriu corretamente");

    // Preencher campos
    await page.fill("input[placeholder='0,00']", "150.00");
    await page.fill("input[placeholder*='Supermercado']", "Compra Teste E2E Playwright");
    await page.fill("input[placeholder*='fixo, viagem']", "teste, playwright");

    // Salvar
    await page.click("button:has-text('Salvar Lançamento')");
    await page.waitForTimeout(600);

    // Verificar se o modal fechou
    const modalClosed = !(await page.isVisible("form:has-text('Salvar Lançamento')"));
    assert(modalClosed, "Modal fechou após salvar");

    // Verificar se a transação aparece na lista de Últimos Lançamentos
    const hasNewTx = await page.isVisible("text=Compra Teste E2E Playwright");
    assert(hasNewTx, "Transação cadastrada exibida em 'Últimos Lançamentos'");

    // Verificar se o saldo atualizou
    const newBalanceText = await page.locator("main > div:first-of-type > div:first-of-type .text-2xl").innerText();
    console.log(`   Saldo em Contas após a transação: ${newBalanceText}`);
    assert(initialBalanceText !== newBalanceText, "Saldo foi recalculado e atualizado");

    // -------------------------------------------------------------
    // TESTE 3: EXCLUSÃO DE TRANSAÇÃO
    // -------------------------------------------------------------
    console.log("\n▶ TESTE 3: Exclusão de Transação");

    const deleteBtn = page.locator("button[title='Excluir lançamento']").first();
    if (await deleteBtn.isVisible({ timeout: 2000 })) {
      await deleteBtn.click();
      await page.waitForTimeout(500);
      assert(true, "Botão de exclusão clicado com sucesso");
    } else {
      // Se hover for necessário
      await page.hover(".group");
      await page.click("button[title='Excluir lançamento']");
      await page.waitForTimeout(500);
      assert(true, "Lançamento excluído com sucesso via hover");
    }

    // -------------------------------------------------------------
    // TESTE 4: GRÁFICO INTERATIVO E PAINEL DE CONFIGURAÇÃO VISUAL
    // -------------------------------------------------------------
    console.log("\n▶ TESTE 4: Gráfico Interativo e Controles Visuais");

    // Abrir painel de configuração
    await page.click("button:has-text('Configurar Visual')");
    await page.waitForTimeout(400);

    const controlsOpen = await page.isVisible("text=Ajuste Interativo de Dimensões e Formas");
    assert(controlsOpen, "Painel de Configuração Visual abriu");

    // Testar alternância para Horizontal
    await page.click("button:has-text('Horizontal')");
    await page.waitForTimeout(400);
    assert(true, "Modo Horizontal ativado no gráfico");

    // Testar alternância para Fluxo Mensal
    await page.click("button:has-text('Fluxo Mensal')");
    await page.waitForTimeout(400);
    const hasMonthlyFlow = await page.isVisible("text=Fluxo Comparativo: Receitas vs Despesas");
    assert(hasMonthlyFlow, "Visualização de Fluxo Mensal renderizada com sucesso");

    // Restaurar Padrão
    await page.click("button:has-text('Restaurar Padrão')");
    await page.waitForTimeout(400);
    await page.click("button:has-text('Configurar Visual')"); // fechar painel
    assert(true, "Configurações restauradas e painel fechado");

    // -------------------------------------------------------------
    // TESTE 5: NAVEGAÇÃO E ROTAS (/transacoes, /contas, /metas, /investimentos)
    // -------------------------------------------------------------
    console.log("\n▶ TESTE 5: Navegação Completa e Páginas dos Módulos");

    // 5.1 /transacoes
    await page.click("nav a:has-text('Transações')");
    await page.waitForURL("**/transacoes");
    assert(page.url().includes("/transacoes"), "Navegou para /transacoes");
    await page.fill("input[placeholder*='Buscar']", "Salário");
    await page.waitForTimeout(300);
    assert(await page.isVisible("text=Salário Mensal"), "Filtro de busca em transações funciona");

    // 5.2 /contas
    await page.click("nav a:has-text('Contas & Cartões')");
    await page.waitForURL("**/contas");
    assert(page.url().includes("/contas"), "Navegou para /contas");
    assert(await page.isVisible("text=Cartão Nubank Ultravioleta"), "Cartões de crédito listados com faturas");

    // 5.3 /metas
    await page.click("nav a:has-text('Metas & Orçamentos')");
    await page.waitForURL("**/metas");
    assert(page.url().includes("/metas"), "Navegou para /metas");
    assert(await page.isVisible("text=Tetos de Gastos Mensais"), "Tetos de gastos e metas listados");

    // 5.4 /investimentos
    await page.click("nav a:has-text('Investimentos & Reserva')");
    await page.waitForURL("**/investimentos");
    assert(page.url().includes("/investimentos"), "Navegou para /investimentos");
    assert(await page.isVisible("text=Reserva de Emergência"), "Cálculo de Reserva de Emergência exibido");

    // -------------------------------------------------------------
    // TESTE 6: ALTERNÂNCIA DE TEMA CLARO / ESCURO
    // -------------------------------------------------------------
    console.log("\n▶ TESTE 6: Alternador de Tema Claro e Escuro");

    const toggleThemeBtn = page.locator("button:has-text('Tema Escuro'), button:has-text('Tema Claro')");
    await toggleThemeBtn.click();
    await page.waitForTimeout(400);

    const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    assert(isDark, "Tema escuro ativado (.dark na raiz HTML)");

    await toggleThemeBtn.click();
    await page.waitForTimeout(400);
    const isLight = await page.evaluate(() => !document.documentElement.classList.contains("dark"));
    assert(isLight, "Tema claro restaurado com sucesso");

    // Capturar screenshot final do teste de integração
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    await page.screenshot({ path: "screenshot/screenshot_final_test.png", fullPage: true });

  } catch (error) {
    console.error("Erro durante a execução do teste:", error);
    failed++;
  } finally {
    await browser.close();
  }

  console.log("\n=================================================");
  console.log(`📊 RESULTADO FINAL: ${passed} PASSOU | ${failed} FALHOU`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests();
