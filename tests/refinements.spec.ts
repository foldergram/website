import { test, expect } from '@playwright/test';

const site = 'http://127.0.0.1:4333/';
const github = 'https://api.github.com/repos/foldergram/foldergram';

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

test('hero headline wraps naturally into balanced lines without overflow', async ({page}) => {
  for (const width of [1920,1440,1280,1100,900,768,561,560,412,390,375,320]) {
    await page.setViewportSize({width,height:900});
    await page.goto(site,{waitUntil:'domcontentloaded'});
    const layout = await page.locator('.hero h1').evaluate(el => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const lines: {top:number,left:number,right:number}[] = [];
      while (walker.nextNode()) {
        const range = document.createRange();
        range.selectNodeContents(walker.currentNode);
        for (const rect of Array.from(range.getClientRects())) {
          if (!rect.width) continue;
          const line = lines.find(l => Math.abs(l.top-rect.top)<2);
          if (line) { line.left=Math.min(line.left,rect.left); line.right=Math.max(line.right,rect.right); }
          else lines.push({top:rect.top,left:rect.left,right:rect.right});
        }
      }
      return {lines, inline:getComputedStyle(el.querySelector('em')!).display, overflow:document.documentElement.scrollWidth > window.innerWidth};
    });
    expect(layout.inline).toBe('inline');
    if (width >= 768) {
      expect(layout.lines.length, `width ${width}`).toBe(3);
      const lengths=layout.lines.map(line=>line.right-line.left);
      expect(Math.min(...lengths)/Math.max(...lengths), `width ${width}`).toBeGreaterThan(0.65);
    } else {
      expect(layout.lines.length).toBeGreaterThanOrEqual(2);
      expect(layout.lines.length).toBeLessThanOrEqual(5);
    }
    expect(layout.overflow).toBe(false);
    for (const line of layout.lines) {
      expect(line.left).toBeGreaterThanOrEqual(0);
      expect(line.right).toBeLessThanOrEqual(width);
    }
  }
});

test('hero fills the first viewport and leaves breathing room for the fading glow', async ({page}) => {
  for (const [width,height] of [[1920,1080],[1440,900],[1280,720],[1024,600],[900,1200],[768,1024],[390,844],[320,720]]) {
    await page.setViewportSize({width,height});
    await page.goto(site,{waitUntil:'domcontentloaded'});
    for (const theme of ['dark','light']) {
      if (theme === 'light') await page.locator('#themeBtn').click();
      const geometry = await page.evaluate(() => {
        const hero = document.querySelector('.hero')!.getBoundingClientRect();
        const link = document.querySelector('#ctaDemo')!.getBoundingClientRect();
        const demo = document.querySelector('#demo')!.getBoundingClientRect();
        const glow = document.querySelector('.hero .glow')!;
        return {heroBottom:hero.bottom,demoTop:demo.top,bottomSpace:hero.bottom-link.bottom,background:getComputedStyle(glow).backgroundImage,overflow:document.documentElement.scrollWidth > innerWidth};
      });
      expect(geometry.heroBottom, `${width}x${height} ${theme}`).toBeGreaterThanOrEqual(height-1);
      expect(geometry.demoTop).toBeGreaterThanOrEqual(height);
      expect(geometry.bottomSpace).toBeGreaterThanOrEqual(63);
      expect(geometry.background).toContain('radial-gradient');
      expect(geometry.background).toContain('rgba(0, 0, 0, 0)');
      expect(geometry.overflow).toBe(false);
    }
    await page.locator('#themeBtn').click();
  }
});

test('navigation prioritizes installation and keeps live demo reachable on mobile', async ({page}) => {
  await page.route(github, route => route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({stargazers_count:624})}));
  for (const width of [1440,1100,1081,1080,900,741,740,560,390,380,320]) {
    await page.setViewportSize({width,height:900});
    await page.goto(site,{waitUntil:'domcontentloaded'});
    const nav = page.locator('.nav');
    const start = nav.locator('.nav-start');
    await expect(start).toHaveText('Get Started');
    await expect(start).toHaveAttribute('href','https://docs.foldergram.app/installation');
    if (width > 1080) {
      await expect(nav.locator('.nav-links').getByRole('link',{name:'Live Demo'})).toBeVisible();
      await expect(start).toBeVisible();
    } else {
      await nav.locator('#mbtn').click();
      await expect(nav.locator('#mnav').getByRole('link',{name:'Live Demo'})).toHaveAttribute('href','https://demo.foldergram.app/');
      await expect(nav.locator('#mnav').getByRole('link',{name:'Get Started'})).toBeVisible();
    }
    const overflow = await nav.locator('.nav-in').evaluate(el => el.scrollWidth > el.clientWidth);
    expect(overflow, `width ${width}`).toBe(false);
  }
});

test('hero actions remain visible and fit on narrow mobile screens without an install snippet', async ({page}) => {
  await page.setViewportSize({width:320,height:720});
  await page.goto(site, {waitUntil:'domcontentloaded'});
  const hero = page.locator('.hero');
  await expect(hero.getByRole('link',{name:'Get Started'})).toBeVisible();
  await expect(hero.getByRole('link',{name:'Live Demo'})).toBeVisible();
  await expect(hero.locator('#ctaDemo')).toBeVisible();
  await expect(hero.locator('.install, [data-copy], .hero-install-note')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
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
  await page.locator('#app').scrollIntoViewIfNeeded();
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
