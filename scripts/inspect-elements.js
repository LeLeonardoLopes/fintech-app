const { chromium } = require("playwright");

async function inspect() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

  const kpis = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("main > div:first-of-type > div"));
    return cards.map((c, i) => {
      const rect = c.getBoundingClientRect();
      const titleEl = c.querySelector("span");
      const iconEl = c.querySelector("div");
      const valueEl = c.querySelector(".text-2xl");
      return {
        cardIndex: i,
        title: titleEl ? titleEl.innerText : null,
        titleBox: titleEl ? titleEl.getBoundingClientRect() : null,
        iconBox: iconEl ? iconEl.getBoundingClientRect() : null,
        valueBox: valueEl ? valueEl.getBoundingClientRect() : null,
        cardBox: rect,
      };
    });
  });

  console.log("KPIS INSPECTION:", JSON.stringify(kpis, null, 2));

  const addBtn = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find((b) =>
      b.innerText.includes("Adicionar Gasto")
    );
    if (!btn) return null;
    const parent = btn.parentElement;
    return {
      btnText: btn.innerText,
      btnBox: btn.getBoundingClientRect(),
      parentBox: parent ? parent.getBoundingClientRect() : null,
      parentHtml: parent ? parent.outerHTML : null,
    };
  });

  console.log("ADD BTN INSPECTION:", JSON.stringify(addBtn, null, 2));

  await browser.close();
}

inspect().catch(console.error);
