// Old docs.deployrr.app (WikiDocs) paths and where they live now.
// Every old path listed in a page's `old_paths` frontmatter must have an entry here, and the reverse.
// `npm run check` enforces this. Never remove an entry: old links in shipped Deployrr versions depend on them.
export const redirects = {};

// Redirects that do not belong to a single page's old_paths.
export const extraRedirects = {
	// A dead link on the old site. Sends readers to the support section.
	'/deployrr/get-support': '/support/discord/',
};
