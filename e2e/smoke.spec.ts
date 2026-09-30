import { expect, test, type Page } from "@playwright/test";

async function login(page: Page, username: string) {
  await page.goto("/login");
  await page.getByLabel("Login").fill(username);
  await page.getByLabel("Parol").fill("123456");
  await page.getByRole("button", { name: "Kirish", exact: true }).click();
}

test("o'qituvchi test ochadi, o'quvchi topshiradi, natija jadvalda ko'rinadi", async ({ page }) => {
  // O'qituvchi: 4-darsni (Paint) bugungi qiladi va testni ochadi
  await login(page, "ustoz");
  await expect(page.getByRole("heading", { name: /O'qituvchi paneli/ })).toBeVisible();
  await page.goto("/darslar/m1-w2-d1");
  await expect(page.getByText("O'qituvchi boshqaruvi")).toBeVisible();
  await page.getByRole("button", { name: /Bugungi dars qilish/ }).click();
  await page.getByRole("button", { name: /Testni ochish/ }).click();
  await expect(page.getByRole("button", { name: /Testni yopish/ })).toBeVisible();
  await page.screenshot({ path: "test-results/01-teacher-lesson.png", fullPage: true });
  await page.getByRole("button", { name: "Chiqish" }).click();

  // O'quvchi: testni topshiradi
  await login(page, "ali");
  await expect(page.getByText("Bugungi dars")).toBeVisible();
  await page.getByRole("link", { name: /Testni boshlash/ }).click();
  await expect(page.getByRole("heading", { name: /Test/ })).toBeVisible();
  const total = await page.locator("button.h-9.w-9").count();
  for (let i = 0; i < total; i++) {
    await page.locator("div.card button.border-2").first().click();
    if (i < total - 1) await page.getByRole("button", { name: "Keyingi →" }).click();
  }
  await page.screenshot({ path: "test-results/02-quiz.png", fullPage: true });
  await page.getByRole("button", { name: /Topshirish/ }).click();
  await expect(page.getByText("Javoblar tahlili")).toBeVisible();
  await page.screenshot({ path: "test-results/03-result.png", fullPage: true });
  await page.getByRole("button", { name: "Chiqish" }).click();

  // O'qituvchi: natijalar jadvalida o'quvchi balli
  await login(page, "ustoz");
  await page.getByRole("link", { name: /Boshqarish va natijalar/ }).click();
  await page.getByRole("button", { name: /Natijalar/ }).click();
  await expect(page.getByRole("cell", { name: "Ali Valiyev" })).toBeVisible();
  await expect(page.locator("td span").filter({ hasText: /^\d+\/\d+$/ }).first()).toBeVisible();
  await page.screenshot({ path: "test-results/04-results-table.png", fullPage: true });
});

test("yopiq test o'quvchiga ochilmaydi", async ({ page }) => {
  await login(page, "malika");
  await page.goto("/darslar/m6-w24-d3/test");
  await expect(page.getByText("Bu test hozir yopiq.")).toBeVisible();
});

test("taqdimot rejimi va interaktiv ko'rgazmalar", async ({ page }) => {
  await page.goto("/taqdimot/m1-w4-d1");
  await expect(page.getByText("1 /")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByText("2 /")).toBeVisible();
  await page.screenshot({ path: "test-results/05-presentation.png" });

  // Excel simulyatori: D3 ga formula yozamiz
  await page.goto("/darslar/m1-w4-d1");
  await page.getByRole("cell", { name: "Non" }).locator("xpath=following-sibling::td[3]").click();
  await page.getByLabel("Formula satri").fill("=B3*C3");
  await page.getByLabel("Formula satri").press("Enter");
  await expect(page.locator("td.text-emerald-800").filter({ hasText: /^8000$/ })).toBeVisible();
  await expect(page.locator("li").filter({ hasText: "D3 ga non uchun" })).toContainText("✅");
  await page.screenshot({ path: "test-results/06-excel.png", fullPage: true });

  // HTML jonli muharrir
  await page.goto("/darslar/m5-w17-d1");
  await page.getByLabel("HTML kod").fill("<h1>Salom IT Kids</h1>");
  await expect(page.frameLocator("iframe[title=Natija]").getByRole("heading", { name: "Salom IT Kids" })).toBeVisible();
  await page.screenshot({ path: "test-results/07-code.png", fullPage: true });

  // Scratch: kvadrat topshirig'i
  await page.goto("/darslar/m3-w10-d2");
  await expect(page.getByText("Kvadratni «takrorla» bloki bilan chizing")).toBeVisible();
  await page.screenshot({ path: "test-results/08-scratch.png", fullPage: true });

  await page.goto("/");
  await page.screenshot({ path: "test-results/00-home.png", fullPage: true });
});

test("4-oy o'yin namunalari ishlaydi", async ({ page }) => {
  await page.goto("/darslar/m4-w13-d1");
  const canvas = page.getByLabel("Snake o'yini");
  await expect(canvas).toBeVisible();
  await page.getByRole("button", { name: "▶ Start" }).click();
  await canvas.press("ArrowDown");
  await expect(page.getByTestId("game-score")).toContainText("Ball");
  await page.screenshot({ path: "test-results/09-snake.png", fullPage: true });

  await page.goto("/darslar/m4-w14-d2");
  const dino = page.getByLabel("Dino (ayiq bilan) o'yini");
  await page.getByRole("button", { name: "▶ Start" }).click();
  await dino.press(" ");
  await page.waitForTimeout(1500);
  await expect(page.getByTestId("game-score")).not.toHaveText("⭐ Ball: 0");
  await page.screenshot({ path: "test-results/10-dino.png" });

  for (const [id, name, shot] of [
    ["m4-w15-d1", "Balloon shooter o'yini", "11-balloon"],
    ["m4-w16-d1", "Mole strike o'yini", "12-mole"],
  ]) {
    await page.goto(`/darslar/${id}`);
    await expect(page.getByLabel(name)).toBeVisible();
    await page.getByRole("button", { name: "▶ Start" }).click();
    await page.waitForTimeout(1200);
    await expect(page.getByText(/⏱ \d+ s/)).toBeVisible();
    await page.screenshot({ path: `test-results/${shot}.png` });
  }
});
