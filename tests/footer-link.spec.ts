import { test, expect } from '@playwright/test';

test('sponsor link receives real pointer click and opens correct URL', async ({page, context}) => {
  await context.route('https://www.simafri.com/**', route => route.fulfill({status:200, contentType:'text/html', body:'<title>Simafri</title>'}));
  for (const width of [1440,900,390,320]) {
    await page.setViewportSize({width,height:900});
    await page.goto('http://127.0.0.1:4333/', {waitUntil:'domcontentloaded'});
    const link=page.locator('.f-sponsor');
    const word=link;
    await word.scrollIntoViewIfNeeded();
    const hit=await word.evaluate((a) => {
      const r=a.getBoundingClientRect();
      const el=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
      return {hitTag:el?.tagName,hitText:el?.textContent?.slice(0,70),inside:!!el && (a===el||a.contains(el)||el.contains(a))};
    });
    expect(hit.inside, 'Link must be the topmost element at its center: '+JSON.stringify(hit)).toBe(true);
    const [popup]=await Promise.all([page.waitForEvent('popup'),word.click()]);
    await popup.waitForLoadState('domcontentloaded');
    expect(popup.url()).toBe('https://www.simafri.com/en/managed-vps/');
    await popup.close();
  }
});
