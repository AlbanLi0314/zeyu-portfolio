// 1. Import utilities from `astro:content`
import { defineCollection, z } from "astro:content";

// 2. Import loader(s)
import { glob } from "astro/loaders";

// 3. Define your collection(s)
const blog = defineCollection({
    loader: glob({
        pattern: "**/*.md",
        base: "./src/content/BlogPosts",
    }),
    schema: z.object({
        title: z.string(),
        date: z.string(),
        excerpt: z.string(),
        tags: z.array(z.string()).optional(),
    }),
});

const papers = defineCollection({
    loader: glob({
        pattern: "**/*.md",
        base: "./src/content/papers",
    }),
    schema: z.object({
        title: z.string(),
        authors: z.array(z.string()),
        venue: z.string().optional(),
        year: z.number(),
        status: z.string().optional(),
        link: z.string().optional(),
        doi: z.string().optional(),
        pdf: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        featured: z.boolean().optional(),
    }),
});

const patents = defineCollection({
    loader: glob({
        pattern: "**/*.md",
        base: "./src/content/patents",
    }),
    schema: z.object({
        title: z.string(),
        inventors: z.array(z.string()),
        number: z.string().optional(),
        status: z.enum(['granted', 'pending']).optional(),
        year: z.number().optional(),
        link: z.string().optional(),
        summary: z.string().optional(),
    }),
});

const teaching = defineCollection({
    loader: glob({
        pattern: "**/*.md",
        base: "./src/content/teaching",
    }),
    schema: z.object({
        role: z.string(),
        course: z.string(),
        term: z.string(),
        institution: z.string(),
        link: z.string().optional(),
        notes: z.string().optional(),
    }),
});

const series = defineCollection({
    loader: glob({
        pattern: "**/*.md",
        base: "./src/content/series",
    }),
    schema: z.object({
        title: z.string(),
        date: z.string(),
        tags: z.array(z.string()).optional(),
        summary: z.string().optional(),
        draft: z.boolean().optional(),
    }),
});

// 4. Export a single `collections` object to register your collection(s)
export const collections = { blog, papers, patents, teaching, series };
