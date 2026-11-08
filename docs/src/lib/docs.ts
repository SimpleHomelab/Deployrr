import { getCollection, type CollectionEntry } from 'astro:content';
import { sections } from '../sections.mjs';

export type DocEntry = CollectionEntry<'docs'>;

/** URL of a docs entry. */
export const docHref = (entry: DocEntry) => `/${entry.id}/`;

/** Section folder of a docs entry, e.g. "getting-started". */
export const sectionOf = (entry: DocEntry) => entry.id.split('/')[0];

/** All published docs pages, sorted by sidebar order then title. */
export async function getDocs(): Promise<DocEntry[]> {
	const order = new Map(sections.map((s, i) => [s.dir, i]));
	const entries = await getCollection('docs', (entry) => !entry.data.draft);
	return entries.sort((a, b) => {
		const sa = order.get(sectionOf(a)) ?? 99;
		const sb = order.get(sectionOf(b)) ?? 99;
		if (sa !== sb) return sa - sb;
		const oa = a.data.sidebar?.order ?? 999;
		const ob = b.data.sidebar?.order ?? 999;
		if (oa !== ob) return oa - ob;
		return a.data.title.localeCompare(b.data.title);
	});
}

/** First page in a section, if the section has any pages. */
export async function firstInSection(dir: string): Promise<DocEntry | undefined> {
	return (await getDocs()).find((entry) => sectionOf(entry) === dir);
}
