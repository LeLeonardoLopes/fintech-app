const { chromium } = require("playwright");

async function runCPFTests() {
  console.log("=================================================");
  console.log("🛡️ INICIANDO TESTES DE VALIDAÇÃO DE CPF (PLAYWRIGHT)");
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
    // 1. Verificar Dashboard e exibição de CPF formatado no perfil
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    const cpfBadge = page.locator('[data-testid="user-cpf-badge"]');
    const isCpfVisible = await cpfBadge.isVisible();
    assert(isCpfVisible, "Badge de CPF formatado está visível no perfil da sidebar");
    const cpfText = await cpfBadge.innerText();
    console.log(`   Badge no perfil: "${cpfText}"`);
    assert(cpfText.includes("123.456.***-09"), "CPF mascarado corretamente com asteriscos de segurança");

    // 2. Navegar para a tela de Login/Cadastro
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    assert(page.url().includes("/login"), "Navegou com sucesso para a tela de autenticação");

    // 3. Mudar para a aba 'Criar Conta'
    await page.click('button:has-text("Criar Conta")');
    const cpfInput = page.locator('[data-testid="input-cpf"]');
    await cpfInput.waitFor({ state: "visible", timeout: 3000 });
    assert(await cpfInput.isVisible(), "Campo de entrada de CPF visível no formulário de cadastro");

    // 4. Testar máscara automática progressiva
    await cpfInput.fill("12345678909");
    const maskedValue = await cpfInput.inputValue();
    assert(maskedValue === "123.456.789-09", `Máscara automática formatou '12345678909' para '${maskedValue}'`);

    // 5. Testar rejeição de CPF com dígitos repetidos (ex: 111.111.111-11)
    await cpfInput.fill("11111111111");
    const errorMsg = page.locator('[data-testid="cpf-error-msg"]');
    assert(await errorMsg.isVisible(), "Mensagem de erro exibida para CPF com dígitos repetidos (111.111.111-11)");

    // Tentar submeter com CPF inválido
    await page.fill('[data-testid="input-fullname"]', "Teste Silva");
    await page.fill('input[placeholder="seuemail@exemplo.com"]', "teste@fintech.com");
    await page.fill('input[type="password"]', "senha123456");
    await page.click('button[type="submit"]');

    const alertError = page.locator('text=O CPF informado é inválido');
    await alertError.waitFor({ state: "visible", timeout: 3000 });
    assert(await alertError.isVisible(), "Cadastro impedido e alerta de validação exibido para CPF inválido");

    // Screenshot do estado de erro
    await page.screenshot({ path: "screenshot/screenshot-cpf-invalido.png" });

    // 6. Testar CPF matematicamente válido (123.456.789-09) com Consulta à Base da Receita (Opção B)
    console.log("6. Digitando CPF válido e aguardando consulta automática na API...");
    await page.fill('[data-testid="input-fullname"]', ""); // limpa para testar preenchimento automático
    await cpfInput.fill("123.456.789-09");

    const validIndicator = page.locator('text=✓ CPF Válido');
    await validIndicator.waitFor({ state: "visible", timeout: 4000 });
    assert(await validIndicator.isVisible(), "Indicador visual verde '✓ CPF Válido' exibido");

    // Aguardar o Card da Receita Federal carregar via API (/api/cpf/consultar)
    const cadastralCard = page.locator('[data-testid="cpf-cadastral-card"]');
    await cadastralCard.waitFor({ state: "visible", timeout: 5000 });
    assert(await cadastralCard.isVisible(), "Card de Situação Cadastral da Receita Federal carregado via API Route");

    const cadastralText = await cadastralCard.innerText();
    console.log(`   Resultado da Consulta: \n${cadastralText}`);
    assert(cadastralText.includes("REGULAR"), "Situação cadastral retornou 'REGULAR'");
    assert(cadastralText.includes("LEONARDO HENRIQUE SILVA"), "Nome do titular retornado com sucesso");

    // Verificar se o campo Nome Completo foi preenchido automaticamente
    const fullNameInput = page.locator('[data-testid="input-fullname"]');
    const autoFilledName = await fullNameInput.inputValue();
    console.log(`   Nome auto-preenchido no formulário: "${autoFilledName}"`);
    assert(autoFilledName === "LEONARDO HENRIQUE SILVA", "Campo 'Nome Completo' preenchido automaticamente com o nome da Receita Federal");

    const autoFillBadge = page.locator('text=✓ Preenchido via Receita');
    assert(await autoFillBadge.isVisible(), "Badge visual indicando auto-preenchimento via Receita está visível");

    // Screenshot demonstrativa da Opção B em ação
    await page.screenshot({ path: "screenshot/screenshot-opcao-b-receita.png" });

    // 7. Submeter cadastro com CPF e nome verificados (usando email dinâmico no Supabase)
    const testEmail = `usuario.teste.${Date.now()}@fintech.com`;
    console.log(`7. Submetendo cadastro para: ${testEmail}...`);
    await page.fill('input[placeholder="seuemail@exemplo.com"]', testEmail);
    await page.fill('input[type="password"]', "senhaSegura123");
    await page.click('button[type="submit"]');

    // Aguardar mensagem de sucesso do Supabase ou redirecionamento
    const successAlert = page.locator('text=Conta criada');
    await successAlert.waitFor({ state: "visible", timeout: 8000 });
    assert(await successAlert.isVisible(), "Conta registrada com sucesso no banco Supabase!");

    // 8. Ir ao dashboard e verificar que o CPF autenticado é exibido
    const demoBtn = page.locator('button:has-text("Continuar no Modo Local / Demonstração")');
    if (await demoBtn.isVisible()) {
      await demoBtn.click();
      await page.waitForURL("http://localhost:3000/", { timeout: 5000 });
    } else {
      await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    }

    const userCpfAfterSignup = await page.locator('[data-testid="user-cpf-badge"]').innerText();
    assert(userCpfAfterSignup.includes("123.456.***-09"), "Dashboard exibiu o perfil com o CPF verificado na base federal");

    console.log("\n=================================================");
    console.log(`🎯 RESULTADO FINAL DO TESTE DE CPF: ${passed} PASSOU | ${failed} FALHOU`);
    console.log("=================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Erro durante o teste:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runCPFTests();
