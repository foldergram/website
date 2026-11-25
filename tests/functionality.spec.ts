import { test, expect } from '@playwright/test';

const url = 'http://127.0.0.1:4333/';

test.beforeEach(async ({page}) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  await page.goto(url, {waitUntil:'domcontentloaded'});
  await page.locator('#app').scrollIntoViewIfNeeded();
  await expect(page.locator('html')).toHaveClass(/preview-ready/);
});

test('feed sorting, likes and saved collections', async ({page}) => {
  await expect(page.locator('.ap-post')).not.toHaveCount(0);
  await page.locator('[data-mode="Rediscover"]').click();
  await expect(page.locator('[data-mode="Rediscover"]')).toHaveClass(/act/);
  await page.locator('[data-mode="Recent"]').click();
  const firstLike = page.locator('[data-act="like"]').first();
  const seed = await firstLike.getAttribute('data-s');
  await firstLike.click();
  await expect(page.locator('[data-act="like"]').first()).toHaveAttribute('aria-pressed','true');
  await page.locator('[data-act="save"]').first().click();
  await page.locator('.ap-side [data-nav="likes"]').click();
  await expect(page.locator('.ap-media-collection img')).toHaveCount(5);
  await page.locator('.ap-side [data-nav="saved"]').click();
  await page.locator('[data-act="collection"]').click();
  await expect(page.locator('.ap-media-collection img')).toHaveCount(5);
  expect(seed).toBeTruthy();
});

test('explore tabs, library sorting, profiles and home return', async ({page}) => {
  await page.locator('[data-nav="search"]').click();
  await page.locator('#apQ').fill('Animal');
  await expect(page.locator('#apQTabs')).toBeVisible();
  await page.locator('[data-explore-tab="folders"]').click();
  await expect(page.locator('#apQFolders')).toBeVisible();
  await page.locator('[data-act="goprofile"][data-p="animal"]').first().click();
  await expect(page.locator('.ap-prof h2')).toHaveText('Animal Planet');
  await page.getByRole('tab',{name:'Reels'}).click();
  await expect(page.locator('.ap-gridr img')).not.toHaveCount(0);
  await page.locator('.ap-back').click();
  await expect(page.locator('[data-nav="home"]')).toHaveClass(/act/);
  await page.locator('[data-nav="library"]').click();
  await page.locator('#libSort').selectOption('name-desc');
  await expect(page.locator('#libList .ap-lrow').first()).toHaveAttribute('data-name','urban planet');
  await page.locator('#libQ').fill('coffee');
  await expect(page.locator('.ap-library .ap-count')).toHaveText('1 result');
});

test('story playback pause, navigation and escape cleanup', async ({page}) => {
  await page.locator('.ap-story[data-story="0"]').click();
  await expect(page.locator('#sv')).toHaveClass(/show/);
  await expect(page.locator('#svCount')).toHaveText('1/3');
  await page.locator('#svPause').click();
  await expect(page.locator('#svPause')).toHaveAttribute('aria-label','Resume story');
  await page.locator('#svNext').click();
  await expect(page.locator('#svCount')).toHaveText('2/3');
  await page.keyboard.press('Escape');
  await expect(page.locator('#sv')).not.toHaveClass(/show/);
  await expect(page.locator('body')).not.toHaveAttribute('style',/overflow: hidden/);
});

test('reels load video, seek, mute, navigate and release old video', async ({page}) => {
  await page.locator('[data-nav="reels"]').click();
  await expect(page.locator('#rcVideo')).toHaveAttribute('src','demo-media/reel-animal.mp4');
  await expect.poll(() => page.locator('#rcVideo').evaluate((v:HTMLVideoElement) => v.readyState)).toBeGreaterThan(0);
  await page.locator('#rcMute').click();
  await expect(page.locator('#rcMute')).toHaveAttribute('aria-label','Mute reel');
  const oldVideo = await page.locator('#rcVideo').elementHandle();
  await page.locator('[data-rc="down"]').click();
  await expect(page.locator('#rcVideo')).toHaveAttribute('src','demo-media/reel-nature.mp4');
  expect(await oldVideo!.evaluate((v:HTMLVideoElement) => v.hasAttribute('src'))).toBe(false);
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#rcVideo')).toHaveAttribute('src','demo-media/reel-urban.mp4');
  await page.locator('[data-nav="home"]').click();
  await expect(page.locator('#rcVideo')).toHaveCount(0);
});

test('mobile menu and hero preview link', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:390,height:844});
  await page.locator('#mbtn').click();
  await expect(page.locator('#mnav')).toHaveClass(/open/);
  await page.locator('#mnav a[href="#features"]').click();
  await expect(page.locator('#mnav')).not.toHaveClass(/open/);
  await page.evaluate(() => window.scrollTo({top:0,behavior:'instant'}));
  await page.locator('#ctaDemo').click();
  await expect(page).toHaveURL(/#demo$/);
  await expect(page.locator('#apMain')).not.toBeEmpty();
});

test('unsupported feature notice links to the full demo', async ({page}) => {
  await page.setViewportSize({width:1280,height:800});
  await page.locator('#apBurger').click();
  await expect(page.locator('#toast')).toContainText('limited interactive preview');
  await expect(page.locator('#toast a')).toHaveAttribute('href','https://demo.foldergram.app/');
});
