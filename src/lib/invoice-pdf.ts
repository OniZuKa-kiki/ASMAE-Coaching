import "server-only";

import puppeteer from "puppeteer";

export async function renderInvoicePdfFromHtml(html: string): Promise<Uint8Array> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: false,
      headerTemplate: "<div></div>",
      footerTemplate: "<div></div>",
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    return new Uint8Array(pdf);
  } finally {
    await browser.close();
  }
}
