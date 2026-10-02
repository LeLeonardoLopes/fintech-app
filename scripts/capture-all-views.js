const { chromium } = require("playwright");

async function captureAllViews() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log("1. Capturando Dashboard...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: "screenshot/app-dashboard.png" });

  console.log("2. Capturando Transações...");
  await page.goto("http://localhost:3000/transacoes", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: "screenshot/app-transacoes.png" });

  console.log("3. Abrindo Gerenciador de Categorias...");
  await page.click("button:has-text('Categorias')");
  await page.waitForTimeout(500);
  await page.screenshot({ path: "screenshot/app-categorias-modal.png" });

  console.log("4. Fechando modal de categorias...");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  console.log("5. Abrindo Modal de Nova Transação...");
  await page.click("header button:has-text('Nova Transação')");
  await page.waitForTimeout(500);
  await page.screenshot({ path: "screenshot/app-nova-transacao.png" });

  await browser.close();
  console.log("Todas as telas foram capturadas com sucesso na pasta screenshot/!");
}

captureAllViews().catch(console.error);
