const { chromium } = require("playwright");

async function captureLogin() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Login Light Mode
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.evaluate(() => document.documentElement.classList.remove("dark"));
  await page.waitForTimeout(400);
  await page.screenshot({ path: "screenshot_login_light.png", fullPage: true });

  // 2. Signup Mode
  await page.click("button:has-text('Criar Conta')");
  await page.waitForTimeout(300);
  await page.screenshot({ path: "screenshot_signup.png", fullPage: true });

  // 3. Login Dark Mode
  await page.click("button:has-text('Entrar')");
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  await page.waitForTimeout(400);
  await page.screenshot({ path: "screenshot_login_dark.png", fullPage: true });

  await browser.close();
  console.log("Login screenshots captured successfully!");
}

captureLogin().catch(console.error);
