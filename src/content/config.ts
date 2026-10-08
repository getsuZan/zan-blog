import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    tags: z.array(z.string()).default([]),
    type: z.enum(['post', 'opinion']).default('post'),
    draft: z.boolean().default(false),
    link: z.string().optional(),
    cover: z.string().optional(),
  }),
});

export const collections = { posts };
