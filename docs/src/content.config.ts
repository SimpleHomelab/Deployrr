import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

// Closed tag list, read from docs/tags.yml.
const tagsFile = fileURLToPath(new URL('../tags.yml', import.meta.url));
const tagIds = Object.keys(parse(readFileSync(tagsFile, 'utf8')).tags ?? {});
if (tagIds.length === 0) throw new Error('tags.yml has no tags');

// App ids: folder names under the repo's apps/<group>/ directories.
const appsRoot = fileURLToPath(new URL('../../apps/', import.meta.url));
const appIds = readdirSync(appsRoot)
	.filter((group) => statSync(appsRoot + group).isDirectory())
	.flatMap((group) =>
		readdirSync(appsRoot + group).filter((name) => statSync(`${appsRoot}${group}/${name}`).isDirectory())
	);
if (appIds.length === 0) throw new Error('No app folders found under apps/');

const slug = z
	.string()
	.regex(/^[a-z0-9-]+(\/[a-z0-9-]+)*$/, 'Use a page slug like "support/forgot-pin", no leading slash');

const docsExtension = z.object({
	// Optional here so pages that aren't articles (homepage, tag pages) render through
	// <StarlightPage/>. scripts/check-content.mjs requires these on every article.
	description: z.string().max(160).optional(),
	type: z.enum(['how-to', 'troubleshooting', 'guide', 'reference', 'archive']).optional(),
	tags: z.array(z.enum(tagIds as [string, ...string[]])).min(1).max(6).optional(),
	applies_to: z.string().regex(/^v\d+(\.\d+)*\+?$/, 'Use a version like "v6.0+"').optional(),
	apps: z.array(z.enum(appIds as [string, ...string[]])).optional(),
	symptoms: z.array(z.string().min(1)).optional(),
	related: z.array(slug).min(2).max(5).optional(),
	further_reading: z
		.array(z.object({ title: z.string().min(1), url: z.url() }))
		.default([]),
	// Video chapters shown in the "Watch" box. start is seconds from the start of the video.
	videos: z
		.array(
			z.object({
				id: z.string().regex(/^[A-Za-z0-9_-]{11}$/, 'Use the 11-character YouTube video id'),
				start: z.number().int().min(0).default(0),
				title: z.string().min(1),
				note: z.string().min(1).optional(),
			})
		)
		.max(3)
		.default([]),
	last_reviewed: z.coerce.date().optional(),
	status: z.enum(['current', 'needs-review', 'archived']).optional(),
	old_paths: z.array(z.string().regex(/^\/[a-z0-9._-]+\/[a-z0-9._-]+$/)).default([]),
	sources: z
		.array(z.object({ type: z.enum(['issue', 'discord']), ref: z.string().min(1) }))
		.default([]),
});

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: (context) =>
			docsSchema({ extend: docsExtension })(context).superRefine((data, ctx) => {
				// Article rules only apply to articles (pages with a type).
				if (data.type === undefined) return;
				if (data.type === 'troubleshooting' && !(data.symptoms && data.symptoms.length > 0)) {
					ctx.addIssue({ code: 'custom', path: ['symptoms'], message: 'Troubleshooting pages need symptoms' });
				}
				if ((data.type === 'archive') !== (data.status === 'archived')) {
					ctx.addIssue({
						code: 'custom',
						path: ['status'],
						message: 'Use type "archive" together with status "archived"',
					});
				}
			}),
	}),
};
