import { chromium } from "playwright";
const browser = await chromium.launch({
  executablePath: process.env.CHROME_EXECUTABLE || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${process.env.PORT || 3000}`, {
    waitUntil: "networkidle",
  });
  await page.getByRole("heading", { name: /O conhecimento/ }).waitFor();
  await page.getByRole("button", { name: "Reproduzir", exact: true }).click();
  const first = Number(await page.getByLabel("Posição no vídeo").inputValue());
  await page.waitForTimeout(800);
  if (Number(await page.getByLabel("Posição no vídeo").inputValue()) === first)
    throw new Error("O player não avançou.");
  const health = await (
    await page.request.get(
      `http://127.0.0.1:${process.env.PORT || 3000}/api/health`,
    )
  ).json();
  if (!health.ok || !health.chromium)
    throw new Error("API ou Chromium indisponível.");
  console.log("Ready: interface, assets, player playback, API and Chromium.");
} finally {
  await browser.close();
}
