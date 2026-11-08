#!/usr/bin/env node
// Content checks that the frontmatter schema can't do on its own.
//
// Usage: node scripts/check-content.mjs [--no-orphans]
//
// --no-orphans  Skip the checks that only make sense once the whole site exists:
//               pages with fewer than 2 inbound links, tags in tags.yml that no page uses,
//               extra redirects that point at pages not written yet, and `related` entries
//               for pages not written yet (these become warnings).

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { redirects, extraRedirects } from '../src/redirects.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const contentDir = join(root, 'src/content/docs');
const strict = !process.argv.includes('--no-orphans');
const MIN_INBOUND = 2;

const errors = [];
const warnings = [];
const fail = (file, message) => errors.push(`${file}: ${message}`);

function walk(dir) {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) return walk(path);
		return /\.mdx?$/.test(name) ? [path] : [];
	});
}

function toSlug(file) {
	const rel = relative(contentDir, file).split('\\').join('/').replace(/\.mdx?$/, '');
	return rel.replace(/(^|\/)index$/, '').toLowerCase();
}

function splitFrontmatter(text) {
	const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!match) return { data: {}, body: text };
	return { data: parse(match[1]) ?? {}, body: text.slice(match[0].length) };
}

// Turn a link target into a page slug, or null if it's external or not a page link.
function linkToSlug(target, fromSlug) {
	if (/^[a-z]+:/i.test(target) || target.startsWith('#') || target.startsWith('//')) return null;
	let path = target.split('#')[0].split('?')[0];
	if (!path) return null;
	if (!path.startsWith('/')) {
		// Relative links resolve from the page URL, which ends in a slash.
		path = posix.join('/', fromSlug, '/', path);
	}
	path = posix.normalize(path).replace(/^\/+|\/+$/g, '').replace(/\.mdx?$/, '');
	return path.toLowerCase();
}

// Load tags.
const tagsConfig = parse(readFileSync(join(root, 'tags.yml'), 'utf8'));
const knownTags = new Map(Object.entries(tagsConfig?.tags ?? {}));
for (const [id, tag] of knownTags) {
	if (!tag?.label) fail('tags.yml', `tag "${id}" has no label`);
	if (!tag?.description) fail('tags.yml', `tag "${id}" has no description`);
}

// Load pages.
const pages = new Map();
for (const file of walk(contentDir)) {
	const text = readFileSync(file, 'utf8');
	const { data, body } = splitFrontmatter(text);
	pages.set(toSlug(file), { file: relative(root, file), data, body, text });
}

const usedTags = new Set();
const inbound = new Map([...pages.keys()].map((slug) => [slug, new Set()]));
const oldPathOwners = new Map();

for (const [slug, page] of pages) {
	const { file, data, body, text } = page;

	// No em dashes anywhere in the file.
	text.split('\n').forEach((line, i) => {
		if (line.includes('\u2014')) fail(`${file}:${i + 1}`, 'contains an em dash; use a comma, colon or full stop');
	});

	// Related pages exist and aren't this page.
	for (const target of data.related ?? []) {
		if (target === slug) fail(file, `"related" lists the page itself`);
		else if (!pages.has(target)) {
			if (strict) fail(file, `"related" points at a page that does not exist: ${target}`);
			else warnings.push(`${file}: "related" points at a page that does not exist yet: ${target}`);
		}
		else inbound.get(target).add(slug);
	}

	// Tags are in tags.yml.
	for (const tag of data.tags ?? []) {
		usedTags.add(tag);
		if (!knownTags.has(tag)) fail(file, `tag "${tag}" is not in tags.yml`);
	}

	// Body links: no self links, count inbound links.
	const linkPattern = /\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)|href=["']([^"']+)["']/g;
	for (const match of body.matchAll(linkPattern)) {
		const target = match[1] ?? match[2];
		if (target.startsWith('#')) continue;
		const targetSlug = linkToSlug(target, slug);
		if (targetSlug === null) continue;
		if (targetSlug === slug) fail(file, `links to itself: ${target}`);
		else if (inbound.has(targetSlug)) inbound.get(targetSlug).add(slug);
	}

	// Images have alt text.
	for (const match of body.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)) {
		if (!match[1].trim()) fail(file, `image without alt text: ${match[2]}`);
	}
	for (const match of body.matchAll(/<img\b[^>]*>/gi)) {
		if (!/\balt=["'][^"']+["']/i.test(match[0])) fail(file, `<img> without alt text: ${match[0]}`);
	}

	// Old paths have redirects to this page.
	for (const oldPath of data.old_paths ?? []) {
		if (oldPathOwners.has(oldPath)) fail(file, `old path ${oldPath} is also claimed by ${oldPathOwners.get(oldPath)}`);
		oldPathOwners.set(oldPath, file);
		const target = redirects[oldPath];
		if (!target) fail(file, `old path ${oldPath} has no entry in src/redirects.mjs`);
		else if (linkToSlug(target, '') !== slug) fail(file, `redirect for ${oldPath} goes to ${target}, not /${slug}/`);
	}
}

// Every redirect belongs to a page's old_paths.
for (const [from, to] of Object.entries(redirects)) {
	if (!oldPathOwners.has(from)) fail('src/redirects.mjs', `redirect ${from} -> ${to} is not in any page's old_paths`);
}
for (const [from, to] of Object.entries(extraRedirects)) {
	if (redirects[from]) fail('src/redirects.mjs', `${from} is in both redirects and extraRedirects`);
	if (strict && !pages.has(linkToSlug(to, ''))) fail('src/redirects.mjs', `extra redirect ${from} -> ${to} points at a missing page`);
}

if (strict) {
	for (const [slug, sources] of inbound) {
		if (sources.size < MIN_INBOUND) {
			fail(pages.get(slug).file, `only ${sources.size} other page(s) link here; needs at least ${MIN_INBOUND}`);
		}
	}
	for (const id of knownTags.keys()) {
		if (!usedTags.has(id)) fail('tags.yml', `tag "${id}" is not used by any page`);
	}
}

for (const warning of warnings) console.warn(`  warning: ${warning}`);
if (errors.length > 0) {
	console.error(`Content check failed with ${errors.length} problem(s):\n`);
	for (const error of errors) console.error(`  - ${error}`);
	process.exit(1);
}
console.log(`Content check passed: ${pages.size} page(s)${strict ? '' : ' (orphan, unused tag and redirect target checks skipped)'}.`);
