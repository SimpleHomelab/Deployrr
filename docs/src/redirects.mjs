// Old docs.deployrr.app (WikiDocs) paths and where they live now.
// Every old path listed in a page's `old_paths` frontmatter must have an entry here, and the reverse.
// `npm run check` enforces this. Never remove an entry: old links in shipped Deployrr versions depend on them.
// Exception: if an old path is the same as the page's new address (like /apps/home-assistant-behind-traefik),
// the page itself answers it, so it must not have a redirect.
export const redirects = {
	'/deployrr/quick-start-guide': '/getting-started/quick-start/',
	'/deployrr/updating-deployrr': '/getting-started/updating-deployrr/',
	'/deployrr/references': '/getting-started/videos-and-guides/',
	// Printed by shipped Deployrr versions. Must keep working.
	'/deployrr/forgot-pin': '/support/forgot-pin/',
	// Printed by shipped Deployrr versions. Must keep working.
	'/traefik/traefik-minimum-supported-docker-api': '/docker/lazydocker/',
	'/deployrr/change-hostname': '/host/change-hostname/',
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
	'/operating-system/rclone-mount-point-not-empty-error': '/storage/rclone-mount-not-empty/',
	'/deployrr/get-support-on-discord': '/support/discord/',
	'/deployrr/get-support-via-ssh': '/support/ssh-access/',
	'/deployrr/v4-to-v5-migration': '/archive/v4-to-v5-migration/',
	'/deployrr/deployarr-to-deployrr': '/archive/deployarr-to-deployrr/',
	// Pages moved to new sections in November 2026.
	'/host/system-checks-failed': '/getting-started/system-checks-failed/',
	'/networking/domain-checks-failed': '/getting-started/domain-checks-failed/',
	'/using-deployrr/requirements-not-met': '/getting-started/requirements-not-met/',
	'/using-deployrr/expert-mode': '/getting-started/expert-mode/',
	'/using-deployrr/reset-or-remove-deployrr': '/getting-started/reset-or-remove-deployrr/',
	'/apps/manage-apps': '/using-deployrr/manage-apps/',
	'/apps/reinstall-app': '/using-deployrr/reinstall-app/',
	'/apps/authentik-removal': '/reverse-proxy/authentik-removal/',
	'/apps/port-already-in-use': '/docker/port-already-in-use/',
	'/using-deployrr/folders': '/storage/folders/',
	'/host/smb-nfs-mounts': '/storage/smb-nfs-mounts/',
	'/host/rclone-smb-setup': '/storage/rclone-smb-setup/',
	'/host/rclone-mount-not-empty': '/storage/rclone-mount-not-empty/',
	'/host/move-data-to-another-disk': '/storage/move-data-to-another-disk/',
	'/host/fstab-boot-recovery': '/storage/fstab-boot-recovery/',
	'/using-deployrr/change-server-ip': '/host/change-server-ip/',
	'/using-deployrr/change-hostname': '/host/change-hostname/',
	'/using-deployrr/diagnostics': '/support/diagnostics/',
	'/using-deployrr/forgot-pin': '/support/forgot-pin/',
	'/using-deployrr/help-menu': '/support/help-menu/',
};

// Redirects that do not belong to a single page's old_paths.
export const extraRedirects = {
	// A dead link on the old site. Sends readers to the support section.
	'/deployrr/get-support': '/support/discord/',
};
