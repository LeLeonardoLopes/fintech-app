const { chromium } = require("playwright");

async function runCategoriesTest() {
  console.log("=================================================");
  console.log("🏷️ TESTANDO GERENCIAMENTO AUTÔNOMO DE CATEGORIAS");
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
    // 1. Acessar tela de Transações
    await page.goto("http://localhost:3000/transacoes", { waitUntil: "networkidle" });
    assert(page.url().includes("/transacoes"), "Navegou com sucesso para /transacoes");

    // 2. Abrir o Gerenciador de Categorias
    const manageBtn = page.locator('[data-testid="btn-manage-categories"]');
    assert(await manageBtn.isVisible(), "Botão 'Categorias' visível na barra de ações");
    await manageBtn.click();
    await page.waitForTimeout(300);

    const modalTitle = page.locator("text=Tipos de Gastos & Categorias");
    assert(await modalTitle.isVisible(), "Modal de Gerenciamento de Categorias abriu com sucesso");

    // 3. Mudar para aba 'Criar Nova Categoria'
    const tabCreate = page.locator('[data-testid="tab-create-category"]');
    await tabCreate.click();
    await page.waitForTimeout(200);

    // 4. Preencher formulário de nova categoria
    const categoryName = "Pet Shop & Cuidados";
    await page.fill('[data-testid="input-category-name"]', categoryName);
    await page.click('[data-testid="submit-create-category"]');
    await page.waitForTimeout(500);

    // 5. Verificar se a nova categoria agora consta na lista
    const newCategoryCard = page.locator('p.font-semibold:has-text("Pet Shop & Cuidados")');
    assert(await newCategoryCard.isVisible(), `Nova categoria '${categoryName}' criada e listada com sucesso no modal`);

    // Capturar screenshot do modal com a categoria criada
    await page.screenshot({ path: "screenshot/screenshot-gerenciador-categorias.png" });
    console.log("📸 Screenshot salva em 'screenshot/screenshot-gerenciador-categorias.png'");

    // 6. Fechar modal de categorias
    await page.locator("button:has(svg.lucide-x)").first().click();
    await page.waitForTimeout(300);

    // 7. Abrir modal de Nova Transação e verificar presença da nova categoria no seletor
    await page.click("header button:has-text('Nova Transação')");
    await page.waitForTimeout(400);

    const quickCatBtn = page.locator('[data-testid="btn-quick-new-category"]');
    assert(await quickCatBtn.isVisible(), "Botão '+ Nova' para criação rápida visível dentro do modal de lançamento");

    const categorySelect = page.locator(".fixed select:has(option:has-text('Alimentação'))");
    const optionsText = await categorySelect.innerText();
    assert(optionsText.includes(categoryName), `Nova categoria '${categoryName}' disponível no seletor de lançamento`);

    console.log("\n=================================================");
    console.log(`🎯 RESULTADO FINAL: ${passed} PASSOU | ${failed} FALHOU`);
    console.log("=================================================");

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error("Erro no teste de categorias:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runCategoriesTest();
