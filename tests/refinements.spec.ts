import { test, expect } from '@playwright/test';

const site = 'http://127.0.0.1:4333/';
const github = 'https://api.github.com/repos/foldergram/foldergram';
const command = 'docker run -dp 4141:4141 -v ~/photos:/app/data/gallery:ro -v fg-data:/app/data ghcr.io/foldergram/foldergram';

test.beforeEach(async ({page}) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
});

test('navigation is centered in the space between the brand and theme control', async ({page}) => {
  await page.setViewportSize({width:1440,height:900});
  await page.goto(site, {waitUntil:'domcontentloaded'});
  const geometry = await page.evaluate(() => {
    const rect = (sel:string) => document.querySelector(sel)!.getBoundingClientRect();
    const brand = rect('.nav-in .brand'), nav = rect('.nav-links'), theme = rect('#themeBtn');
    return {brandRight:brand.right, themeLeft:theme.left, navCenter:(nav.left+nav.right)/2, navShown:getComputedStyle(document.querySelector('.nav-links')!).display!=='none'};
  });
  expect(geometry.navShown).toBe(true);
  expect(geometry.navCenter).toBeGreaterThan(geometry.brandRight);
  expect(geometry.navCenter).toBeLessThan(geometry.themeLeft);
  expect(Math.abs(geometry.navCenter-(geometry.brandRight+geometry.themeLeft)/2)).toBeLessThan(2);
});

test('GHCR command types, copies accurately, and leaves the copy button visible on mobile', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:320,height:720});
  await page.goto(site, {waitUntil:'domcontentloaded'});
  await expect(page.locator('#instCmd')).toHaveText(command);
  await expect(page.locator('.copy')).toHaveAttribute('data-copy',command);
  await expect(page.locator('.copy')).toBeVisible();
  const layout=await page.evaluate(() => {
    const install=document.querySelector('.install')!.getBoundingClientRect();
    const copy=document.querySelector('.install .copy')!.getBoundingClientRect();
    return {copyWithin:copy.right<=install.right+1, width:document.documentElement.scrollWidth, codeScrollable:document.querySelector('.install code')!.scrollWidth>document.querySelector('.install code')!.clientWidth};
  });
  expect(layout.copyWithin).toBe(true);
  expect(layout.width).toBeLessThanOrEqual(320);
  expect(layout.codeScrollable).toBe(true);
});

test('GitHub stars come from live API and a reload uses short-term cache', async ({page}) => {
  let apiCalls=0;
  await page.route(github, async route => {
    apiCalls++;
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({stargazers_count:1234})});
  });
  await page.goto(site, {waitUntil:'domcontentloaded'});
  await expect(page.locator('.gh-btn .js-stars')).toHaveText('1.2k');
  await expect(page.locator('.gh-stars')).toBeVisible();
  await expect(page.locator('.gh-stars svg')).toHaveCount(1);
  await expect(page.locator('.gh-btn')).toHaveAttribute('aria-label','View Foldergram on GitHub, 1,234 stars');
  await expect(page.locator('.gh-btn')).not.toContainText('GitHub');
  await expect(page.locator('.gh-btn')).not.toContainText('·');
  await expect(page.locator('.hero .js-stars, .final .js-stars')).toHaveCount(0);
  expect(apiCalls).toBe(1);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('.gh-btn .js-stars')).toHaveText('1.2k');
  expect(apiCalls).toBe(1);
});

test('the shorter quote is balanced and does not leave a one-word last line', async ({page}) => {
  for (const width of [1440,900,390]) {
    await page.setViewportSize({width,height:1200});
    await page.goto(site, {waitUntil:'domcontentloaded'});
    const result=await page.locator('.pull').evaluate(el => {
      const lines=[...el.querySelectorAll<HTMLElement>('.pull-line')];
      const parent=el.getBoundingClientRect();
      return {count:lines.length, texts:lines.map(line=>line.textContent), balanced:lines.every(line=>getComputedStyle(line).textWrap==='balance'), overflow:document.documentElement.scrollWidth>window.innerWidth, parentWidth:parent.width};
    });
    expect(result.count).toBe(2);
    expect(result.texts[0]).toBe('“You didn\'t save those memories to forget them.');
    expect(result.texts[1]).toBe('Give your memories a way back into your day.”');
    expect(result.balanced).toBe(true);
    expect(result.overflow).toBe(false);
  }
});

test('sidebar folder labels and inline open-source credit', async ({page}) => {
  await page.setViewportSize({width:1440,height:900});
  await page.goto(site, {waitUntil:'domcontentloaded'});
  const labels = page.locator('.ap-rail .ss');
  await expect(labels).toHaveCount(6);
  await expect(labels.first()).toHaveText('Top-level source folder');
  expect(await page.locator('.ap-rail .ss').allTextContents()).toEqual(Array(6).fill('Top-level source folder'));
  const credit = page.locator('.ap-rail .ap-oss');
  await expect(credit).toHaveText('Foldergram is open source. View on GitHub');
  await expect(credit.locator('a')).toHaveText('View on GitHub');
  await expect(credit.locator('a')).toHaveAttribute('href', 'https://github.com/foldergram/foldergram');
  const metrics = await credit.evaluate(el => ({
    scrollWidth: el.scrollWidth, clientWidth: el.clientWidth,
    whiteSpace: getComputedStyle(el).whiteSpace,
    linkCount: el.querySelectorAll('a').length
  }));
  expect(metrics.whiteSpace).toBe('nowrap');
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  expect(metrics.linkCount).toBe(1);
});

test('footer links only Simafri in the sponsored credit', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto(site, {waitUntil:'domcontentloaded'});
  const sponsor = page.locator('footer .f-sponsor-group');
  await expect(sponsor).toHaveText(/·\s*Hosting sponsored by Simafri \(managed VPS\)/);
  const link = sponsor.locator('a');
  await expect(link).toHaveText('Simafri');
  await expect(link).toHaveAttribute('href','https://www.simafri.com/en/managed-vps/');
  await expect(link).toHaveAttribute('rel',/sponsored/);
  await expect(link).toHaveAttribute('target','_blank');
  expect(await sponsor.locator('a').count()).toBe(1);
  await expect(page.locator('footer .f-signoff')).toHaveText('Thoughtfully made for the memories that matter. ♥');
});

test('footer keeps copyright on first line and sign-off with sponsor on second', async ({page}) => {
  for (const width of [1440,1280,900,768,700,560,390,320]) {
    await page.setViewportSize({width,height:900});
    await page.goto(site,{waitUntil:'domcontentloaded'});
    const layout=await page.evaluate(() => {
      const rect=(selector:string)=>document.querySelector(selector)!.getBoundingClientRect();
      const copyright=rect('.f-meta-line > span');
      const group=rect('.f-sponsor-group');
      const signoff=rect('.f-signoff');
      const top=rect('.f-top-link');
      return {
        copyrightBottom:copyright.bottom,
        sponsorY:group.y, signoffY:signoff.y,
        topY:top.y,
        dot:document.querySelector('.f-sponsor-group > span')?.textContent,
        links:document.querySelectorAll('.f-sponsor-group a').length,
        sponsorText:document.querySelector('.f-sponsor-group')?.textContent?.trim(),
        sponsorHref:document.querySelector('.f-sponsor')?.getAttribute('href'),
        pageWidth:document.documentElement.scrollWidth,
      };
    });
    expect(layout.dot).toBe('·');
    expect(layout.links).toBe(1);
    expect(layout.sponsorText).toMatch(/Hosting sponsored by Simafri \(managed VPS\)/);
    expect(layout.sponsorHref).toBe('https://www.simafri.com/en/managed-vps/');
    expect(layout.sponsorY).toBeGreaterThanOrEqual(layout.copyrightBottom);
    expect(layout.signoffY).toBeGreaterThanOrEqual(layout.copyrightBottom);
    if (width>=900) expect(Math.abs(layout.sponsorY-layout.signoffY)).toBeLessThan(3);
    expect(layout.pageWidth).toBeLessThanOrEqual(width);
  }
});
