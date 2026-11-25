import {test,expect} from '@playwright/test';

const site = 'http://127.0.0.1:4333/';

test('production SEO metadata and structured data match the landing page', async ({page,request}) => {
  await page.goto(site, {waitUntil:'domcontentloaded'});
  await expect(page).toHaveTitle('Foldergram - Self-Hosted Photo & Video Gallery');
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://foldergram.app/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content','https://foldergram.app/og.jpg');
  await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute('content','image/jpeg');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content','summary_large_image');
  const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes=>nodes.map(node=>JSON.parse(node.textContent!)));
  const graph = schemas.find(schema=>schema['@graph'])['@graph'];
  const app = graph.find(node=>node['@type']==='SoftwareApplication');
  expect(app.offers.price).toBe(0);
  expect(app.aggregateRating).toBeUndefined();
  expect(graph.some(node=>node['@type']==='WebSite')).toBe(true);
  const faq = schemas.find(schema=>schema['@type']==='FAQPage');
  const items = await page.locator('#faq details').evaluateAll(nodes=>nodes.map(node=>({
    question:node.querySelector('summary span')!.textContent!.trim(),
    answer:node.querySelector('.faq-answer p')!.textContent!.trim(),
  })));
  expect(faq.mainEntity).toHaveLength(items.length);
  items.forEach((item,index)=>{
    expect(faq.mainEntity[index].name).toBe(item.question);
    expect(faq.mainEntity[index].acceptedAnswer.text).toContain(item.answer);
  });
  expect(await (await request.get(site+'robots.txt')).text()).toContain('Sitemap: https://foldergram.app/sitemap.xml');
  expect(await (await request.get(site+'sitemap.xml')).text()).toContain('<loc>https://foldergram.app/</loc>');
});

test('social sharing image is served with the declared dimensions and format', async ({page,request}) => {
  const response = await request.get(site+'og.jpg');
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toContain('image/jpeg');
  await page.goto(site,{waitUntil:'domcontentloaded'});
  const dimensions = await page.evaluate(async () => {
    const image = new Image();
    const declared = document.querySelector('meta[property="og:image"]')!.getAttribute('content')!;
    image.src = new URL(declared).pathname;
    await image.decode();
    return [image.naturalWidth,image.naturalHeight];
  });
  expect(dimensions).toEqual([1200,630]);
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content','1200');
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content','630');
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content','https://foldergram.app/og.jpg');
});

test('local fonts load without a browser request to Google Fonts', async ({page}) => {
  const remoteFontRequests:string[] = [];
  page.on('request',r=>{if(/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(r.url()))remoteFontRequests.push(r.url())});
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route=>route.abort());
  await page.goto(site);
  await page.evaluate(()=>document.fonts.ready);
  const fonts = await page.evaluate(()=>Array.from(document.fonts).map(font=>({family:font.family,status:font.status})));
  expect(fonts.filter(font=>font.status==='loaded').length).toBeGreaterThanOrEqual(2);
  expect(remoteFontRequests).toEqual([]);
  await expect(page.locator('link[rel=preload][as=font]')).toHaveCount(2);
});

test('main content and preview fallback remain usable without JavaScript', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  try {
    const page = await context.newPage();
    await page.goto(site);
    await expect(page.locator('.preview-fallback')).toBeVisible();
    await expect(page.locator('#app')).toBeHidden();
    await expect(page.locator('#features .feat-body[aria-hidden=false]')).toHaveCount(12);
    await expect(page.locator('#why .tline').first()).toHaveCSS('opacity','1');
    await expect(page.locator('#mnav')).toBeVisible();
    await expect(page.locator('#mbtn')).toBeHidden();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  } finally {await context.close()}
});

test('mobile menu dismisses with Escape and returns focus', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto(site);
  const button=page.locator('#mbtn');
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded','true');
  await page.keyboard.press('Escape');
  await expect(button).toBeFocused();
  await expect(button).toHaveAttribute('aria-expanded','false');
});
