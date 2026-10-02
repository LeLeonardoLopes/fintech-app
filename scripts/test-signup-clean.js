const { chromium } = require("playwright");
const assert = require("assert");

async function testCleanSignupAndLoginRedirect() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log("=================================================");
  console.log("🔒 TESTANDO LOGIN COMO PRIMEIRA TELA & NOVO CADASTRO");
  console.log("=================================================");

  // 1. Limpar localStorage para simular primeiro acesso de usuário novo
  await page.goto("http://localhost:3000/login");
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("fintech_logged_out", "true");
  });

  // 2. Acessar a raiz '/' e garantir que redireciona para '/login'
  console.log("2. Tentando acessar 'http://localhost:3000/' sem autenticação...");
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  const currentUrl = page.url();
  console.log(`   URL atual: ${currentUrl}`);
  assert(currentUrl.includes("/login"), "Redirecionou com sucesso para a tela de login como primeira tela!");
  console.log("✅ [PASSOU] Primeira tela do aplicativo é a tela de Login!");

  // 3. Clicar na aba 'Criar Conta'
  console.log("3. Abrindo aba 'Criar Conta'...");
  await page.click("button:has-text('Criar Conta')");
  await page.waitForTimeout(300);

  // 4. Digitar o CPF fornecido na captura de tela: 44651424805
  console.log("4. Digitando CPF...");
  const cpfInput = page.locator('[data-testid="input-cpf"]');
  await cpfInput.fill("44651424805");
  await page.waitForTimeout(300);

  const formattedCpf = await cpfInput.inputValue();
  console.log(`   CPF formatado: ${formattedCpf}`);
  assert.strictEqual(formattedCpf, "446.514.248-05", "CPF formatado corretamente com máscara");

  // 5. Verificar indicador de '✓ CPF Válido'
  const validIndicator = page.locator("text=✓ CPF Válido");
  assert(await validIndicator.isVisible(), "Indicador '✓ CPF Válido' visível");
  console.log("✅ [PASSOU] Validação de CPF válida!");

  // 6. Garantir que NÃO existe o card de simulação 'Situação: REGULAR' ou 'Base Federal'
  const fakeCard = page.locator("text=CIDADÃO CADASTRADO");
  const isFakeCardVisible = await fakeCard.isVisible().catch(() => false);
  assert(!isFakeCardVisible, "Card desnecessário de simulação NÃO é exibido!");
  console.log("✅ [PASSOU] Informação desnecessária removida, mantendo apenas a validação!");

  // 7. Testar preenchimento do Nome Completo livremente
  const nameInput = page.locator('[data-testid="input-fullname"]');
  const initialName = await nameInput.inputValue();
  assert.strictEqual(initialName, "", "Campo Nome Completo inicia limpo para o usuário digitar");

  await nameInput.fill("Leonardo Lopes");
  const filledName = await nameInput.inputValue();
  assert.strictEqual(filledName, "Leonardo Lopes", "Usuário preenche seu próprio nome normalmente");
  console.log("✅ [PASSOU] Usuário consegue preencher seus próprios dados normalmente!");

  // 8. Capturar screenshot do formulário limpo
  await page.screenshot({ path: "screenshot/screenshot-signup-clean.png" });
  console.log("📸 Screenshot salvo em 'screenshot/screenshot-signup-clean.png'");

  console.log("\n=================================================");
  console.log("🎯 TODOS OS TESTES PASSARAM COM SUCESSO!");
  console.log("=================================================");

  await browser.close();
}

testCleanSignupAndLoginRedirect().catch((err) => {
  console.error("Erro no teste:", err);
  process.exit(1);
});
