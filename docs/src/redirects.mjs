// Old docs.deployrr.app (WikiDocs) paths and where they live now.
// Every old path listed in a page's `old_paths` frontmatter must have an entry here, and the reverse.
// `npm run check` enforces this. Never remove an entry: old links in shipped Deployrr versions depend on them.
// Exception: if an old path is the same as the page's new address (like /apps/authentik-removal),
// the page itself answers it, so it must not have a redirect. This covers every page under /apps/.
export const redirects = {
	'/deployrr/quick-start-guide': '/getting-started/quick-start/',
	'/deployrr/updating-deployrr': '/getting-started/updating-deployrr/',
	'/deployrr/references': '/getting-started/videos-and-guides/',
	// Printed by shipped Deployrr versions. Must keep working.
	'/deployrr/forgot-pin': '/using-deployrr/forgot-pin/',
	'/deployrr/change-hostname': '/using-deployrr/change-hostname/',
	'/operating-system/bash-aliases-explained': '/using-deployrr/bash-aliases/',
	'/docker/custom.yml-usage': '/using-deployrr/custom-yml/',
	'/docker/second-instances-of-apps': '/using-deployrr/second-app-instances/',
	'/networking/connecting-applications-together': '/using-deployrr/connecting-apps/',
	'/traefik/check-traefik-logs': '/reverse-proxy/check-traefik-logs/',
	'/traefik/point-root-domain-to-a-dashboard': '/reverse-proxy/point-root-domain-to-a-dashboard/',
	'/traefik/multi-server-same-domain': '/reverse-proxy/multi-server-same-domain/',
	'/traefik/setup-auth-bypass-using-file-provider': '/reverse-proxy/setup-auth-bypass-using-file-provider/',
	'/traefik/restrict-access-using-ip-allowlist': '/reverse-proxy/restrict-access-using-ip-allowlist/',
	'/networking/ufw-firewall-vps-dedi': '/networking/ufw-firewall-vps/',
	'/docker/docker-compose-malformed': '/docker/compose-malformed/',
	'/docker/docker-rate-limit': '/docker/rate-limit/',
	'/docker/internet-connectivity-problem': '/docker/no-internet-in-containers/',
	'/docker/waiting-for-container-to-start': '/docker/waiting-for-container/',
	'/operating-system/failed-to-create-shim-task-debian': '/host/shim-task-debian/',
};

// Redirects that do not belong to a single page's old_paths.
export const extraRedirects = {
	// A dead link on the old site. Sends readers to the support section.
	'/deployrr/get-support': '/support/discord/',
};
