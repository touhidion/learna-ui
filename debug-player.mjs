/** Narrow reproduction: sign up, enrol, mark one lesson, inspect the player. */
import { chromium } from "playwright";

const UI = "http://localhost:3100";
const stamp = Date.now();
const EMAIL = `dbg${stamp}@learna.local`;
const PASSWORD = "DebugPassword123";

const browser = await chromium.launch();
const page = await browser.newPage();

page.on("console", (m) => {
  if (m.type() === "error") console.log("  console.error:", m.text().slice(0, 200));
});
page.on("response", async (r) => {
  const u = r.url();
  if (u.includes("/api/v1/") && (u.includes("complete") || u.includes("/learn/"))) {
    console.log(`  ${r.request().method()} ${u.replace("http://localhost:8081/api/v1", "")} -> ${r.status()}`);
  }
});

await page.goto(`${UI}/signup`, { waitUntil: "networkidle" });
// React must hydrate before the submit handler exists; without this the click
// hits an inert button and nothing reaches the API.
await page.waitForTimeout(1500);
await page.fill("#name", "Debug User");
await page.fill("#email", EMAIL);
await page.fill("#password", PASSWORD);
await page.fill("#confirmPassword", PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL("**/dashboard", { timeout: 20000 });

await page.goto(`${UI}/courses`, { waitUntil: "networkidle" });
const href = await page.locator('a[href^="/courses/"]').first().getAttribute("href");
await page.goto(`${UI}${href}`, { waitUntil: "networkidle" });
await page.click("text=Enrol for free");
await page.waitForURL("**/learn/**", { timeout: 20000 });
await page.waitForSelector('nav[aria-label="Course lessons"] a', { timeout: 20000 });

const total = await page.locator('nav[aria-label="Course lessons"] a').count();
console.log(`\nlessons in sidebar: ${total}`);
console.log("progress text before:", (await page.locator("text=/lessons complete/").first().textContent()).trim());

console.log("\n--- marking lesson 1 ---");
await page.locator('nav[aria-label="Course lessons"] a').nth(0).click();
await page.waitForTimeout(600);
const btn = page.locator('button:has-text("Mark as complete")');
console.log("mark button count:", await btn.count());
if (await btn.count()) {
  await btn.first().click();
  await page.waitForTimeout(2000);
}
console.log("progress text after :", (await page.locator("text=/lessons complete/").first().textContent()).trim());
console.log("button now says     :", (await page.locator("article button").first().textContent()).trim());

console.log("\n--- marking the rest ---");
for (let i = 1; i < total; i++) {
  await page.locator('nav[aria-label="Course lessons"] a').nth(i).click();
  await page.waitForTimeout(600);
  const b = page.locator('button:has-text("Mark as complete")');
  if (await b.count()) {
    await b.first().click();
    await page.waitForTimeout(1500);
  }
}
await page.waitForTimeout(1500);
console.log("final progress      :", (await page.locator("text=/lessons complete/").first().textContent()).trim());
console.log("Course complete shown:", await page.locator("text=Course complete").isVisible());

await browser.close();
