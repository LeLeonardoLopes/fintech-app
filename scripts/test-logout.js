const { chromium } = require("playwright");

async function runLogoutTest() {
  console.log("Iniciando teste automatizado do Botão de Sair (Logout)...");
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Abrir login e entrar no modo demonstração para acessar o dashboard
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    const demoBtn = page.locator("button:has-text('Continuar no Modo Local / Demonstração')");
    if (await demoBtn.isVisible()) {
      await demoBtn.click();
      await page.waitForTimeout(600);
    }
    console.log("1. Dashboard carregado.");

    // Screenshot com perfil e botão de sair
    await page.screenshot({ path: "screenshot/screenshot-com-botao-sair.png" });

    // 2. Localizar o botão de Sair na Sidebar e no Header
    const sidebarLogoutBtn = page.locator('[data-testid="logout-btn-sidebar"]');
    const headerLogoutBtn = page.locator('[data-testid="logout-btn-header"]');

    const sidebarVisible = await sidebarLogoutBtn.isVisible();
    const headerVisible = await headerLogoutBtn.isVisible();

    console.log(`2. Botão Sair visível na Sidebar: ${sidebarVisible}`);
    console.log(`2. Botão Sair visível no Header: ${headerVisible}`);

    if (!sidebarVisible && !headerVisible) {
      throw new Error("Botão de Sair não encontrado na tela!");
    }

    // 3. Clicar no botão de Sair na Sidebar
    console.log("3. Clicando no Botão de Sair na Sidebar...");
    await sidebarLogoutBtn.click();

    // 4. Aguardar redirecionamento para /login
    await page.waitForURL("**/login", { timeout: 5000 });
    console.log(`4. Redirecionado com sucesso para: ${page.url()}`);

    // Verificar se o botão 'Voltar para o Dashboard' NÃO existe na tela de login
    const backBtn = page.locator("text=Voltar para o Dashboard");
    const isBackBtnVisible = await backBtn.isVisible();
    if (isBackBtnVisible) {
      throw new Error("Falha: Botão 'Voltar para o Dashboard' ainda está presente na tela de login!");
    }
    console.log("4.1. Confirmado: Botão 'Voltar para o Dashboard' removido com sucesso!");

    // Screenshot da tela de login após sair
    await page.screenshot({ path: "screenshot/screenshot-apos-sair.png" });

    // 5. Testar login novamente pelo botão de demonstração
    const reDemoBtn = page.locator('button:has-text("Continuar no Modo Local / Demonstração")');
    if (await reDemoBtn.isVisible()) {
      console.log("5. Clicando para re-entrar no modo demonstração...");
      await reDemoBtn.click();
      await page.waitForURL("http://localhost:3000/", { timeout: 5000 });
      console.log("5. Re-entrou com sucesso no Dashboard!");
    }

    // 6. Testar logout pelo Header agora
    const headerLogoutAgain = page.locator('[data-testid="logout-btn-header"]');
    await headerLogoutAgain.waitFor({ state: "visible", timeout: 5000 });
    console.log("6. Clicando no Botão de Sair no Header...");
    await headerLogoutAgain.click();
    await page.waitForURL("**/login", { timeout: 5000 });
    console.log("6. Logout pelo Header funcionou com sucesso!");

    console.log("\n>>> TODOS OS TESTES DO BOTÃO DE SAIR PASSARAM COM SUCESSO! <<<");
  } catch (error) {
    console.error("Erro no teste:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runLogoutTest();
