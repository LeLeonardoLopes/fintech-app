const { chromium } = require("playwright");

async function capture() {
  let browser;
  try {
    // Tenta usar o Microsoft Edge instalado no Windows nativamente
    browser = await chromium.launch({ channel: "msedge", headless: true });
  } catch (err) {
    try {
      // Se não achar o Edge, tenta o Google Chrome
      browser = await chromium.launch({ channel: "chrome", headless: true });
    } catch (e2) {
      console.error("Não foi possível iniciar Edge ou Chrome:", e2);
      process.exit(1);
    }
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  console.log("Navegando para http://localhost:3000...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.removeItem("fintech_chart_config"));
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  const screenshotPath = "screenshot_dashboard.png";
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log("Screenshot capturado com sucesso em:", screenshotPath);

  await browser.close();
}

capture().catch((err) => {
  console.error("Erro ao capturar screenshot:", err);
  process.exit(1);
});
