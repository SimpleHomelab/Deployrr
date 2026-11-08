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
	.regex(/^[a-z0-9-]+(\/[a-z0-9-]+)*$/, 'Use a page slug like "using-deployrr/forgot-pin", no leading slash');

const docsExtension = z.object({
	description: z.string().min(50).max(160),
	type: z.enum(['how-to', 'troubleshooting', 'guide', 'reference', 'archive']),
	tags: z.array(z.enum(tagIds as [string, ...string[]])).min(1).max(6),
	applies_to: z.string().regex(/^v\d+(\.\d+)*\+?$/, 'Use a version like "v6.0+"'),
	apps: z.array(z.enum(appIds as [string, ...string[]])).optional(),
	symptoms: z.array(z.string().min(1)).optional(),
	related: z.array(slug).min(2).max(5),
	further_reading: z
		.array(z.object({ title: z.string().min(1), url: z.url() }))
		.default([]),
	last_reviewed: z.coerce.date(),
	status: z.enum(['current', 'needs-review', 'archived']),
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
