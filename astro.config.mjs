import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// User site: https://getsuZan.github.io  -> base '/'
// If switched to project page getsuZan.github.io/zan-blog, set base: '/zan-blog/'
export default defineConfig({
  site: 'https://getsuZan.github.io',
  base: '/',
  integrations: [mdx(), sitemap()],
  vite: { plugins: [tailwindcss()] },
});
