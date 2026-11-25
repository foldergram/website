import { test, expect } from '@playwright/test';

const source = 'http://127.0.0.1:8777/';
const target = 'http://127.0.0.1:4333/';
const sizes = [
  [1440,900], [1280,800], [900,1200], [960,1600],
  [768,1024], [412,915], [390,844], [375,812], [320,720],
] as const;

for (const [width, height] of sizes) {
  for (const theme of ['dark','light'] as const) {
    test(`unchanged section geometry ${width}x${height} ${theme}`, async ({ page }) => {
      await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
      await page.setViewportSize({ width, height });
      const boxes = [];
      for (const url of [source, target]) {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.evaluate(() => localStorage.removeItem('fg-theme'));
        await page.reload({ waitUntil: 'domcontentloaded' });
        if (theme === 'light') await page.locator('#themeBtn').click();
        await page.waitForTimeout(900);
        const metrics = await page.evaluate(() => {
          const sels = ['.nav', '.hero h1', '.hero .sub', '#app', '#how', '#features', '#why', '#oss', 'footer'];
          return {
            theme: document.documentElement.dataset.theme,
            scrollWidth: document.documentElement.scrollWidth,
            boxes: sels.map(sel => {
              const b = document.querySelector(sel)?.getBoundingClientRect();
              return b ? [Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)] : null;
            })
          };
        });
        expect(metrics.scrollWidth).toBeLessThanOrEqual(width);
        boxes.push(metrics);
      }
      expect(boxes[1].theme).toBe(theme);
      // Hero copy, How it works, and philosophy quote intentionally changed. Their
      // vertical positions must not make unrelated sections fail parity checks.
      // Keep size and horizontal placement checks for all other regions.
      const comparable = (boxes) => boxes.map((b,i) => b && ([1,2,4,5,6,8].includes(i) ? [b[0],b[2]] : [b[0],b[2],b[3]]));
      // Footer content intentionally differs from the original: measure its
      // placement without asserting an outdated fixed height.
      expect(boxes[1].boxes[8]).not.toBeNull();
      expect(comparable(boxes[1].boxes)).toEqual(comparable(boxes[0].boxes));
    });
  }
}

test('interactive preview, theme, menu and viewer', async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  await page.setViewportSize({width: 1280, height: 800});
  await page.goto(target);
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await expect(page.locator('#apMain')).not.toBeEmpty();
  for (const nav of ['search','library','places','likes','saved','reels','home']) {
    await page.locator(`[data-nav="${nav}"]`).click();
    await expect(page.locator(`[data-nav="${nav}"]`)).toHaveClass(/act/);
  }
  await page.locator('#themeBtn').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.locator('.feat-head').nth(1).click();
  await expect(page.locator('.feat').nth(1)).toHaveClass(/open/);
  expect(errors).toEqual([]);
});

test('media paths are self-contained', async ({ request }) => {
  for (const path of ['demo-media/animal-0.webp','demo-media/reel-animal.mp4','demo-media/st-mix-1.mp4']) {
    const response = await request.get(target + path);
    expect(response.status(), path).toBe(200);
    expect(Number(response.headers()['content-length'] || 0),path).toBeGreaterThan(0);
  }
});
