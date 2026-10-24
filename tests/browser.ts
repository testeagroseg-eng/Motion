import { chromium } from "playwright";
import assert from "node:assert/strict";
import { writeFile, mkdir } from "node:fs/promises";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1512, height: 1100 } });
const errors: string[] = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /O conhecimento/ }).waitFor();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "Reproduzir", exact: true }).click();
  await page.waitForTimeout(1100);
  assert.ok((await page.getByLabel("Posição no vídeo").inputValue()) !== "0");
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  await page.getByRole("button", { name: "16:9", exact: true }).click();
  await page.getByText("1920 × 1080", { exact: true }).waitFor();
  await page.getByRole("button", { name: "9:16", exact: true }).click();
  await page.getByLabel("Posição no vídeo").fill("80");
  await page.waitForTimeout(1000);
  await mkdir("docs/screenshots", { recursive: true });
  await page.screenshot({
    path: "docs/screenshots/studio-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Marca & mídia", exact: true })
    .click();
  await page.getByText("Ativos oficiais", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Áudio", exact: true }).click();
  assert.equal(
    await page
      .getByRole("checkbox", { name: "Exibir legendas revisadas" })
      .isDisabled(),
    true,
  );
  await page.getByRole("button", { name: "Cena", exact: true }).click();
  const title = page.getByLabel("Texto principal");
  const initial = await title.inputValue();
  await title.fill("Teste de persistência");
  await page
    .getByRole("button", { name: "Salvar projeto", exact: true })
    .click();
  await page.getByText("Projeto salvo", { exact: true }).waitFor();
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(
    await page.getByLabel("Texto principal").inputValue(),
    "Teste de persistência",
  );
  await page.getByLabel("Texto principal").fill(initial);
  await page
    .getByRole("button", { name: "Salvar projeto", exact: true })
    .click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "docs/screenshots/studio-mobile.png",
    fullPage: true,
  });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  );
  await page.setViewportSize({ width: 1512, height: 1100 });
  await page.getByRole("button", { name: "15s", exact: true }).click();
  const response = page.waitForResponse(
    (r) => r.url().endsWith("/api/render") && r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Exportar MP4", exact: true }).click();
  const start = await (await response).json();
  assert.ok(start.id);
  console.log("Exportação iniciada pelo botão:", start.id);
  let job = start;
  let prior = "";
  const deadline = Date.now() + 12 * 60 * 1000;
  while (job.status === "running" && Date.now() < deadline) {
    await page.waitForTimeout(2500);
    job = await (
      await page.request.get(`http://127.0.0.1:3000/api/render/${start.id}`)
    ).json();
    const p = String(Math.floor(job.progress * 10) * 10);
    if (prior !== p) {
      console.log(`Exportação: ${p}% ${job.stage}`);
      prior = p;
    }
  }
  assert.equal(
    job.status,
    "complete",
    job.error || "Exportação não terminou no prazo.",
  );
  const file = await page.request.get(`http://127.0.0.1:3000${job.download}`);
  assert.ok(file.ok());
  assert.ok((await file.body()).length > 100000);
  assert.equal(errors.length, 0, errors.join("\n"));
  await writeFile(
    "docs/browser-test.json",
    JSON.stringify(
      {
        passed: true,
        checks: [
          "player playback",
          "format switching",
          "asset controls",
          "caption safeguards",
          "project save and reload",
          "mobile width",
          "real MP4 export via button",
          "download response",
        ],
        job,
        pageErrors: errors,
      },
      null,
      2,
    ),
  );
  console.log("Browser tests passed. Exported file:", job.filename);
} finally {
  await browser.close();
}
