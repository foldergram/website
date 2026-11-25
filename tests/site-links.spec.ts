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

test('hero preview link navigates to the interactive preview', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1280, height: 850 });
  await page.goto(site, { waitUntil: 'domcontentloaded' });
  await page.locator('#ctaDemo').click();
  await expect(page).toHaveURL(/#demo$/);
  await expect.poll(() => page.evaluate(() => {
    const r = document.querySelector('#demo')!.getBoundingClientRect();
    return r.top;
  })).toBeLessThan(110);
  await expect(page.locator('#apMain')).not.toBeEmpty();
});

test('final CTA offers installation and full demo on all screen sizes without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled:false });
  try {
    const page = await context.newPage();
    await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
    for (const width of [1440, 900, 768, 390, 320]) {
      await page.setViewportSize({ width, height:900 });
      await page.goto(site, { waitUntil:'domcontentloaded' });
      const final = page.locator('.final');
      const start = final.getByRole('link', { name:'Get Started' });
      const demo = final.getByRole('link', { name:'Live Demo' });
      await expect(start).toBeVisible();
      await expect(start).toHaveAttribute('href','https://docs.foldergram.app/installation');
      await expect(start).toHaveClass(/primary/);
      await expect(demo).toBeVisible();
      await expect(demo).toHaveAttribute('href','https://demo.foldergram.app/');
      await expect(final.locator('.final-note')).toContainText('No subscription');
      await expect(final.locator('h2 em')).toHaveCSS('font-style','italic');
      expect(await final.evaluate(el => el.scrollWidth > el.clientWidth + 1), `width ${width}`).toBe(false);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  } finally { await context.close(); }
});

test('interactive preview explains the sample gallery and offers the full demo at every width', async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  for (const width of [1440, 900, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(site, { waitUntil: 'domcontentloaded' });
    const section = page.getByRole('region', { name: 'Try Foldergram for yourself.' });
    const heading = section.getByRole('heading', { level: 2 });
    await expect(heading).toBeVisible();
    await expect(section.locator('.demo-intro-copy')).toContainText('No installation needed.');
    const fullDemo = section.getByRole('link', { name: 'Open Full Demo' });
    await expect(fullDemo).toBeVisible();
    await expect(fullDemo).toHaveAttribute('href', 'https://demo.foldergram.app/');
    const layout = await section.evaluate(el => {
      const header = el.querySelector('.demo-intro')!.getBoundingClientRect();
      const button = el.querySelector('.demo-live-link')!.getBoundingClientRect();
      const app = el.querySelector('#app')!.getBoundingClientRect();
      return {
        buttonFits: button.left >= header.left && button.right <= header.right + 1,
        headerBeforeApp: header.bottom <= app.top,
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    expect(layout, `width ${width}`).toEqual({buttonFits:true,headerBeforeApp:true,overflow:false});
    await expect(section.locator('#apMain')).not.toBeEmpty();
  }
});

test('short preview caption fits on desktop and ticker repeats the same practical benefits', async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(site, { waitUntil: 'domcontentloaded' });
  const note = page.locator('.demo-note');
  await expect(note.getByRole('link', { name: 'Try the full live demo' })).toHaveAttribute('href', 'https://demo.foldergram.app/');
  const lines = await note.evaluate(el => {
    const range = document.createRange();
    range.selectNodeContents(el);
    return new Set(Array.from(range.getClientRects()).filter(r => r.width > 0).map(r => Math.round(r.top))).size;
  });
  expect(lines).toBe(1);
  const groups = page.locator('.ticker .grp');
  await expect(groups).toHaveCount(2);
  const benefits = await groups.first().locator('span').allTextContents();
  expect(benefits).toContain('MULTIPLE LOCAL GALLERIES');
  expect(benefits).toContain('READ-ONLY IMMICH INTEGRATION');
  expect(await groups.last().locator('span').allTextContents()).toEqual(benefits);
  await expect(page.locator('.ticker .tk')).toHaveCSS('animation-name', 'none');
});

test('how it works guides installation, media sources and browsing across screen sizes', async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1440, 1024, 900, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(site, { waitUntil: 'domcontentloaded' });
    const section = page.locator('#how');
    await expect(section.locator('.step h3')).toHaveText(['Install Foldergram','Connect your library','Rediscover your memories']);
    await expect(section.getByRole('link', { name: 'Follow the installation guide' })).toHaveAttribute('href','https://docs.foldergram.app/installation');
    await expect(section.getByRole('link', { name: 'Local galleries' })).toHaveAttribute('href','https://docs.foldergram.app/local-galleries');
    await expect(section.getByRole('link', { name: 'Immich integration' })).toHaveAttribute('href','https://docs.foldergram.app/immich');
    const overflow = await section.locator('.step').evaluateAll(steps => steps.some(step => step.scrollWidth > step.clientWidth + 1));
    expect(overflow, `width ${width}`).toBe(false);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});

test('features expose summaries and accessible expandable details without overflow', async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1440, 1024, 900, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(site, { waitUntil: 'domcontentloaded' });
    const features = page.locator('#features');
    await expect(features.locator('.feat')).toHaveCount(12);
    await expect(features.locator('.f-summary')).toHaveCount(12);
    await expect(features.locator('.f-summary').last()).toBeVisible();
    for (const name of ['Carousel posts','Multiple local galleries','Immich integration','Access controls','Installable web app']) {
      await expect(features.locator('.f-title').filter({ hasText: name })).toBeVisible();
    }
    const button = features.locator('#fh7');
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded','true');
    await expect(features.locator('#fb7')).toHaveAttribute('aria-hidden','false');
    await expect(features.locator('#fh1')).toHaveAttribute('aria-expanded','false');
    await expect(features.locator('#fb1')).toHaveAttribute('aria-hidden','true');
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded','false');
    await expect(features.locator('#fb7')).toHaveAttribute('aria-hidden','true');
    expect(await features.locator('.feat-head').evaluateAll(rows => rows.filter(row => row.scrollWidth > row.clientWidth + 1).map(row=>({title:row.textContent,scrollWidth:row.scrollWidth,clientWidth:row.clientWidth}))), `width ${width}`).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});

test('why Foldergram explains ownership, privacy and browsing across screen sizes', async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1440, 900, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(site, { waitUntil: 'domcontentloaded' });
    const section = page.locator('#why');
    await expect(section.locator('.sh-top')).toContainText('WHY FOLDERGRAM');
    await expect(section.locator('.term')).toHaveCount(2);
    for (const card of await section.locator('.term').all()) {
      const lines = card.locator('.tline');
      await expect(lines).toHaveCount(6);
      const rects = await lines.evaluateAll(items => items.map(item => {
        const rect = item.getBoundingClientRect();
        return { top:rect.top, bottom:rect.bottom, display:getComputedStyle(item).display };
      }));
      expect(rects.every((rect, index) => rect.display === 'block' && (index === 0 || rect.top >= rects[index - 1].bottom - 1)), `terminal lines at width ${width}`).toBe(true);
    }
    await expect(section.locator('.why-principle h3')).toHaveText(['Your files, your structure.','Your server, your privacy.','Your memories, not a social network.']);
    expect(await section.locator('.term,.why-principle').evaluateAll(items => items.filter(item => item.scrollWidth > item.clientWidth + 1).map(item => item.textContent)), `width ${width}`).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});

test('technical specifications cover deployment and media support without overflow', async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1440, 900, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(site, { waitUntil: 'domcontentloaded' });
    const section = page.locator('#specs');
    await expect(section.locator('dt')).toHaveCount(15);
    await expect(section).toContainText('Linux AMD64 (x86-64) · Linux ARM64');
    await expect(section).toContainText('Experimental opt-in support for local still HEIC / HEIF');
    await expect(section).toContainText('new local videos by default');
    await expect(section.getByRole('link', { name: 'Docker Hub' })).toHaveAttribute('href','https://hub.docker.com/r/sajjadalis/foldergram');
    await expect(section.getByRole('link', { name: 'View installation and runtime requirements' })).toHaveAttribute('href','https://docs.foldergram.app/installation');
    expect(await section.locator('.sheet-head,.srow2').evaluateAll(rows => rows.filter(row => row.scrollWidth > row.clientWidth + 1).map(row => row.textContent)), `width ${width}`).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});

test('open source section links to project resources and fits desktop and mobile layouts', async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1440, 1024, 981, 900, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(site, { waitUntil: 'domcontentloaded' });
    const section = page.locator('#oss');
    await expect(section.getByRole('link', { name: 'Star on GitHub' })).toHaveAttribute('href','https://github.com/foldergram/foldergram');
    await expect(section.locator('.cta-row').getByRole('link', { name: 'Contribute' })).toHaveAttribute('href','https://github.com/foldergram/foldergram/blob/main/CONTRIBUTING.md');
    await expect(section.locator('.lrow2')).toHaveCount(7);
    await expect(section.locator('.lrow2').filter({hasText:'Updates and release notes'})).toHaveAttribute('href','https://github.com/foldergram/foldergram/releases');
    expect(await section.locator('.ls-head,.lrow2,.lrow2 .ur').evaluateAll(rows => rows.filter(row => row.scrollWidth > row.clientWidth + 1).map(row=>row.textContent)), `width ${width}`).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});

test('FAQ answers are expandable, accessible and fit desktop and mobile without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled:false });
  try {
    const page = await context.newPage();
    await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
    for (const width of [1440, 900, 768, 390, 320]) {
      await page.setViewportSize({ width, height:900 });
      await page.goto(site, { waitUntil:'domcontentloaded' });
      const faq = page.getByRole('region', { name:'Frequently asked questions.' });
      const items = faq.locator('details');
      await expect(items).toHaveCount(10);
      await expect(faq.locator('details[open]')).toHaveCount(0);
      const install = items.nth(2);
      await install.locator('summary').focus();
      await page.keyboard.press('Enter');
      await expect(install).toHaveAttribute('open','');
      await expect(install.getByRole('link', { name:'Read the installation guide' })).toBeVisible();
      await expect(install.getByRole('link', { name:'Read the installation guide' })).toHaveAttribute('href','https://docs.foldergram.app/installation');
      await page.keyboard.press('Enter');
      await expect(install).not.toHaveAttribute('open','');
      for (const item of await items.all()) {
        await item.locator('summary').click();
        await expect(item.locator('.faq-answer')).toBeVisible();
      }
      expect(await faq.locator('.faq-question,.faq-answer').evaluateAll(rows => rows.filter(row => row.scrollWidth > row.clientWidth + 1).map(row => row.textContent)), `width ${width}`).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  } finally { await context.close(); }
});

test('footer groups product, resource and community links across viewport widths', async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  for (const width of [1440, 1024, 821, 820, 768, 480, 390, 320]) {
    await page.setViewportSize({ width, height:900 });
    await page.goto(site, { waitUntil:'domcontentloaded' });
    const footer = page.locator('footer');
    const nav = footer.getByRole('navigation', { name:'Footer' });
    await expect(nav.locator('h2')).toHaveText(['Product','Resources','Community']);
    await expect(nav.getByRole('link')).toHaveCount(12);
    await expect(nav.getByRole('link', { name:'FAQ' })).toHaveAttribute('href','#faq');
    await expect(nav.getByRole('link', { name:'Get Started' })).toHaveAttribute('href','https://docs.foldergram.app/installation');
    await expect(footer.locator('.f-sponsor')).toHaveAttribute('rel',/sponsored/);
    await expect(footer.locator('.wm')).toHaveText('foldergram');
    expect(await footer.locator('.f-top,.f-links,.f-group').evaluateAll(items => items.filter(item => item.scrollWidth > item.clientWidth + 1).map(item => item.textContent)), `width ${width}`).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});

test('hero prioritizes installation and live demo even without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
    await page.goto(site, { waitUntil: 'domcontentloaded' });
    const hero = page.locator('.hero');
    await expect(hero.locator('.btn.primary')).toHaveText('Get Started');
    await expect(hero.locator('.btn.primary')).toHaveAttribute('href', 'https://docs.foldergram.app/installation');
    await expect(hero.getByRole('link', { name: 'Live Demo' })).toHaveAttribute('href', 'https://demo.foldergram.app/');
    await expect(hero.locator('.btn.primary')).toBeVisible();
    await expect(hero.getByRole('link', { name: 'Live Demo' })).toBeVisible();
    await expect(hero.locator('.install, [data-copy], .hero-install-note')).toHaveCount(0);
    await expect(hero.locator('#ctaDemo')).toHaveAttribute('href', '#demo');
  } finally {
    await context.close();
  }
});

test('production output serves external compiled CSS rather than Vite dev style injection', async ({ page }) => {
  await page.goto(site, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('style[data-vite-dev-id]')).toHaveCount(0);
  const sheets = await page.locator('link[rel="stylesheet"]').evaluateAll(nodes => nodes.map(link => (link as HTMLLinkElement).href));
  expect(sheets.some(url => url.includes('/_astro/') && url.endsWith('.css'))).toBeTruthy();
  await expect(page).toHaveTitle('Foldergram - The feed you know. The photos you own.');
});
