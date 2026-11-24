import {test,expect} from '@playwright/test';

test('footer credit placement respects two-line desktop layout', async({page})=>{
  for(const width of [1440,1280,1150,1024,900,768,700,560,390,320]){
    await page.setViewportSize({width,height:900});
    await page.goto('http://127.0.0.1:4333/',{waitUntil:'domcontentloaded'});
    const m=await page.evaluate(()=>{
      const r=(s:string)=>document.querySelector(s)!.getBoundingClientRect();
      return {
        copyrightBottom:r('.f-meta-line > span').bottom,
        signoffY:r('.f-signoff').y,
        sponsorY:r('.f-sponsor-group').y,
        topY:r('.f-top-link').y,
        outerWidth:document.documentElement.scrollWidth
      };
    });
    expect(m.signoffY,`width=${width}`).toBeGreaterThanOrEqual(m.copyrightBottom);
    expect(m.sponsorY,`width=${width}`).toBeGreaterThanOrEqual(m.copyrightBottom);
    if(width>=900)expect(Math.abs(m.sponsorY-m.signoffY),`width=${width}`).toBeLessThan(3);
    expect(m.outerWidth).toBeLessThanOrEqual(width);
  }
});
