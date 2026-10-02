const { chromium } = require("playwright");

async function runSupabaseUITest() {
  console.log("Iniciando verificação do status do Supabase no Frontend...");
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

    // Localizar o indicador do Supabase na Sidebar
    const statusText = page.locator("text=Supabase Conectado");
    await statusText.waitFor({ state: "visible", timeout: 8000 });
    console.log("✅ [CONFIRMADO] Badge 'Supabase Conectado' está ativo e visível na barra lateral!");

    // Capturar screenshot para comprovação
    await page.screenshot({ path: "screenshot/screenshot-supabase-conectado.png" });
    console.log("📸 Screenshot salva com sucesso em 'screenshot/screenshot-supabase-conectado.png'");

    console.log("\n>>> SUPABASE 100% CONECTADO E RECONHECIDO NO FRONTEND! <<<");
  } catch (err) {
    console.error("Erro no teste visual do Supabase:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runSupabaseUITest();
