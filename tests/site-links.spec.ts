import { test, expect } from '@playwright/test';

const site = 'http://127.0.0.1:4333/';

test('every website link has a valid destination and intended external host', async ({ page }) => {
  await page.goto(site, { waitUntil: 'domcontentloaded' });
  const links = await page.locator('a').evaluateAll(nodes => nodes.map(a => {
    const link = a as HTMLAnchorElement;
    const href = link.getAttribute('href') || '';
    const destination = new URL(href, location.href);
    return {
      href,
      target: link.getAttribute('target'),
      label: (link.getAttribute('aria-label') || link.textContent || '').trim(),
      exists: destination.origin !== location.origin || Boolean(document.getElementById(destination.hash.slice(1))),
    };
  }));
  expect(links.length).toBeGreaterThan(20);
  const broken = links.filter(link => !link.href || link.href === '#' || !link.exists);
  expect(broken).toEqual([]);
  const oldDomains = links.filter(link => /foldergram\.github\.io|foldergram\.intentdeep\.com/.test(link.href));
  expect(oldDomains).toEqual([]);
  const external = links.filter(link => link.href.startsWith('https://'));
  expect(external.filter(link => link.target !== '_blank')).toEqual([]);
  expect(external.some(link => link.href === 'https://docs.foldergram.app/')).toBeTruthy();
  expect(external.some(link => link.href === 'https://demo.foldergram.app/')).toBeTruthy();
});

test('both Explore preview CTAs navigate to the interactive preview', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1280, height: 850 });
  await page.goto(site, { waitUntil: 'domcontentloaded' });

  for (const selector of ['#ctaDemo', '.final .js-demo']) {
    await page.goto(site, { waitUntil: 'domcontentloaded' });
    await page.locator(selector).click();
    await expect(page).toHaveURL(/#demo$/);
    await expect.poll(() => page.evaluate(() => {
      const r = document.querySelector('#demo')!.getBoundingClientRect();
      return r.top;
    })).toBeLessThan(110);
    await expect(page.locator('#apMain')).not.toBeEmpty();
  }
});

test('production output serves external compiled CSS rather than Vite dev style injection', async ({ page }) => {
  await page.goto(site, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('style[data-vite-dev-id]')).toHaveCount(0);
  const sheets = await page.locator('link[rel="stylesheet"]').evaluateAll(nodes => nodes.map(link => (link as HTMLLinkElement).href));
  expect(sheets.some(url => url.includes('/_astro/') && url.endsWith('.css'))).toBeTruthy();
  await expect(page).toHaveTitle('Foldergram - The feed you know. The photos you own.');
});
