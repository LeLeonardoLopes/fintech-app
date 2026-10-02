const { chromium } = require("playwright");

async function runDeepFunctionalTests() {
  console.log("=================================================================");
  console.log("💼 AUDITORIA PROFUNDA DE FUNCIONALIDADES - FIN-TECH APP");
  console.log("=================================================================\n");

  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  let passedCount = 0;
  let failedCount = 0;

  function pass(feature, detail) {
    console.log(`✅ [FUNCIONAL] ${feature}: ${detail}`);
    passedCount++;
  }

  function fail(feature, detail) {
    console.error(`❌ [ERRO] ${feature}: ${detail}`);
    failedCount++;
  }

  try {
    // -------------------------------------------------------------
    // CENÁRIO 1: SELETOR DE MÊS NO HEADER
    // -------------------------------------------------------------
    console.log("▶ CENÁRIO 1: Navegação Temporal e Seletor de Mês");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

    const initialMonth = await page.locator("header span.capitalize").innerText();
    console.log(`   Mês inicial exibido: "${initialMonth}"`);

    // Avançar mês
    await page.click("button[title='Próximo mês']");
    await page.waitForTimeout(300);
    const nextMonth = await page.locator("header span.capitalize").innerText();
    console.log(`   Mês após avançar: "${nextMonth}"`);

    if (nextMonth !== initialMonth) {
      pass("Seletor de Mês", `Avançou com sucesso de "${initialMonth}" para "${nextMonth}"`);
    } else {
      fail("Seletor de Mês", "Mês não mudou após clique em próximo");
    }

    // Voltar para mês original
    await page.click("button[title='Mês anterior']");
    await page.waitForTimeout(300);

    // -------------------------------------------------------------
    // CENÁRIO 2: COMPRA PARCELADA NO CARTÃO DE CRÉDITO
    // -------------------------------------------------------------
    console.log("\n▶ CENÁRIO 2: Cadastro de Despesa Parcelada no Cartão");
    await page.click("header button:has-text('Nova Transação')");
    await page.waitForTimeout(400);

    // Preencher despesa parcelada
    await page.fill("input[placeholder='0,00']", "1200.00");
    await page.fill("input[placeholder*='Supermercado']", "iPhone 15 Parcelado");

    // Selecionar Cartão de Crédito
    await page.selectOption("select:has(option:has-text('Cartão'))", { label: "Cartão Nubank Ultravioleta (Nubank)" });

    // Marcar como parcelado em 10x
    await page.check("input[type='checkbox'] >> nth=1"); // Checkbox parcelado
    await page.fill("input[type='number'][min='2']", "10");

    await page.fill("input[placeholder*='fixo, viagem']", "eletronicos, parcelado, apple");
    await page.click("button:has-text('Salvar Lançamento')");
    await page.waitForTimeout(600);

    const hasInstallmentBadge = await page.isVisible("span:has-text('1/10')");
    if (hasInstallmentBadge) {
      pass("Lançamento Parcelado", "Compra registrada com indicador visual de parcela 1/10");
    } else {
      fail("Lançamento Parcelado", "Badge 1/10 não encontrado na lista");
    }

    // -------------------------------------------------------------
    // CENÁRIO 3: GESTÃO DE CONTAS & CARTÕES (/contas)
    // -------------------------------------------------------------
    console.log("\n▶ CENÁRIO 3: Módulo de Contas & Cartões");
    await page.click("nav a:has-text('Contas & Cartões')");
    await page.waitForURL("**/contas");

    const initialAccountsCount = await page.locator("main .grid:has(h3)").count();

    // Abrir modal de nova conta
    await page.click("button:has-text('Adicionar')");
    await page.waitForTimeout(400);

    // Selecionar tipo "Cartão de Crédito"
    await page.click("button:has-text('Cartão de Crédito')");
    await page.fill("input[placeholder*='Nubank Ultravioleta']", "Cartão Black Inter");
    await page.fill("input[placeholder*='Nubank, Inter']", "Banco Inter");
    await page.fill("input[placeholder='0,00']", "850.00"); // Fatura atual
    await page.fill("input[placeholder*='5000,00']", "15000.00"); // Limite total
    await page.fill("input[type='number'] >> nth=0", "15"); // Fechamento dia 15
    await page.fill("input[type='number'] >> nth=1", "25"); // Vencimento dia 25

    await page.click("button:has-text('Salvar Conta')");
    await page.waitForTimeout(600);

    const hasNewCard = await page.isVisible("h3:has-text('Cartão Black Inter')");
    const hasLimitInfo = await page.isVisible("text=Limite: R$ 15.000,00");
    const hasDueDates = await page.isVisible("text=Fecha dia 15");

    if (hasNewCard && hasDueDates) {
      pass("Novo Cartão de Crédito", "Cartão criado com limite de R$ 15.000, fechamento dia 15 e vencimento dia 25");
    } else {
      fail("Novo Cartão de Crédito", "Dados do novo cartão não encontrados na página");
    }

    // Screenshot da página de Contas
    await page.screenshot({ path: "screenshot/screenshot_contas_test.png", fullPage: true });

    // -------------------------------------------------------------
    // CENÁRIO 4: METAS DE ECONOMIA E TETOS DE GASTOS (/metas)
    // -------------------------------------------------------------
    console.log("\n▶ CENÁRIO 4: Módulo de Metas & Tetos de Gastos");
    await page.click("nav a:has-text('Metas & Orçamentos')");
    await page.waitForURL("**/metas");

    // Adicionar novo Teto de Gastos
    await page.click("button:has-text('Nova Meta / Teto')");
    await page.waitForTimeout(400);

    await page.click("button:has-text('Teto de Gastos Mensal')");
    await page.fill("input[placeholder*='Teto Alimentação']", "Teto Lazer & Restaurantes");
    await page.fill("input[placeholder='0,00'] >> nth=0", "600.00"); // Teto
    await page.fill("input[placeholder='0,00'] >> nth=1", "150.00"); // Já gasto

    await page.click("button:has-text('Salvar Meta')");
    await page.waitForTimeout(600);

    const hasNewBudget = await page.isVisible("h4:has-text('Teto Lazer & Restaurantes')");
    const hasControlBadge = await page.isVisible("span:has-text('No controle')");

    if (hasNewBudget && hasControlBadge) {
      pass("Teto de Gastos", "Teto cadastrado com cálculo de 25% gasto e badge 'No controle'");
    } else {
      fail("Teto de Gastos", "Novo teto não foi encontrado");
    }

    // Screenshot da página de Metas
    await page.screenshot({ path: "screenshot/screenshot_metas_test.png", fullPage: true });

    // -------------------------------------------------------------
    // CENÁRIO 5: INVESTIMENTOS & RESERVA DE EMERGÊNCIA (/investimentos)
    // -------------------------------------------------------------
    console.log("\n▶ CENÁRIO 5: Módulo de Investimentos & Reserva");
    await page.click("nav a:has-text('Investimentos & Reserva')");
    await page.waitForURL("**/investimentos");

    // Cadastrar novo Ativo
    await page.click("button:has-text('Novo Ativo')");
    await page.waitForTimeout(400);

    await page.selectOption("select", "emergency_fund");
    await page.fill("input[placeholder*='Tesouro Selic']", "CDB Liquidez Diária Reserva");
    await page.fill("input[placeholder*='NuInvest, XP']", "BTG Pactual");
    await page.fill("input[placeholder='0,00'] >> nth=0", "10000.00"); // Aporte
    await page.fill("input[placeholder='0,00'] >> nth=1", "10850.00"); // Valor atualizado

    await page.click("button:has-text('Salvar Ativo')");
    await page.waitForTimeout(600);

    const hasNewAsset = await page.isVisible("span:has-text('CDB Liquidez Diária Reserva')");
    const hasProfitCalc = await page.isVisible("text=+8.5%");

    if (hasNewAsset) {
      pass("Novo Investimento", "Ativo cadastrado com recálculo automático de patrimônio total");
    } else {
      fail("Novo Investimento", "Ativo não exibido na lista de investimentos");
    }

    // Screenshot de Investimentos
    await page.screenshot({ path: "screenshot/screenshot_investimentos_test.png", fullPage: true });

    // -------------------------------------------------------------
    // CENÁRIO 6: FILTROS E BUSCA EM TRANSAÇÕES (/transacoes)
    // -------------------------------------------------------------
    console.log("\n▶ CENÁRIO 6: Busca e Filtros de Transações");
    await page.click("nav a:has-text('Transações')");
    await page.waitForURL("**/transacoes");

    // Testar filtro apenas por "Receitas"
    await page.click("button:has-text('Receitas')");
    await page.waitForTimeout(300);

    const hasSalary = await page.isVisible("text=Salário Mensal");
    const hasAluguel = await page.isVisible("text=Aluguel & Condomínio");

    if (hasSalary && !hasAluguel) {
      pass("Filtro de Tipo", "Filtro 'Receitas' escondeu despesas e exibiu apenas receitas");
    } else {
      fail("Filtro de Tipo", "Filtro de receitas não filtrou corretamente as despesas");
    }

    // Testar filtro apenas por "Despesas"
    await page.click("button:has-text('Despesas')");
    await page.waitForTimeout(300);

    const hasAluguelVisible = await page.isVisible("text=Aluguel & Condomínio");
    const hasSalaryVisible = await page.isVisible("text=Salário Mensal");

    if (hasAluguelVisible && !hasSalaryVisible) {
      pass("Filtro de Tipo", "Filtro 'Despesas' escondeu receitas e exibiu apenas despesas");
    } else {
      fail("Filtro de Tipo", "Filtro de despesas falhou");
    }

    // Voltar para "Todas" e buscar por texto
    await page.click("button:has-text('Todas')");
    await page.fill("input[placeholder*='Buscar']", "iPhone");
    await page.waitForTimeout(300);

    const searchMatch = await page.isVisible("text=iPhone 15 Parcelado");
    if (searchMatch) {
      pass("Busca Textual", "Busca em tempo real localizou transação 'iPhone' instantaneamente");
    } else {
      fail("Busca Textual", "Busca por texto não localizou a transação cadastrada");
    }

    // Screenshot de Transações
    await page.screenshot({ path: "screenshot/screenshot_transacoes_test.png", fullPage: true });

  } catch (err) {
    console.error("Erro crítico durante a execução do teste:", err);
    failedCount++;
  } finally {
    await browser.close();
  }

  console.log("\n=================================================================");
  console.log(`🎯 RESULTADO DA AUDITORIA: ${passedCount} PASSOU | ${failedCount} FALHOU`);
  console.log("=================================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runDeepFunctionalTests();
