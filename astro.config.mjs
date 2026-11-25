import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  site: 'https://foldergram.app',
  output: 'static',
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: ['400 800'],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['-apple-system', 'Segoe UI', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains',
      weights: ['400 600'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['SFMono-Regular', 'monospace'],
    },
  ],
});
