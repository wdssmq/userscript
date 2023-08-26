import { defineCollection, z } from 'astro:content';

const gm_md = defineCollection({
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Transform string to Date object
    pubDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    updateDate: z
      .string()
      .or(z.date())
      .optional()
      .transform((str) => (str ? new Date(str) : undefined)),
    heroImage: z.string().optional(),
    gitUrl: z.string().optional(),
    gitUrlRaw: z.string().optional(),
    cdnUrl: z.string().optional(),
    docUrl: z.string().optional(),
    tags: z.array(z.string().or(z.number()).transform((val) => val.toString())),
  }),
});

export const collections = { gm_md };
