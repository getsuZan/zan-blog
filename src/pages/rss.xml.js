import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const items = (await getCollection('posts', ({ data }) => !data.draft))
    .sort((a, b) => +b.data.date - +a.data.date);
  return rss({
    title: 'zan-blog',
    description: 'Personal notes on interests and research.',
    site: context.site ?? 'https://getsuZan.github.io',
    items: items.map(p => ({
      title: p.data.title,
      description: p.data.excerpt,
      pubDate: p.data.date,
      link: `/blog/${p.slug}/`,
    })),
  });
}
