/**
 * Real browser walk-through of the learner journey.
 *
 * Drives Chromium against the running dev servers, so it exercises hydration,
 * client-side auth, react-query and the API together — the parts an HTML fetch
 * cannot reach.
 */
import { chromium } from "playwright";

const UI = "http://localhost:3100";
const API = "http://localhost:8081/api/v1";

const results = [];
function check(label, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  [${ok ? "PASS" : "FAIL"}] ${label}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
  results.push(ok);
}

// A fresh learner each run, so enrolment and certificate state start clean.
const stamp = Date.now();
const EMAIL = `e2e${stamp}@learna.local`;
const PASSWORD = "E2ePassword123";
const NAME = "E2E Learner";

/** Dev-server routes compile on first hit; a cold one can abort the navigation. */
async function goto(page, url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
      // React handlers only exist after hydration; clicking sooner hits an
      // inert control and the request never leaves the browser.
      await page.waitForTimeout(1200);
      return;
    } catch (e) {
      if (attempt === 2) throw e;
      await page.waitForTimeout(2000);
    }
  }
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  // --- 1. published courses are visible on the public home page ------------
  console.log("home: published courses visible to a signed-out visitor");
  await goto(page, UI);
  await page.waitForSelector("text=Featured courses", { timeout: 15000 });
  const homeCards = await page.locator('a[href^="/courses/"]').count();
  check("featured course links present", homeCards > 0, true);
  check("signed-out CTA shown", await page.locator("text=Create an account").isVisible(), true);
  check("no dashboard link", await page.locator('header >> text=Dashboard').count(), 0);

  // --- 2. catalog -> course preview ---------------------------------------
  console.log("catalog and course preview");
  await goto(page, `${UI}/courses`);
  const firstCourse = page.locator('a[href^="/courses/"]').first();
  const slug = (await firstCourse.getAttribute("href")).split("/").pop();
  await firstCourse.click();
  await page.waitForURL(`**/courses/${slug}`);
  check("outline heading", await page.locator("text=Course content").isVisible(), true);
  check("enrol CTA for anonymous", await page.locator("text=Sign in to enrol").isVisible(), true);

  // --- 3. signup -----------------------------------------------------------
  console.log("signup");
  await goto(page, `${UI}/signup`);
  await page.fill("#name", NAME);
  await page.fill("#email", EMAIL);
  await page.fill("#password", PASSWORD);
  await page.fill("#confirmPassword", PASSWORD);
  // The eye toggle must actually reveal the value.
  await page.locator('button[aria-label="Show password"]').first().click();
  check("password revealed", await page.locator("#password").getAttribute("type"), "text");
  await page.locator('button[aria-label="Hide password"]').first().click();
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 20000 });
  check("landed on dashboard", page.url().endsWith("/dashboard"), true);

  // --- 4. signed-in header --------------------------------------------------
  console.log("header after sign-in");
  await page.waitForSelector('button[aria-label*="Account menu"]', { timeout: 20000 });
  check("no Sign in link", await page.locator('header >> text="Sign in"').count(), 0);
  check("no Get started link", await page.locator('header >> text="Get started"').count(), 0);
  check("account menu present", await page.locator('button[aria-label*="Account menu"]').isVisible(), true);

  console.log("account menu: view and edit profile");
  await page.click('button[aria-label*="Account menu"]');
  await page.waitForSelector('[role="menu"]');
  check("View profile item", await page.locator('[role="menuitem"]:has-text("View profile")').isVisible(), true);
  check("Edit profile item", await page.locator('[role="menuitem"]:has-text("Edit profile")').isVisible(), true);
  check("Certificates item", await page.locator('[role="menuitem"]:has-text("Certificates")').isVisible(), true);
  check("Sign out item", await page.locator('[role="menuitem"]:has-text("Sign out")').isVisible(), true);
  check("no Admin item for a learner", await page.locator('[role="menuitem"]:has-text("Admin")').count(), 0);

  await page.click('[role="menuitem"]:has-text("Edit profile")');
  await page.waitForURL("**/profile**");
  check("profile shows the account", await page.locator(`text=${EMAIL}`).isVisible(), true);
  check("edit form anchor exists", await page.locator("#edit-profile").count(), 1);

  // --- 5. dashboard empty state --------------------------------------------
  console.log("dashboard empty state before enrolling");
  await goto(page, `${UI}/dashboard`);
  check("empty state", await page.locator("text=not enrolled in any courses").isVisible(), true);

  // --- 6. enrol ------------------------------------------------------------
  console.log("enrol in a published course");
  await goto(page, `${UI}/courses/${slug}`);
  await page.waitForSelector("text=Enrol for free", { timeout: 15000 });
  await page.click("text=Enrol for free");
  await page.waitForURL("**/learn/**", { timeout: 20000 });
  check("redirected into the player", page.url().includes("/learn/"), true);

  // --- 7. complete every lesson --------------------------------------------
  console.log("work through every lesson");
  await page.waitForSelector('nav[aria-label="Course lessons"] a', { timeout: 30000 });
  const lessonLinks = await page.locator('nav[aria-label="Course lessons"] a').count();
  check("sidebar lists lessons", lessonLinks > 0, true);

  for (let i = 0; i < lessonLinks; i++) {
    await page.locator('nav[aria-label="Course lessons"] a').nth(i).click();
    await page.waitForTimeout(600);
    const markBtn = page.locator('button:has-text("Mark as complete")');
    if (await markBtn.count()) {
      await markBtn.first().click();
      // The mutation refetches the tree; the next click must not race it.
      await page.waitForTimeout(1800);
    }
  }
  await page.waitForSelector("text=Course complete", { timeout: 20000 }).catch(() => {});
  check("100% reached", await page.locator("text=Course complete").isVisible(), true);

  // --- 8. certificate ------------------------------------------------------
  console.log("claim the certificate");
  await page.click('button:has-text("Get certificate")');
  await page.waitForURL("**/certificates", { timeout: 20000 });
  const certNumber = (await page.locator("text=/LEARNA-\\d{4}-[A-Z0-9]{6}/").first().textContent()).trim();
  check("certificate number issued", /^LEARNA-\d{4}-[A-Z0-9]{6}$/.test(certNumber), true);
  console.log(`      -> ${certNumber}`);

  console.log("download the PDF");
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 20000 }),
    page.click('button:has-text("PDF")'),
  ]);
  check("PDF filename", download.suggestedFilename(), `${certNumber}.pdf`);

  // --- 9. public verification (signed out) ---------------------------------
  console.log("verify the certificate as an anonymous visitor");
  const anon = await browser.newPage();
  await goto(anon, `${UI}/verify/${certNumber}`);
  check("verified", await anon.locator("text=Certificate verified").isVisible(), true);
  check("holder named", await anon.locator(`dd:has-text("${NAME}")`).isVisible(), true);
  await goto(anon, `${UI}/verify/LEARNA-2026-ZZZZZZ`);
  check("bogus number rejected", await anon.locator("text=Not verified").isVisible(), true);
  await anon.close();

  // --- 10. dashboard now shows the completed course ------------------------
  console.log("dashboard reflects completion");
  await goto(page, `${UI}/dashboard`);
  check("course card present", await page.locator("text=100% complete").first().isVisible(), true);

  // --- 11. sign out --------------------------------------------------------
  console.log("sign out");
  await page.click('button[aria-label*="Account menu"]');
  await page.click('[role="menuitem"]:has-text("Sign out")');
  await page.waitForURL("**/login**", { timeout: 20000 });
  await goto(page, UI);
  check("signed-out CTA is back", await page.locator("text=Create an account").isVisible(), true);

  check("no uncaught page errors", errors, []);

  await browser.close();

  console.log(`\n${results.filter(Boolean).length}/${results.length} checks passed`);
  process.exit(results.every(Boolean) ? 0 : 1);
}

main().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
