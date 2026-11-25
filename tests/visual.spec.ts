import { test, expect } from '@playwright/test';

const source = 'http://127.0.0.1:8777/';
const target = 'http://127.0.0.1:4333/';
const viewports = [[1440,900],[900,1200],[390,844]] as const;

// Navigation, installation command, and the philosophy quote were deliberately
// updated after the original pixel-perfect migration. Compare unchanged areas.
// Cropped screenshot parity covers the unchanged, pre-quote sections. Later
// sections retain DOM/geometry parity checks, since the shorter quote shifts
// their sub-pixel raster origin in the document.
// Features headline and documentation label have intentionally changed. Keep
// pixel parity limited to unchanged sections.
// How it works now describes installation and media sources rather than the original mock.
const regions = ['#app'] as const;
const normalizeCss = `
/* Compare both implementations with identical fonts, independently of the
   intentional switch from external Google Fonts to local variable fonts. */
:root{--f-ui:Arial,sans-serif!important;--f-mono:monospace!important}
*,*::before,*::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
/* Prevent sticky-header overlays from differing when preceding section heights change. */
.nav { position: static !important; }
.rv { opacity: 1 !important; transform: none !important; }
.tline { opacity: 1 !important; transform: none !important; }
.icaret { visibility: hidden !important; }
`;

for (const [width,height] of viewports) {
  for (const theme of ['dark','light'] as const) {
    test(`unchanged-region pixel comparison ${width}x${height} ${theme}`, async ({page}) => {
      await page.setViewportSize({width,height});
      await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());

      const screenshots: Array<Record<string,string>> = [];
      for (const url of [source,target]) {
        await page.goto(url, {waitUntil:'domcontentloaded'});
        await page.evaluate(() => localStorage.removeItem('fg-theme'));
        await page.reload({waitUntil:'domcontentloaded'});
        if (theme === 'light') await page.locator('#themeBtn').click();
        await page.addStyleTag({content:normalizeCss});
        await page.locator('#app').scrollIntoViewIfNeeded();
        await expect(page.locator('#apMain')).not.toBeEmpty();
        await page.evaluate(async () => {
          const images = Array.from(document.querySelectorAll('img'));
          images.forEach(img => img.loading = 'eager');
          await Promise.all(images.map(img => img.decode().catch(() => null)));
        });
        // Isolate the unchanged app at an integer pixel origin. The new
        // landing sections intentionally shift its document position.
        await page.locator('#app').evaluate(el => {
          const box=el.getBoundingClientRect();
          Object.assign((el as HTMLElement).style, {
            position:'fixed',top:'0px',left:'0px',margin:'0',
            width:Math.round(box.width)+'px',height:Math.round(box.height)+'px',
            zIndex:'1000',
          });
        });
        await page.waitForTimeout(150);
        const captures: Record<string,string> = {};
        for (const selector of regions) {
          captures[selector] = (await page.locator(selector).screenshot({animations:'disabled', mask: selector==='#app' ? [page.locator('.ap-rail')] : []})).toString('base64');
        }
        screenshots.push(captures);
      }

      for (const selector of regions) {
        const first=screenshots[0][selector], second=screenshots[1][selector];
        const result = await page.evaluate(async ([first,second]) => {
          const load = async (base64:string) => {
            const image = new Image();
            image.src = 'data:image/png;base64,' + base64;
            await image.decode();
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const context = canvas.getContext('2d', {willReadFrequently:true})!;
            context.drawImage(image,0,0);
            return {width:image.width,height:image.height,data:context.getImageData(0,0,image.width,image.height).data};
          };
          const a = await load(first), b = await load(second);
          // Element screenshot bounds can round differently by 1 CSS pixel
          // when a preceding (deliberately changed) section shifts document Y.
          if (Math.abs(a.width-b.width)>1 || Math.abs(a.height-b.height)>1)
            return {sameSize:false,a:[a.width,a.height],b:[b.width,b.height],difference:100};
          const width=Math.min(a.width,b.width),height=Math.min(a.height,b.height);
          let best=100,offset=[0,0];
          // Compare the common content, tolerating only a 1px raster offset.
          for(let dy=-1;dy<=1;dy++){
            for(let dx=-1;dx<=1;dx++){
              let changed=0,total=0;
              for(let y=2;y<height-2;y++){
                for(let x=2;x<width-2;x++){
                  const ai=(y*a.width+x)*4,bi=((y+dy)*b.width+x+dx)*4;
                  const diff=Math.max(Math.abs(a.data[ai]-b.data[bi]),Math.abs(a.data[ai+1]-b.data[bi+1]),Math.abs(a.data[ai+2]-b.data[bi+2]));
                  if(diff>10)changed++;
                  total++;
                }
              }
              const percent=changed/total*100;
              if(percent<best){best=percent;offset=[dx,dy]}
            }
          }
          return {sameSize:true,dimensions:[a.width,a.height,b.width,b.height],difference:best,offset};
        }, [first,second] as [string,string]);
        expect(result.sameSize, `${selector}: ${JSON.stringify(result)}`).toBe(true);
        expect(result.difference, `${selector}: ${JSON.stringify(result)}`).toBeLessThan(0.5);
      }
    });
  }
}
