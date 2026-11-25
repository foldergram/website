import { test, expect } from '@playwright/test';

const url='http://127.0.0.1:4333/';

test('preview waits until needed and preserves its reserved frame', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route=>route.abort());
  await page.goto(url);
  await expect(page.locator('html')).toHaveClass(/site-ready/);
  await expect(page.locator('#apMain')).toBeEmpty();
  await expect(page.locator('#app')).toHaveAttribute('inert','');
  const before=await page.locator('#app').evaluate(el=>({width:el.clientWidth,height:el.clientHeight}));
  await page.locator('#app').scrollIntoViewIfNeeded();
  await expect(page.locator('html')).toHaveClass(/preview-ready/);
  await expect(page.locator('#apMain')).not.toBeEmpty();
  expect(await page.locator('#app').evaluate(el=>({width:el.clientWidth,height:el.clientHeight}))).toEqual(before);
  expect(await page.locator('#app').evaluate(el=>(el as HTMLElement).inert)).toBe(false);
});

test('mobile header and hero geometry stay stable while the deferred script loads', async ({page}) => {
  await page.setViewportSize({width:412,height:823});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route=>route.abort());
  let release!:()=>void;
  const gate=new Promise<void>(resolve=>{release=resolve});
  await page.route('**/interactive-demo.js', async route=>{await gate;await route.continue()});
  try {
    await page.goto(url,{waitUntil:'commit'});
    await expect(page.locator('html')).toHaveClass(/js-enabled/);
    await expect(page.locator('#mnav')).toBeHidden();
    await expect(page.locator('html')).not.toHaveClass(/site-ready/);
    await page.evaluate(()=>document.fonts.ready);
    const geometry=()=>page.locator('.hero').evaluate(el=>{
      const r=el.getBoundingClientRect();return {top:r.top,height:r.height};
    });
    const before=await geometry();
    release();
    await expect(page.locator('html')).toHaveClass(/site-ready/);
    expect(await geometry()).toEqual(before);
    await expect(page.locator('#mnav')).toBeHidden();
    await expect(page.locator('#mbtn')).toBeVisible();
  } finally {release()}
});

test('direct preview links initialize the gallery', async ({page}) => {
  await page.goto(url+'#demo');
  await expect(page.locator('#apMain')).not.toBeEmpty();
  await page.locator('[data-nav="search"]').click();
  await expect(page.locator('#apQ')).toBeVisible();
});

test('primary CTA contrast meets WCAG AA in both themes and hover states', async ({page}) => {
  await page.goto(url);
  for(const theme of ['dark','light']){
    await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
    for(const cta of await page.locator('.btn.primary').all()){
      await cta.scrollIntoViewIfNeeded();
      const contrast=()=>cta.evaluate(el=>{
        function luminance(color:string){
          const rgb=color.match(/[\d.]+/g)!.slice(0,3).map(Number).map(v=>v/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
          return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;
        }
        const style=getComputedStyle(el),a=luminance(style.color),b=luminance(style.backgroundColor);
        return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
      });
      expect(await contrast()).toBeGreaterThanOrEqual(4.5);
      await cta.hover();
      await expect.poll(contrast).toBeGreaterThanOrEqual(4.5);
      await page.mouse.move(0,0);
    }
  }
});

test('story illustrations use optimized images while originals remain available', async ({page,request}) => {
  await page.goto(url);
  const images=page.locator('.vig-rings img');
  await images.first().scrollIntoViewIfNeeded();
  await expect(images).toHaveCount(3);
  const sizes=await images.evaluateAll(async nodes=>Promise.all(nodes.map(async node=>{
    const image=node as HTMLImageElement;
    await image.decode();
    return {width:image.naturalWidth,height:image.naturalHeight,src:image.getAttribute('src')};
  })));
  for(const image of sizes){
    expect(image.width).toBe(160);
    expect(image.height).toBe(160);
    expect(image.src).toContain('/_astro/');
  }
  for(const original of ['st-tigers-0','st-lions-0','st-season-0']){
    expect((await request.get(url+'demo-media/'+original+'.webp')).ok()).toBe(true);
  }
});
