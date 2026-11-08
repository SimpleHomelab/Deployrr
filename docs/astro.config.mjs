// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import starlightTags from 'starlight-tags';
import starlightLlmsTxt from 'starlight-llms-txt';
import { existsSync, readdirSync } from 'node:fs';
import { redirects, extraRedirects } from './src/redirects.mjs';
import { sections } from './src/sections.mjs';

const contentDir = new URL('./src/content/docs/', import.meta.url);

// Only list sections that have at least one page, in the fixed order from sections.mjs.
const sectionGroups = sections
	.filter(({ dir }) => {
		const url = new URL(`${dir}/`, contentDir);
		return existsSync(url) && readdirSync(url).some((f) => /\.mdx?$/.test(f));
	})
	.map(({ dir, label }) => ({
		label,
		collapsed: dir === 'archive',
		items: [{ autogenerate: { directory: dir } }],
	}));

export default defineConfig({
	site: 'https://docs.deployrr.app',
	redirects: { ...redirects, ...extraRedirects },
	integrations: [
		starlight({
			title: 'Deployrr Docs',
			description: 'Fix problems and get more out of Deployrr, the homelab app installer.',
			logo: {
				light: './src/assets/deployrr-logo.png',
				dark: './src/assets/deployrr-logo-dark.png',
				alt: 'Deployrr',
				replacesTitle: true,
			},
			favicon: '/favicon.png',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/SimpleHomelab/Deployrr' },
				{ icon: 'discord', label: 'Discord', href: 'https://www.simplehomelab.com/discord/' },
			],
			editLink: {
				baseUrl: 'https://github.com/SimpleHomelab/Deployrr/edit/main/docs/',
			},
			lastUpdated: true,
			disable404Route: true,
			customCss: ['./src/styles/custom.css'],
			components: {
				Footer: './src/components/Footer.astro',
				PageTitle: './src/components/PageTitle.astro',
			},
			sidebar: [
				{ label: 'Troubleshooting', link: '/troubleshooting/' },
				...sectionGroups,
				{ label: 'Browse by tag', link: '/tags/' },
			],
			plugins: [
				starlightLinksValidator(),
				starlightTags({ configPath: 'tags.yml', sidebar: false }),
				starlightLlmsTxt({
					projectName: 'Deployrr',
					description: 'User documentation for Deployrr, a tool that installs and manages Docker apps on a homelab server.',
				}),
			],
		}),
	],
});
