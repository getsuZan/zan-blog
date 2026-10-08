import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Project page: https://getsuzan.github.io/zan-blog/ -> base '/zan-blog/'
// If moved to user site <user>.github.io repo, set base: '/'
export default defineConfig({
  site: 'https://getsuzan.github.io/zan-blog',
  base: '/zan-blog/',
  integrations: [mdx(), sitemap()],
  vite: { plugins: [tailwindcss()] },
});
