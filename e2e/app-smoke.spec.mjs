import { test, expect } from "@playwright/test";

const baseUrls = (process.env.SMOKE_BASE_URLS || "http://localhost:8090,http://localhost:8190,http://localhost:8290")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const credentials = { login: "user", password: "user" };
const adminCredentials = { login: "admin", password: "admin" };
const ignoredConsolePatterns = [/React DevTools/i, /Download the React DevTools/i];

function isIgnoredConsoleMessage(message) {
  return ignoredConsolePatterns.some((pattern) => pattern.test(message));
}

async function fillInput(page, selectors, value) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if (await locator.count()) {
      await locator.fill(value);
      return;
    }
  }
  throw new Error(`Input introuvable: ${selectors.join(", ")}`);
}

async function clickByText(page, texts) {
  for (const text of texts) {
    const locator = page.getByText(text, { exact: true }).first();
    if (await locator.count()) {
      await locator.click();
      return;
    }
  }
  throw new Error(`Bouton introuvable: ${texts.join(", ")}`);
}

async function visit(page, url) {
  await page.goto(url, { waitUntil: "commit", timeout: 12_000 });
  await page.waitForTimeout(1600);
}

async function login(page, baseUrl, account) {
  await visit(page, `${baseUrl}/login`);
  await fillInput(page, [
    "input[autocomplete='username']",
    "input[type='email']",
    "input[placeholder='Identifiant']",
    "input[placeholder='Identifier']",
    "input"
  ], account.login);
  await fillInput(page, [
    "input[autocomplete='current-password']",
    "input[type='password']"
  ], account.password);
  await clickByText(page, ["OK", "Ok", "Se connecter"]);
  await page.waitForTimeout(2200);
}

for (const baseUrl of baseUrls) {
  test.describe(`POP ${baseUrl}`, () => {
    test(`routes principales sans erreur JS`, async ({ page }) => {
      const errors = [];

      page.on("console", (message) => {
        if (message.type() !== "error") return;
        const text = message.text();
        if (!isIgnoredConsoleMessage(text)) errors.push(`console: ${text}`);
      });
      page.on("pageerror", (error) => errors.push(`pageerror: ${error.stack || error.message}`));
      page.on("requestfailed", (request) => {
        const url = request.url();
        if (!url.includes("chrome-extension://") && !request.failure()?.errorText?.includes("ERR_ABORTED")) {
          errors.push(`requestfailed: ${request.method()} ${url} ${request.failure()?.errorText || ""}`);
        }
      });
      page.on("response", (response) => {
        const status = response.status();
        const url = response.url();
        if (status >= 500 || (status >= 400 && !url.includes("/favicon"))) {
          errors.push(`http: ${status} ${response.request().method()} ${url}`);
        }
      });

      for (const path of ["/login", "/signup", "/forgot-password"]) {
        await visit(page, `${baseUrl}${path}`);
      }

      await login(page, baseUrl, credentials);
      for (const path of ["/home", "/summary", "/create-question", "/settings"]) {
        await visit(page, `${baseUrl}${path}`);
      }

      await visit(page, `${baseUrl}/summary`);
      const summaryItem = page.locator("div[role='button']").filter({ hasText: /./ }).nth(1);
      if (await summaryItem.count()) {
        await summaryItem.click();
        await page.waitForTimeout(1000);
      }

      await page.context().clearCookies();
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      }).catch(() => undefined);

      await login(page, baseUrl, adminCredentials);
      await visit(page, `${baseUrl}/admin`);

      expect(errors).toEqual([]);
    });
  });
}
