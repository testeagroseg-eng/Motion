import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
const official = "https://play.agroseg.net.br/";
await mkdir("public/official", { recursive: true });
await mkdir("docs", { recursive: true });
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const proxy = proxyUrl ? new URL(proxyUrl) : null;
const browser = await chromium.launch({
  proxy: proxy
    ? {
        server: proxy.origin,
        username: decodeURIComponent(proxy.username),
        password: decodeURIComponent(proxy.password),
      }
    : undefined,
  executablePath: process.env.CHROME_EXECUTABLE || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
try {
  const response = await page.goto(official, {
    waitUntil: "networkidle",
    timeout: 30000,
  });
  if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`);
  const text = await page.innerText("body");
  if (
    text.length < 100 ||
    /proxy|forbidden|access denied/i.test(text.slice(0, 200))
  )
    throw new Error("Acesso bloqueado ou conteúdo indisponível.");
  await page.screenshot({
    path: "public/official/homepage.png",
    fullPage: true,
  });
  await page.screenshot({ path: "public/official/platform.png" });
  const meta = await page.evaluate(() => ({
    title: document.title,
    colors: [
      ...new Set(
        [...document.querySelectorAll("header,nav,button,a")]
          .slice(0, 70)
          .map((x) => getComputedStyle(x).backgroundColor),
      ),
    ],
    fonts: [
      ...new Set(
        [...document.querySelectorAll("h1,h2,p")]
          .slice(0, 15)
          .map((x) => getComputedStyle(x).fontFamily),
      ),
    ],
    images: [...document.images].map((i) => ({
      src: i.src,
      alt: i.alt,
      width: i.naturalWidth,
      height: i.naturalHeight,
    })),
    links: [...document.querySelectorAll("a")].map((a) => ({
      text: a.textContent,
      href: a.href,
    })),
  }));
  await writeFile(
    "docs/site-audit.json",
    JSON.stringify(
      {
        status: "captured",
        url: official,
        date: new Date().toISOString(),
        text,
        meta,
        commercialInformationRequiresReview: true,
      },
      null,
      2,
    ),
  );
  console.log(
    "Captura oficial salva. Revise o relatório antes de ativar informações comerciais.",
  );
} catch (e) {
  const error = e instanceof Error ? e.message : String(e);
  await writeFile(
    "docs/site-audit.json",
    JSON.stringify(
      {
        status: "blocked",
        url: official,
        date: new Date().toISOString(),
        error,
        logoVerified: false,
        courseImagesVerified: false,
        commercialInformationVerified: false,
        signupUrlVerified: false,
      },
      null,
      2,
    ),
  );
  console.error("Captura não disponível:", error);
  process.exitCode = 2;
} finally {
  await browser.close();
}
