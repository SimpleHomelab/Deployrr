<h1>Changelog</h1><p>Upgrade steps and details per release: see <a href="releases/">releases/</a>.</p>

## 6.0.40

### Patch Changes

- 6819d91: Bump Deployrr Dashboard (Homepage) default version from v1.9.0 to v2.7.0.
- 7be3126: Check Pins is now a report only and no longer changes your `.env`. Before, it offered to update every pin that differed from the recommended one, including downgrades (for example Traefik 3.7.17 to 3.6). It now lists, one app per line, the pins where Deployrr recommends a newer version, the pins that are newer than recommended (kept), and tags it can't compare (such as `latest` or `16-alpine`) for you to check manually. A leading "v" no longer counts as a difference (v1.9.0 and 1.9.0 match). To update an app, change its pin in Settings > Version Pins (Pro), run Update Stack, and check the app's logs. Compose and config changes still need a reinstall.
- 170e98a: Refresh the default Deployrr Dashboard look: hairline cards, refined stat blocks, monospace numbers, status dots, equal-height cards, app group icons, quick launch search, a date/time widget, and CPU temperature and uptime in the resources widget. Fix two bookmark descriptions that did not show. Add a `DEPLOYRRDASHBOARD_AUTH_ENABLED` variable (default `false`) as groundwork for Homepage's built-in login.
- 9b061a5: Bump Traefik default version from 3.6 to 3.7.17 (fixes CVE-2026-88011 and CVE-2026-88004). Existing installs keep their current pin until they change it in Settings > Version Pins (Pro) or delete and reinstall Traefik. A reinstall is also needed for the new Traefik security settings.
- 9b061a5: Traefik: set `aliasHeadersStrategy=delete` on all entrypoints to block header alias spoofing (for example `X_Auth_User` read as `X-Auth-User` by backends) and silence the Traefik 3.7 startup warning. Applies to new installs and Traefik reinstalls.
- 9b061a5: Traefik: reject encoded null characters and backslashes in request paths on the websecure entrypoints. Other encoded characters stay allowed, so Nextcloud/WebDAV, Gitea and Grafana should be unaffected. Applies to new installs and Traefik reinstalls.

## 6.0.39

### Patch Changes

- FIX: PIN reset and PIN request calls no longer fail on Cloudflare security challenges.

## 6.0.38

### Patch Changes

- 8a95076: variables with hyphens fixed to underscores
- fa9a1cf: Add deployrr update CLI command and update standalone installer to write version metadata and tracking info.
- NEW: Added the `deployrr update` command-line option, allowing users to update Deployrr directly from the terminal.
- ENHANCEMENT: Updated the standalone `curl` installer to fetch package semantic version and write it to `/opt/deployrr/version.txt`.
- ENHANCEMENT: Added `INSTALL_METHOD` tracking to both `curl` and `npx` installers, enabling the updater to execute the correct update command automatically.

## 6.0.37

### Patch Changes

- 235c65d: ENHANCEMENT: Switched application launch update checks to query the official NPM registry for semantic version upgrades. Users will now be prompted directly with the exact command (`sudo npx @simplehomelab/deployrr@latest`) to update to the latest patch version, significantly improving the upgrade path from older curl-based binary downloads.

## 6.0.36

### Patch Changes

- ENHANCEMENT: Switched application launch update checks to query the official NPM registry for semantic version upgrades. Users will now be prompted directly with the exact command (`sudo npx @simplehomelab/deployrr@latest`) to update to the latest patch version, significantly improving the upgrade path from older curl-based binary downloads.
- 7deff8b: fixes GPU Detection TUI issue
- 87c57e7: Fix Service-status
- 79775ac: FIX: Fixed Cloudflare Tunnel (and qBittorrent VPN) installation failing with "OCI runtime create failed: not a directory" because the pre-install hook never executed. The jq `//` operator in `f_deploy_app` checked `.preInstall` first (the dialog config object), which shadowed `.hooks.preInstall` (the actual script path). Swapped precedence so `.hooks.preInstall` is resolved first. Also hardened the pre-install hook to detect and remove stale `hosts/` directories left by previous failed Docker runs.
  FIX: Fixed "Permission denied" when writing settings in unprivileged LXC environments. The `set_setting` and `_write_variable` functions now `chown root:root` the temp file before `tee` appends, then restore the original ownership and permissions before replacement.
- 2b35b1d: FIX: Fixed secrets with `addToCompose: false` not being written to `.env`, causing Docker Compose warnings like `The "OPENWEBUI_SECRET_KEY" variable is not set`. Root cause was jq's `//` operator treating `false` as falsy (`false // true` → `true`), silently ignoring `addToCompose: false` in manifests. Affected ~30 secrets across ~10 apps including Open-WebUI, Vaultwarden, Sshwifty, DDNS-Updater, Supabase, and Langfuse.
- 5957755: FIX: Fixed Homarr failing to start with `Invalid environment variables: SECRET_ENCRYPTION_KEY is required`. Homarr v1.x requires a 64-character hex encryption key that was not being generated or passed to the container. Added auto-generation via `openssl_rand_hex_32` in the manifest and mapped it to the `SECRET_ENCRYPTION_KEY` environment variable in the compose file.
- 07860a4: fix app custom port

## 6.0.35

### Patch Changes

- FIX: Fixed Homarr failing to start with `Invalid environment variables: SECRET_ENCRYPTION_KEY is required`. Homarr v1.x requires a 64-character hex encryption key that was not being generated or passed to the container. Added auto-generation via `openssl_rand_hex_32` in the manifest and mapped it to the `SECRET_ENCRYPTION_KEY` environment variable in the compose file.
- FIX: Fixed custom port selection crashing with `export: '=9000': not a valid identifier` when users changed the port from the suggested default during app installation. Root cause was a variable-shadowing bug where `f_check_port_available()`'s `while read` loop overwrote the caller's `var_name` variable. Also hardened all dynamic `export` statements to use correct quoting syntax.
- c12f533: Fix traefik exposure if dashboard not running/installed

## 6.0.35

### Patch Changes

- FIX: Fixed "Usage: grep" error in the Services Status menu by correctly escaping patterns that start with a hyphen and adding `--` to `grep` calls. Also enforced `sudo` across several `grep` utility calls acting on the main Docker Compose file to ensure reliable permission handling in all environments.
- FIX: Removed early return in `f_register_dashboard_from_manifest` that skipped Traefik rule creation and subdomain prompts when the Deployrr Dashboard was not running. Traefik-related infrastructure configuration is now decoupled from dashboard runtime status, allowing apps to be fully configured for reverse proxy regardless of the dashboard's state. Dashboard registration itself is now handled silently and gracefully if the service is down.

## 6.0.34

### Patch Changes

- d69ebf3: FIX: Fixed package availability detection failing on non-English locales (e.g., German, French). `apt-cache policy`, `dnf list`, and `pacman -Si` output localized field names that broke grep-based parsing. Added `LC_ALL=C` to force English output across all supported distros. Also added an early "already installed" check so packages pre-installed from non-repo sources (e.g., VM images) are correctly detected.

## 6.0.33

### Patch Changes

- ENHANCEMENT: System time synchronization verification (10s threshold) backport to prevent deployment faults for time-sensitive services like Let's Encrypt and Authelia.

## 6.0.32

### Patch Changes

- FIX: Forced login shells (e.g. `lxc exec -- su - user`) to explicitly source `~/.bashrc` by fetching and appending an automated `~/.bash_profile` inclusion block, fully restoring aliases for all access contexts.

## 6.0.31

### Patch Changes

- FIX: Fixed bash aliases disappearing for unprivileged users. Explicitly cached and restored POSIX ownership matching in `f_safe_sed` prior to `rm`/`mv` maneuvers to prevent dropping credentials across filesystems. Enforced `0644` creation readability for `udms_bash_aliases` payload.

## 6.0.28

### Patch Changes

- FIX: Fixed `f_safe_sed` aborting OAuth secret generation and failing to modify files in protected directories (e.g. `docker/secrets/`). Evaluates `sudo test -f` instead of local `[[ -f ]]` to correctly assert file existence on root-restricted LXC binds.
- FIX: Patched `_write_variable` and `f_set_constant` routines that were inadvertently creating empty environment definitions when root file existence tests failed for the unprivileged user.

## 6.0.27

### Patch Changes

- FIX: Fixed silent Traefik version pin failures on Alpine/BusyBox unprivileged LXCs by migrating all \`grep -oP\` (PCRE) statements to POSIX-compliant \`grep -E\` + \`awk\` extraction chains.
- FIX: Resolved silent \`.env\` appends blocking Deployrr variables inside unprivileged containers. Rewrote \`\_write_variable\` and \`f_set_constant\` to leverage the ZFS/LXC safe \`sudo cp\` staging strategy instead of \`sudo tee\`.

## 6.0.26

### Patch Changes

- ca4ee30: FIX: Fixed "Permission denied" errors from `tee` when adding apps to Dashboard on unprivileged LXC containers with bind mounts. Replaced `sudo tee` writeback with `sudo cp` and added tmpfs short-circuit in `f_safe_sed` to avoid double-indirection permission failures.
- b1e0606: FIX: Fixed `tee: /tmp/deployrr_dashboard...: Permission denied` errors when modifying dashboard configuration. The `fs.protected_regular` kernel protection correctly blocks root from using `tee` to write into a sticky `/tmp` directory over files owned by unprivileged users. The `f_safe_sed` wrapper skips its tmp mirror optimization if the target is already securely hosted inside `/tmp`, utilizing `sudo sed -i` directly.

## 6.0.25

### Patch Changes

- d734e21: FIX: Fixed "preserving permissions: Invalid argument" errors in LXC ZFS environments by completely avoiding direct file modifications with sed across the codebase, substituting a universal `f_safe_sed` fallback strategy.

## 6.0.24

### Patch Changes

- FIX: Resolved unprivileged LXC/ZFS compatibility issues with `sed: preserving permissions` by rewriting core application modification logic across multiple apps (N8N, Langfuse, PdfDing, 9Router, Supabase, Sabnzbd, Vaultwarden, qBittorrent, etc.), extending `f_safe_sed` to cleanly write through `tmpfs` during pre-install procedures.
- 9847c22: Removed Manual Dashify entiries will be LOST

## 6.0.23

### Patch Changes

- 0a2a8c6: fix(ci): rename .app to .bin for GitHub Release assets (GitHub rejects .app extension)
- bda5dcd: fix(ci): tolerate npm republish and unblock GitHub Release from npm failures
- 6b2b1f6: fix(ci): use MAJOR.MINOR version for source file lookup and R2 paths in release workflow
- 073259d: Added Preferred Editor chooser to Tools menu. Users can select nano, vim, or vi as their text editor for Deployrr operations (Secrets Editor, bash aliases). Preference is saved to .env and persists across sessions. Also added post-edit sanitization to strip trailing whitespace from secret files.
- 5407cc5: ### Fixed

  - Created GPU overlay include files (`gpu_dri.yml`, `gpu_nvidia_runtime.yml`, `gpu_nvidia_deploy.yml`, `gpu_amd_rocm.yml`) that were missing from the `includes/` directory, causing GPU device injection to fail during app installation with "Source file not found" error
  - Added `downloads_folder` prerequisite to Emby, Jellyfin, and Plex manifests — their compose files reference `$DOWNLOADSDIR` but the variable was never enforced, causing `invalid spec: :/data/downloads` on Docker Compose up
  - Added missing `OAUTH_VERSION_PIN_DEFAULT` to `apps/version_pins`
  - Added missing Paperless-NGX version pin defaults (`PAPERLESSNGX_VERSION_PIN_DEFAULT`, `GOTENBERG_VERSION_PIN_DEFAULT`, `TIKA_VERSION_PIN_DEFAULT`, `PAPERLESSNGXREDIS_VERSION_PIN_DEFAULT`, `PAPERLESSNGXPOSTGRESQL_VERSION_PIN_DEFAULT`) to `apps/version_pins`

  ### Added

  - Changeset-based versioning with Husky pre-commit hook (ported from v6.1)
  - CHANGELOG.md converted from HTML to Keep a Changelog markdown format

- e5a42ce: Fix n8n Bad Gateway caused by Docker secret file permissions

  n8n runs as non-root user `node` (UID 1000) and cannot read secret files
  created with `root:root 0600` permissions. Switches n8n from `_FILE`-based
  secrets to PLACEHOLDER+sed injection pattern (same as Langfuse).

  **Changes:**

  - `compose.yml`: `DB_POSTGRESDB_PASSWORD_FILE` → `DB_POSTGRESDB_PASSWORD=PLACEHOLDER`
  - `manifest.json`: Added `hooks.preInstall.script`
  - `files/pre-install.sh`: New hook reads secret with sudo, injects via sed
  - n8n-postgresql unchanged (postgres reads `_FILE` secrets as root)

  **Workflow:** Updated `/add-app` with Secret Strategy decision tree —
  when to use `_FILE` secrets vs PLACEHOLDER pattern based on container user.

- bfac65c: ENHANCEMENT: Removed OAuth version pinning so it correctly tracks 'latest' instead of injecting a pin into .env
- 70cda5f: Migrate n8n and NextCloud passwords from .env to Docker secrets

  Passwords are now stored in `$DOCKER_FOLDER/secrets/` and read by containers
  via `_FILE` environment variables instead of being exposed in `.env`.

  **Affected apps:** n8n, NextCloud
  **New installs only** — existing deployments are not affected.

- 621776f: Fix SERVER_LAN_IP not syncing from constants to .env during docker env setup

  The `f_setup_docker_env` function was not copying `SERVER_LAN_IP` from the
  constants file to `.env`, causing apps that reference `$SERVER_LAN_IP` in
  their compose files to get an empty value.

- e8b95a9: Fixed traefikify not properly adding to dashboard, fixed redash to include manaul traefikfy apps.
- 3955601: Fixed version pins not being set for Paperless-NGX and 20+ other apps. The `f_update_version_pins()` function had a hardcoded list of 21 pin names that was never updated when new apps were added. Replaced with dynamic extraction from the `version_pins` file — adding new apps no longer requires code changes.
- 263f393: rollback R2 and add apt update

## 6.0.22

### Patch Changes

- FIX: Resolved unprivileged LXC compatibility by securely downgrading CI/CD compiler to deployrr ubuntu-20.04 shc natively with absolute static links.

All notable changes to Deployrr will be documented in this file.

## [v6.0.21]

<h5>v5.11.2 - March 30, 2026</h5>
<ul>
  <li>NEW: Changed Deployrr v5 support file source to v5 branch.</li>
</ul>

<h5>v5.11.1 - November 14, 2025</h5>
<ul>
  <li>FIX: Suppressed benign 'preserving permissions' error outputs generated by <code>sed</code> inside unprivileged LXC environments during environment variable updates.</li>
</ul>

## [v6.0.20]

- FIX: Recover the NPM `latest` deployment tag after concurrent CI pipeline runs (triggered by blanket `git push --tags`) caused legacy version `v6.0.12` to inadvertently overwrite the pointer. Included the PIE ASLR compilation fix for `shc`.

## [v6.0.18] - April 1, 2026

Total Supported Apps: 150+

<ul>
  <li>FIX: Reverted the legacy Francisco Rosales `shc` v3.8.9b C compiler which caused `deployrr` to hang indefinitely on modern Linux kernels. Instead, we now compile the modern neurobin `shc` 4.0.3 directly from source in the CI/CD pipeline, physically patching out the `ptrace` system call at compile time using an inline C-macro replacement. This fully eliminates capability-stripping inside LXC without incurring the legacy optimization deadlocks.</li>
</ul>

## [v6.0.17] - April 1, 2026

Total Supported Apps: 150+

<ul>
  <li>FIX: Implemented definitive root solution for "Operation not permitted" on LXC containers. By reverting the CI/CD pipeline to compile shc from the original Francisco Rosales 3.8.9b source, we permanently eliminated the modern neurobin LD_PRELOAD and PTRACE_TRACEME injections that functionally stripped `CAP_NET_RAW` and broke setcap capabilities.</li>
  <li>FIX: Cleanly removed the temporary `sudo ping` LXC fallback.</li>
</ul>

## [v6.0.12] - April 1, 2026

Total Supported Apps: 150+

<ul>
  <li>FIX: Executable corruption by adding shc -r flag for cross-system binary portability and CFLAGS="-O2" to prevent RC4 string optimization bugs</li>
  <li>FIX: Corrected documentation and installer output that erroneously directed users to run `sudo deployrr`. The correct command is `deployrr`, as the app handles its own internal privilege escalation.</li>
</ul>

## [v6.0.8] - April 1, 2026

Total Supported Apps: 150+

- Deployrr v6 is NOT backward compatible with v5. A full reinstallation from scratch is required to migrate to v6. App data can be preserved but apps must be reinstalled.

### Added

- Complete rewrite of Deployrr with faster menus, improved reliability, and a modernized interface.
- Microservice architecture - every app now gets its own dedicated database and supporting services instead of sharing. This makes setup, management, and troubleshooting significantly easier.
- Added Nginx Proxy Manager as an alternative to Traefik reverse proxy. Users can now choose their preferred proxy type.
- Added Termix - web-based server management with SSH terminal, tunneling, and file editing.
- Added Dockhand - Docker container management tool with PostgreSQL support.
- Added Lazydocker - terminal-based Docker management UI.
- Added Autobrr - versatile download automation for torrents and Usenet.
- Added Boxarr - box office chart monitoring with Radarr integration.
- Added Dockpeek - lightweight Docker dashboard for quick container access.
- Completely redesigned Apps menu - browse, install, and manage apps all from one place, in addition to the existing Stack Manager.
- Remote Assist feature via Tmate for secure remote troubleshooting (Help menu).
- SMTP Mail Relay configuration with ssmtp - sends system emails (e.g. pin reminders) to your admin email (System menu).
- Dashify tool to manually add any app to the Deployrr Dashboard (Tools menu).
- ReDash tool to refresh and manage dashboard entries (Tools menu).
- Manifest-based app framework - apps are now defined by simple JSON manifest files, making the system more extensible and consistent.
- Laid the foundation to support community-contributed apps in future releases.
- Multi-OS support - Arch Linux (pacman), RHEL/CentOS/Rocky Linux (dnf/rpm), and Fedora now supported alongside Debian/Ubuntu.
- Intelligent GPU scanner detecting NVIDIA, AMD, and Intel GPUs with toolkit verification (NVIDIA Container Toolkit, AMD ROCm/DRI, Intel DRI).
- GPU Selection Framework - during app installation, users can choose between detected GPU vendors (NVIDIA, AMD, Intel) or CPU-only mode. Each app declares supported GPU patterns in its manifest, and the correct compose configuration is injected automatically. Supports 13 GPU-capable apps across desktop rendering, media transcoding, and AI compute categories.
- Smart stack updates with local-build detection - automatically performs git pull + docker build for locally-built apps instead of failing on docker pull.
- Added Ollama with GPU selection support - choose NVIDIA (CUDA), AMD (ROCm with automatic image swap), or CPU-only during installation.
- Portainer edition selection - choose between Community Edition (free) or Business Edition (licensed) during installation.
- OpenClaw Full Ollama heartbeat integration - optionally route heartbeats to a free local LLM (llama3.2:3b) via Ollama instead of paid API during installation.
- OpenClaw trusted-proxy authentication - seamless access behind Traefik with no token URLs or device pairing needed. Traefik's basicAuth handles identity automatically.
- Added Langfuse - open-source LLM observability and analytics platform with 6-container architecture (PostgreSQL, Redis, ClickHouse, MinIO, worker, web). Features headless initialization to auto-create admin account using existing Deployrr credentials.
- Added Supabase - open-source Firebase alternative with 13-container architecture (Studio, Kong, Auth, REST, Realtime, Storage, ImgProxy, Meta, Functions, Analytics, Database, Vector, Pooler). Features automated database scaffolding, JWT/secret generation, and optional OpenAI-powered AI assistance in Studio.
- Check Pins tool in Stack Manager — compare installed version pins against recommended defaults and update with one click.

### Changed

- Significantly faster app menus and navigation with intelligent caching.
- Improved Deployrr Dashboard reliability.
- Standardized UI output and logging throughout the application.
- More reliable Request PIN and Reset PIN functionality.
- Package installation now verifies availability in the repo before attempting install, avoiding failures.
- Traefik HTTP/3 (QUIC) support on ports 443/udp and 444/udp.
- Traefik secrets dialog consolidated with pre-filled values and password confirmation.
- CrowdSec Traefik Bouncer now supports plugin-based deployment method.
- Backup and Restore now support custom locations.
- Diagnostics and System Health now includes Remote Assist status.
- Version Pins moved to Settings menu for easier access.
- Improved Docker Disk Usage metrics display.
- SearXNG converted to multi-container setup with dedicated Valkey (Redis) instance.
- Renamed t3_proxy Docker network to traefik_proxy for clarity and consistency with socket_proxy naming.
- Improved Manage Auth menu with single app selection.
- Improved Manage Exposure menu.
- Updated version pins: TinyAuth v5, Authelia 4.39.15, Deployrr Dashboard 1.9.0, Authentik 2025.12.1.
- Upgraded TinyAuth from v4 to v5 — all env vars now use TINYAUTH*<SECTION>*<KEY> format. Existing users are auto-migrated seamlessly (data preserved).
- Security improvement - script now enforces non-root execution.
- v5 main menu now includes "Upgrade to v6" option that creates a handoff file for seamless v6 migration.
- DP_VERSION tracking in deployrr_constants — auto-stamps current version on every boot for future upgrade detection.
- Migration detection log shows which method triggered (DP_VERSION or handoff file).
- Domain checks now support UFW Port Address Translation (PAT) configurations with intelligent port detection.
- App manifests support runOnUpdate field for triggering pre-install hooks during app updates.
- OS-aware package lists in installation dialogs for Arch, Fedora/RHEL, and Debian/Ubuntu.

### Fixed

- FIX: Resolved x86_64 binary corruption (installer crashing with garbage text) caused by `shc` decryption failure under newer GCC optimizations. Downgraded Action runner from `ubuntu-latest` (24.04) to `ubuntu-22.04` to maintain compiler compatibility.
- FIX: Resolves issue where `npx @simplehomelab/deployrr` fails to find `apps/` directory by correctly resolving npm bin symlinks, and falling back gracefully on flattened `node_modules` structures where `npm` bypasses symlinks entirely.
- FIX: The `curl` installation script now gracefully falls back to a default version (`6.0`) if the `latest-version` endpoint fails (e.g. during pre-release cycles where `latest-version` is intentionally bypassed by CI/CD).
- ENHANCEMENT: Made the Deployrr binary globally accessible. Both `npx` and `curl` installers now automatically symlink the core app into `/usr/local/bin/deployrr` so you can just run `deployrr`.
- ENHANCEMENT: Clarified `README.md` to explicitly state `npx` is the preferred v6 installation method, provided the updated v6 `files.deployrr.app` `curl` endpoint, and explicitly marked the legacy `www.deployrr.app` endpoint as v5-only.
- Fixed Mosquitto container crash loop (SIGSEGV exit 139) caused by eclipse-mosquitto binary segfaulting when runtime GID doesn't exist in the container's /etc/group. Added `user:` directive with GID 0, fixed appdata UID from 1883 to 1000, and shipped empty passwd file to resolve chicken-and-egg initialization.
- Pre-install hooks (Tautulli, Cadvisor) now target the correct deployed compose file path ($DOCKER_FOLDER/compose/$HOSTNAME/{sname}.yml) instead of the source cache path, fixing installation failures.
- TinyAuth compose file no longer references invalid TINYAUTH_AUTH_SECRETFILE env var and docker secret, resolving v5 compatibility issues.
- Check Pins now updates .env directly instead of calling the bootstrap-only f_update_version_pins function.
- Traefik basicAuth middleware now forwards authenticated username via X-Forwarded-User header (headerField). Required for trusted-proxy auth mode in OpenClaw and other apps that rely on proxy-provided user identity.
- Fixed Prometheus and other app installation failures.
- Fixed Guacamole post-install issues.
- Fixed SSHwifty pre-install password file operations.
- Fixed The Lounge dashboard icon.
- Fixed SearXNG settings deployment.
- Fixed UFW firewall rules being corrupted during socket proxy setup.
- Fixed Rclone requirements checking.
- Fixed environment variables not being cleaned up after removal.
- Replaced Python TCP listeners in domain checks with netcat (nc), removing Python as an explicit required dependency.
- Fixed v5-to-v6 migration detection (previously checked for a file v5 never created).
- DP_VERSION auto-stamp blocked while DP_MODE=MIGRATION to prevent premature version stamping before wizard completes.
- Traefik exposure defaults now correctly set to Internal instead of Both for new app registrations.
- Traefik sed toggle scripts in Manage Exposure menus now work reliably.
- Secrets editor delete operation now functions correctly.
- Python package name corrected from python3 to python for Arch/RHEL compatibility.
- Firewalld rich rules word-splitting bug resolved for RHEL/CentOS systems.
- LICENSE_TYPE normalization to lowercase for consistent license checks across platforms.
- Fixed "grep: invalid option -- 'M'" error in Dashboard registration by hardening grep calls with -- separator to prevent patterns starting with a dash from being parsed as options.
- Fixed Traefikify subdomain logic to ensure user-entered subdomains are preserved for Dashboard registration, resolving issues where URLs would display as ".domainname.com" and Dashboard fields would be empty.
- NEW: Implemented Manual Dashboard Registry (`dashboard_manual_apps.json`) to persist Traefikify and Dashify entries across ReDash (Dashboard rebuild) operations.
- GPU scanner now provides intelligent feedback when hardware is detected but toolkits are missing (e.g. NVIDIA Container Toolkit not installed), with actionable install instructions instead of a generic failure message.

### Removed

- Huntarr - removed from supported apps.
- Separate Ollama (GPU) app entry - GPU support is now built into the main Ollama app via the GPU Selection Framework.
- Watchtower (deprecated).
- Home Assistant Core (recommend official installation method).
- UFW Docker integration.
- Manual MariaDB and PostgreSQL database creation tools (now handled automatically during app install).

### Other

- Numerous other improvements and bug fixes.

## [v5.11.1] - November 14, 2025

Total Supported Apps: 150

### Added

- Added ability to edit version pins directly from the Tools menu.

### Changed

- Bumped Traefik to v3.6 (fixes incompatibility with Docker v29).

## [v5.11] - November 13, 2025

Total Supported Apps: 145+

### Added

- Added ViniPlay, Lazydocker, Pulse, Dispatcharr, and ProjectSend apps.

### Changed

- Updated Traefik to v3.5 (latest).
- Updated Authelia from 4.39.4 to 4.39.14 (latest).
- Bumped Deployrr Dashboard from Homepage 1.3.2 to 1.7.0.
- Updated Authentik from v2025.06 to v2025.10 (latest). Removed Redis requirement.
- Updated PostgreSQL from 16-alpine to 18-alpine.
- Changed Gotenberg version from 8.4 to latest.
- Updated image source for Homarr.
- Implemented version pinning via .env file for easier updates.
- Added tool to change server IP and update Deployrr Dashboard and Traefik file providers accordingly.
- Added "monitoring" Docker profile for several apps.
- Added noperm options to SMB fstab entry.
- Removed unnecessary wait after managing auth for apps.
- Updated Deployrr Dashboard services template.
- Added Traefik error checking for Docker v29 conflict and containerd.
- Updated disclaimers and documentation links.
- Updated README and APPS.md.

### Fixed

- Fixed typo in Authelia menu item.
- Fixed wrong port number in compose for Mosquitto.
- Fixed Deployrr mode being empty during first start.
- Fixed OAuth menu yes/no options being swapped.
- Fixed exposure mode while setting up apps showing all options even when not applicable.
- Added quotes for Cleanuparr umask to prevent container startup issues.

### Other

- Numerous other logic and reliability improvements.

## [v5.10] - July 29, 2025

### Added

- Added Watchtower for automatic container updates.
- Added Cleanuparr utility.
- Added CrowdSec Traefik Bouncer.

### Changed

- Major speed improvements for Stack Manager and Apps menu by optimizing app status checks and dialog box sizing.
- Moved Docker aliases to UDMS bash aliases, included migration script, and improved alias deployment.
- Docker Compose pull alias (dcpull) now pulls one container at a time to not overload the CPU.
- Improved dashboard descriptions for Authelia, Authentik, and Google OAuth.
- Added additional ways to check internet connectivity. This was failing for some folks.
- Added default network to CrowdSec compose.
- Added missing Docker labels placeholder in templates.
- Fixed YAML syntax errors that prevented apps from being added to the dashboard.
- Removed Readarr (unmaintained).
- Updated README and APPS.md.

### Other

- Numerous other logic and reliability improvements.

## [v5.9] - June 14, 2025

### Added

- Added Homer - A simple static homepage for your server.
- Added Change Hostname tool under Tools menu - useful when migrating to a different host.

### Changed

- Improved SMB mount security with credentials files.
- Added hostname mismatch detection to health checks.
- Updated GPTWOL to use database instead of computers.txt.
- Made Traefik dashboard port configurable via TRAEFIK_PORT variable.
- Updated Redis configuration and compose.
- Version updates (Authentik 2025.2 -> 2025.6.1, Authelia 4.38.19 -> 4.39.4, Traefik 3.3 -> 3.4, Deployrr Dashboard 1.2 -> 1.3.2)

### Fixed

- App descriptions were not being added to Deployrr Dashboard in some cases.
- Existing Traefik SSL certs were not being respected - Deployrr was proceeding with Traefik logs monitoring when not needed.
- Fixed Deployrr Dashboard URL not being added after Traefik setup (e.g. https://deployrr.example.com).
- Updated Deployrr Dashboard bookmarks.yaml.
- Authentik media folder permissions issue.

## [v5.8] - May 12, 2025

Total Supported Apps: 140+

### Added

- Added TinyAuth - Lightweight self-hosted Single Sign-On and OAuth solution.
- Added YAML Yoda - YAML validation tool integrated into health checks. Helps identify YAML issues in compose files.
- Added SMB and NFS mount options under new Mounts menu.
- Added Docker Login under Docker menu.
- Redesigned Manage Auth interface for better auth provider selection.

### Changed

- Added HTTP/3 support to Traefik (not fully tested).
- Added allowed hosts to Homepage and Deployrr Dashboard.
- Auto-add file provider for Deployrr Dashboard after Traefik setup.
- Updated transmission download path to match Arr apps.
- Improved UX. Menus won't rewrite/clear terminal message history.
- Updated Deployrr icon in dashboard.

### Fixed

- Various Docker aliases and .bashrc integration fixes.
- Improved auth provider validation in Manage Auth.
- Removed obsolete Deployarr Dashboard includes.
- Pin reset/reminder email was not being sent.

### Other

- A few other minor improvements and bug fixes.

## [v5.7.1] - April 15, 2025

### Added

- Deployarr is now Deployrr (finally got the spelling right!). Many changes to reflect this. Minor release to ensure nothing breaks but major functionality remains the same.
- Updated LICENSE to clarify what is open source what is proprietary.
- One-line Deplorr install/setup method. No more 3-step process to get started or manually picking the architecture.

### Fixed

- Minor fix for qBittorrent VPN appdata path in compose file.

## [v5.7] - March 5, 2025

Total Supported Apps: 140+

### Added

- Added Audiobookshelf, Cloudflare Tunnel, FileZilla, Immich (Phew!), Pi-Hole (v6), Trilium Next, Vikunja, and WikiDocs.
- Huge focus on self-hosted AI with Flowise, n8n, Ollama, Open-WebUI, OpenHands, Qdrant, and Weaviate.
- Added Audiobooks and Podcasts folders to support new media apps.
- Added system health diagnostics and monitoring (Beta).
- Auto systemd-resolved configuration for Debian systems.
- Official documentation now available at https://docs.deployarr.app.

### Changed

- Enabled hardware acceleration for KASM apps (Kasm, Chromium, DigiKam, Lollypop).
- Updated Traefik to v3.3, Authentik to 2025.2, Authelia to 4.38.19
- Added Uptime Kuma to socket_proxy network.
- Reduced rclone --dir-cache-time from 24h to 1h for more frequent media scans Plex/Jellyfin.
- Changed file provider IP from SERVER_LAN_IP to DOCKER0_IP.
- Modified main menu UI, moved verify to prerequisites menu.
- Added comment on memory overcommit warning to Redis compose.
- Moved Smokeping to selfh.st icon.
- Added Immich Folder setup for uploads (System->Folders).

### Fixed

- Potential fix for malformed compose file.
- Debian DNS configuration issues.
- Plex subdomain placeholder issues.
- Changed app reachable check to IP 127.0.0.1.
- Simplified resolved.conf template.

### Other

- A few other minor improvements that no one cares about.

## [v5.6] - January 28, 2025

Total Supported Apps: 125

### Added

- Added Wallos and n8n.
- .env Editor in Tools menu to edit environment variables.
- Secrets Editor in Tools menu to edit secrets using nano editor.
- Un-Traefikify to remove Traefik file providers.

### Changed

- Updated Traefik to v3.3.
- Changed traefik certs dumper image to: ghcr.io/kereis/traefik-certs-dumper:latest.
- Rebranded SmartHomeBeginner to SimpleHomelab.
- Moved Deployarr resources and dependencies to www.deployarr.app. Hopefully it does not cause any issues.

### Fixed

- CrowdSec installation issues due to journalctl. Replaced journalctl with rsyslog.
- Some deployarr dashboard links were obsolete.

### Other

- A few other minor improvements.

## [v5.5] - January 12, 2025

Total Supported Apps: 123

### Added

- Added Paperless-NGX (+ support services Paperless-AI, Gotenberg, and Tika), Bookstack, PdfDing, Privatebin, and SSHwifty.
- Tool to create PostgreSQL database from within Deployarr.

### Changed

- Switched Deployarr Dashboard to use selfh.st icons.
- Socket proxy install will now to check for malformed docker compose and error out.
- Improved handling of rclone config folder missing in some distros.
- Log messages improved to share details on databases being created.
- Added a note on MagicDNS and added accept-dns false option by default.
- Under the hood, significant improvements to database management.

### Fixed

- Xpipe-Webtop port environment variable name was wrongly specified as WEBTOP_PORT in the compose file.
- CrowdSec repo error fix.

### Removed

- Photoshow (domain compromised) and not maintained.

### Other

- A few other minor improvements.

## [v5.4.2] - December 30, 2024

### Changed

- Modified internet connectivity check. Expert mode will allow overriding this step.
- Remove yq requirement. Implemented an alternate method to manage secrets in master docker compose file.
- More descriptive messages when requirements for a step are not met.

### Fixed

- Icons of some apps were not being set on Deployarr Dashboard.
- qBittorrent VPN required manually adding stuff to configuration to allow initial login with admin/adminadmin.

### Other

- A few other minor improvements.

## [v5.4.1] - December 24, 2024

### Changed

- Disabled ports in Authentik docker compose. Not needed. Was causing conflict with Portainer.

### Other

- Changed postgres_default_passwd to postgres_default_password. Manual change PostgreSQL docker compose required.

## [v5.4] - December 23, 2024

Total Supported Apps: 115

### Added

- Authentik, SearXNG, Beets, and DokuWiki.

### Changed

- Redis added by default to Authelia, SearXNG, Nextcloud. Redis switched to alpine image and removed password.
- Improved menu to pick available authentication methods. Simplified background logic.
- DOCKER_HOST variable is now automatically set after installing socket proxy and used by several containers that depend on it.
- Added PostgreSQL health check.
- Authelia, Guacamole, Nextcloud, Redis-commander, and SearXNG now have depends_on key to enhance reliability.
- Service recreation stepsnow does not suppress messages so error messages are visible.
- Updated disclaimer to clarify data collection.
- Option to reset "already setup/running" error and force install an app.
- Signficant standardization and simplification underneath to app installation workflow.

### Fixed

- Socket proxy was running/requirement check was failing.
- Internet connectivity check improved and now with an option to override.
- Permissions fixed for Komga.
- DDNS-Updater container always unhealthy for proxied domains.
- Recreate option was not working in Stack Manager.

### Other

- Several other minor UI/UX improvements.

## [v5.3.1] - December 18, 2024

### Fixed

- syntax error: operand expected (error token is "+").

## [v5.3] - December 6, 2024

Total Supported Apps: 111

### Added

- Added Dozzle Agent, Kasm, Komga, Calibre, Calibre-Web, Organizr, Home Assistant Core, Mylar3, Remmina, and Stirling PDF.
- Comics folder to suppor the new Komga, Calibre and Calibre-Web apps.
- Traefik dashboard is now exposed on port 8080 by default.

### Changed

- Made the wait time for Traefik SSL certs a bit interesting (rerun Traefik setup to find out).
- Traefik wait time now includes DNS propagation check messages.
- Improved Traefik support for existing SSL certificates and get user to confirm if they want to use them.
- License status is now intelligently extended, without having to reverify every few days.
- Stack Manager is now included in Basic and Plus license (previously only Pro).
- Some path changes to be consistent. e.g Books folder is now /data/books in Kavita. Changed VSCode mount point inside the container.
- When required now "[POST-INSTALL NOTES]" are now displayed after an app is installed. Be sure to read them.
- Numerous AI-suggested syntax and logic improvements.
- Reliability of apps dependent on MariaDB (e.g. Nextcloud, Guacamole, Speedtest-Tracker) improved.
- Deployarr development is now done via private Git repository due to addition of couple of other contributors.

### Fixed

- Inconsistencies with MariaDB root password, causing issues. Renamed mysql_root_password to mariadb_root_password. May require manual updates to some app compose files.
- Some Docker bash aliases were not working when using custom Docker folder.
- secrets defintion in main docker compose was not working as expected, causing yaml syntax errors. Few other minor reliability improvements with secrets.
- OAuth container had TLS specification conflicting with Traefik's universal TLS options with tls-opts.yml file.
- Typos and other minor improvements.

## [v5.2] - November 7, 2024

Total Supported Apps: 101

### Added

- Added DigiKam, Redis Commander, PHotoshow, Node Exporter, Funkwhale, Gonic, GPTWOL, CrowdSec, and CrowdSec Firewall Bouncer.

### Changed

- Deployarr PIN now saved locally and shown in About menu, in case you forget. To change it, just reset it.

### Fixed

- DWEEBUI_SECRET not found error.

### Other

- Other minor improvements and fixes.
- Next few releases will focus on stability (e.g. on Debian 12) and improvements (e.g. Guacamole).

## [v5.1] - October 30, 2024

Total Supported Apps: 91

### Added

- Added DweebUI, Cloud Commander, Double Commander, Theme Park, Notifiarr, Flaresolverr, ESPHome, Emby, Dockwatch, Lollypop, qBittorrent without VPN, Transmission without VPN, Tailscale, What's Up Docker (WUD), and ZeroTier.
- Changed Plex transcode folder path to match Jellyfin/Emby.
- qBittorrent is now without VPN by default. There is a separate menu item to install it with VPN.

### Changed

- Improved port availability check. On top of occupied ports on the system, .env will now be checked for ports already defined for other apps.

### Fixed

- Bash Aliases was not working with custom Docker Folder.
- Messages after app installation was showing wrong port number in certain situations.

## [v5.0.1] - September 30, 2024

### Fixed

- System checks was not being marked as done after completion. Required exiting and relaunching Deployarr.
- Better Rclone remotes detection.
- Rclone installation was failing due to unzip requirement.
- Running the script with sudo failed on Debian due to lack of sudo package by default.
- All apps that required MariaDB databases (Speedtest Tracker, NextCloud, and Gaucamole) failed on migration. Existing databases will now be recognized instead of force creating new ones.
- Traefik will respect existing acme.json file upon migration/reinstallation.
- SSL certificates (acme.json) were being emptied unnecessarily.

## [v5.0] - September 29, 2024

Total Supported Apps: 76

### Added

- Deployarr logo and icon.
- Local mode for installing apps for local access only (no reverse proxy). This should now remove the Traefik requirement and allow multi-server setups.
- Traefik Exposure Modes. Simple - all apps behind Traefik accessible internally and externally. Advanced - control over exposing apps internally, externally, or both.
- By default Traefik will use file providers to expose apps via reverse proxy. Previously this was done using Docker labels. Some apps (e.g. Traefik, OAuth, and Authelia), will continue to use labels.
- Deployarr Dashboard - New Homepage based dashboard that auto-populates as you install new apps. It works but will evolve over time.
- Recommended order of steps for various setups.
- License changes. There are now 3 license types: Basic, Plus, and Pro. Basic allows local-only installs. See License Types description in About menu.
- Deployarr pin reset feature.
- All apps are now exposed to Docker host using ports. Deployarr will suggest ports during installation.
- Deployarr will now call Cloudflare API to check the validity of the DNS API token for Traefik.
- Included v4 to v5 migration instructions.

### Changed

- Description error messages when requirements are not met for a specific step.
- Signficant improvement in speed/responsiveness.
- Menu reorganized based on past feedback.
- Eleventy-million minor changes (over 9000 lines of code rewritten).

### Removed

- Traefik v2 to v3 migration.
- Auto-Traefik to Deployarr migration.
- Account registration directly from the script. Not needed anymore, as all previous "Basic" features are now free for anyone.

## [v4.6.1] - August 7, 2024

### Fixed

- Pin creation was broken.

## [v4.6] - August 6, 2024

Total Supported Apps: 75

### Added

- Added Baikal, Piwigo, Resilio Sync, Node-RED, Homebridge, Mosquitto, Jackett, MQTTX Web, Scrutiny, and Chromium.

### Changed

- Auto-Traefik to Deployarr migration and Traefik v2 to v3 migration support will be removed in the next release.

### Fixed

- Smokeping and FreshRSS appdata folder was wrongly mapped.
- Plex was calling SERVER_IP instead of SERVER_LAN_IP env.

### Known Issues

- If the hostname changes Deployarr can break until the new hostname are manually changed in various location. This isssue is not specific to just v4.6 and applies to previous versions as well.

## [v4.5.4] - July 15, 2024

### Fixed

- User creation was not working. Final fix (hopefully).

## [v4.5.3] - July 15, 2024

### Fixed

- User creation was not working.

## [v4.5.2] - July 15, 2024

### Added

- Optin to Share Usage Stats.
- 6-digit numerical pin to protect from unauthorized use of email.
- Stack Manager: Option to pull image updates and upgrade containers.

### Fixed

- 4.5.1 was complaining about upgrading to 4.5.1 when it was already the latest.

### Other

- Other minor improvements

## [v4.5.1] - July 14, 2024

### Other

- Minor bug fixes.

## [v4.5] - July 13, 2024

Total Supported Apps: 65

### Added

- Added Kometa.
- Rclone Remote SMB mount, Automount, Delay Media Apps, and Refresh Cache.
- Reorganized menu. All prerequisite steps are now in one place.

### Changed

- Expanded bash aliases.

### Fixed

- Removed Plex requirement for Tautulli - would not work if Plex is in a different server.

### Other

- Other minor improvements and fixes.

## [v4.4.1] - July 5, 2024

### Changed

- Improved handling of passwords/strings with special characters.

### Fixed

- Bug fixes.

### Other

- ~~KNOWN ISSUE: Authelia not working as expected. Password does not work~~.

## [v4.4] - July 4, 2024

Total Supported Apps: 64

### Added

- Added Flame, Kavita, Netdata, and pgAdmin.
- Installing required packages is now a separate step in System Prep menu.

### Changed

- Improved compatibility with Debian.
- Improved compatibility with older Ubuntu (>=20.04) / Debian (>=11).

### Fixed

- Some users downgraded from Pro to Basic.
- Bash aliases was not installing properly.
- Some premature/harmless error messages.

## [v4.3] - June 27, 2024

Total Supported Apps: 60

### Added

- Added Maintainerr, CyberChef, The Lounge.

### Fixed

- Feedback/Review was not working.
- Some premature error messages.

## [v4.2.1] - June 27, 2024

### Added

- Ability to clear Deployarr cache.

### Fixed

- License check was not working.

## [v4.2] - June 26, 2024

Total Supported Apps: 57

### Added

- Added Wireguard + WebUI with WG-Easy, cAdvisor, Dashy, Docker Garbage Colleciton, and Traefik Certs Dumper.

### Changed

- Revamped license checks and new user creation.
- If MariaDB is running Speedtest-Tracker will now offer to use MariaDB instead of SQLite.
- If Plex is installed and Logs are found, they will be passed automatically to Tautulli.
- Traefik v2 remnants will be removed in next version (automatic migration won't be possible).

### Fixed

- Feedbacks were not being registered. Please submit or re-submit feedback (especially if you did since v4.0).
- Minor bug fixes.

## [v4.1] - June 23, 2024

### Added

- Added Airsonic-Advanced, Change-Detection, FreshRSS, Grocy, Heimdall, Jellyseerr, NZBGet, Ombi, Overseerr, Smokeping, and Tautulli.

### Changed

- Changed qBittorrent from Docker Labels to File Provider for Traefik.

### Fixed

- Speedtest-Tracker latest version was not working without an API Key. Added API Key feature.
- Minor bug fixes.

## [v4.0.1] - June 17, 2024

### Fixed

- Switching Authentication method was working.
- Re-registering an existing account caused account downgrade to Deployarr Basic.
- Installing MariaDB/PostgreSQL before Traefik caused errors due to improper secrets addition.
- Non-critical error messages were displayed if docker folder was not set.
- Update process was failing due to incorrect extension.

## [v4.0] - June 16, 2024

### Added

- Licence naming: Free (previously Unregistered), Basic (previously Starter Free), Plus (previously Auto-Traefik), and Pro (previously Auto-Traefik+).
- Auto-Traefik to Deployarr auto migration.
- Ability register a free account from within Deployarr to gain free Basic license.
- Added Bazarr, DeUnhealth, Gluetun VPN, Lidarr, Plex, Prowlarr, Jellyfin, qBittorrent, Radarr, Readarr, and Sonarr.
- Starter config for qBittorrent with pre-configured folders to eliminate permissions issues. Also includes a fix for not being able to login using the default username and password. qBittorrent used Gluetun VPN Kill switch by default.
- Gluetun VPN supports both Wireguard and OpenVPN.
- Ability to get customized discount codes right from the About menu.
- Ability to toggle Intro Messages on/off on the menus.
- Key announcements right on the menu without needing update the script.

### Changed

- Ability to set custom data folder for Nextcloud.
- customRequestHeaders and forceSTSHeader enabled by default (needed for Nextcloud).
- SABnzbd now exposed to host machine via port 8090. qBittorrent via 8091.
- Out of the 3 media folders, only one needs to be set (anyone). Previously, Media Folder 1 was required.
- All menus updated with descriptive options.
- System prep menu now display all configuration info for quick verification.

### Fixed

- Minor fix in IT-Tools docker labels.

### Other

- Deployarr now supports 40 Apps!!!
- Updated README.md
- Too many other minor changes to list

## [Unreleased] - June 14, 2024

### Added

- Goodbye Auto-Traefik. Hello Deployarr - https://github.com/anandslab/deployarr

### Other

- v3.3.3 will be the last version of Auto-Traefik.

## [v3.3.3] - June 6, 2024

### Added

- Graphics card detection (EXPERIMENTAL).

### Fixed

- Traefik staging was failing while checking for staging certificates.

### Other

- NEW APPS: Nextcloud (not AIO version; uses existing Redis and MariaDB services), SABnzbd.
- Other minor bug fixes.

## [v3.3.2.1] - May 27, 2024

### Fixed

- Adding external app behind Traefik was broken.

## [v3.3.2] - May 25, 2024

### Added

- ShellInaBox added (web-based terminal).
- Authelia upgraded to v4.38.8.
- Ability to set custom Docker folder and Backup folder.

### Changed

- UI/UX improvements throughout, including a new Apps menu.
- More clarity on which steps are required and which ones are not.

## [v3.3.1] - May 23, 2024

### Added

- Adminer, PostgreSQL, and Redis
- Ability to create MariaDB database using the script (from Tools menu).
- System Prep menu expanded with additional settings in preparation for future apps. Many of these are optional for now: SMTP Details, Downloads Folder, Media Folders, Server LAN IP, etc.
- Ability to set a Traefik Auth Bypass Key - in preparation for future apps.

### Changed

- Reverse Proxy menu improved with more context based information (e.g. Number of external apps behind Traefik).
- All sensitive info use by the script are now more securely stored as docker secrets.
- Apps menu now shows status (Running), image version if available, and authentication mode beside their name.
- Backups menu now shows the Backup Folder, Number of Backups, and Size of Backups Folder.

### Fixed

- Ability to set authentication mode while added external apps behind Traefik was broken.

### Other

- Several other minor fixes and improvements.

## [v3.3] - May 18, 2024

### Added

- Traefik v3 now default.
- Traefik v2 to v3 migration assistant (EXPERIMENTAL).
- Traefik Access and Errors now available via Dozzle.

### Changed

- Colors galore! Color coding of menu and status texts for better UX.

### Fixed

- With no Authelia and with OAuth, setting authentication system during app install wasn't working properly.
- Rules syntax changes for Traefik v3 compliance.
- Bash Aliases Fix - was erroring out previously.

### Other

- Several other minor fixes and improvements.

## [v3.2.2] - April 26, 2024

### Added

- New Name for Auto-Traefik: Deployarr (coming soon).

## [v3.2.1] - April 26, 2024

### Added

- Speedtest-Tracker added.

### Changed

- Additional minor bug fixes.

### Fixed

- Enabling authentication during app install was not working as expected.

## [v3.2] - April 25, 2024

### Added

- Reverted a change introduced in 3.1. Sudoing should not be used when calling the script initially. Elevation to root will still be required after the script starts running.
- Added Google OAuth (Traefik Forward Authentication).
- Added Visual Studio Code Server (VS Code), DDNS Updater, and IT Tools.
- Tools menu with Stack Manager, Backups, and Permissions Checks.

### Changed

- Auto-Traefik will be renamed shortly: "Traefik" is a trademarked word and Auto-Traefik does more than just Traefik.
- Membership plugin that supports license verification will need an upgrade in the coming days. Please expect some down times that might hinder license checks.
- Improved service delete option to remove secrets as well.
- Improved Auto-Traefik reset option.
- Arranged all apps in alphabetical order in Apps menu.
- Improved required info section with option to create new Linux users and warnings for certain situations (running as root, user not present, etc.).
- Over 2000 lines of code changed/improved.

### Fixed

- Improve Docker Folder permissions.

## [v3.1.1] - April 16, 2024

### Added

- Grafana added.

### Changed

- Automated Vaultwarden Admin Token setup.

### Fixed

- Prometheus permissions error.

## [v3.1] - April 14, 2024

### Added

- Sudo will now be required to invoke the script.
- Stack Manager - Stop/Stop containers, Containers Status, Disable/Enable/Delete Services, and more.
- Migrate and Restore Auto-Traefik and Docker Environment to a new system.
- 'About' menu with relevant info on Auto-Traefik.
- Added Glances.
- Added Homarr.
- Added InfluxDB.
- Added Prometheus.
- Added Vaultwarden.
- Second domain passthrough to another Traefik instance on a different host, as explained in https://www.smarthomebeginner.com/multiple-traefik-instances/.

### Changed

- Improved compatibility with GLIBC. The script should now work on older version of Ubuntu/Debian/OMV.
- Code improvements.
- 'Authentication' Menu is now 'Security'.

## [v3.0.4] - March 29, 2024

### Added

- Added changelog view: Settings->View Changelog.

### Changed

- Improved reliability of status/completion checks for various steps.
- Reorganized menu to allow for future additions.

## [v3.0.3] - March 28, 2024

### Changed

- Improved reliability of Docker Root Folder backups.
- Added UDM/OPNsense specific troubleshooting tips.

### Fixed

- Removed compres middleware. Probably not important for homelab/low-traffic environment. Plus, this was causing "mine: no media type" error in Traefik logs.

## [v3.0.2] - March 21, 2024

### Added

- Automatic script updates - bye bye manual downloads!.
- Ability to submit your rating/feedback.

### Fixed

- Guacamole secrets error.

## [v3.0.1] - March 18, 2024

### Fixed

- Traefik dashboard 404.

## [v3.0] - March 15, 2024

### Added

- Added Guacamole for Remote Admin
- Backups (create, view, restore, and delete)
- Additional ability (Docker Environment Setup, Socket Proxy Setup, etc.) for registered free-membership tier.

### Changed

- Added ability to set subdomain name during app setup
- Added ability to set authentication type during app setup
- Added feedback message when requirements are not met for a specific step
- Authelia middlewares and configuration change to align with developer's recommendation
- UI Improvements
- Added password suggestions wherever password needs to be set
- Added expert override for certain DNS issues

### Fixed

- Bug fix for Docker Aliases

### Other

- Over 1000 lines of code changed.

## [v2.4.2] - February 27, 2024

### Other

- Improved Traefik port 80 and 443 check for Traefik.
- Implemented [UFW-Docker](https://github.com/chaifeng/ufw-docker). All though this appears to work, at this point it is an Experimental feature.
- Implemented Docker secrets. At this point, this only applies to Traefik, Authelia, and MariaDB. This will be the default moving forward.
- Improved the reliability of creating Docker secrets.
- Added the ability to change authentication method for external/non-docker apps.
- UI improvements for changing authentication methods for apps.
- Changed Authelia users_database.yml to users.yml to align with Docs and [Authelia guide](https://www.smarthomebeginner.com/authelia-docker-compose-guide-2024/) on SmartHomeBeginner.com

## [v2.4.1] - February 4, 2024

### Other

- Bug fixes.

## [v2.4] - February 4, 2024

### Other

- Unfortunately, many breaking changes, which make it incompatible with setup done with previous versions of the script.
- Replace Cloudflare Email + Global API Key with Scoped API Token (CF_DNS_API_TOKEN)
- Added Secrets for Basic HTTP Auth and CF_DNS_API_TOKEN
- Additional Traefik checks - dangling TXT records, DNS error.
- Improved port checks and added override option.
- Changed DOMAINNAME variable to DOMAINNAME_1.
- Docker Compose File now has the server's hostname as suffix.
- Changed Traefik entrypoint names form http and https to web and websecure as in some online documentation.
- Broke up middlewares to individual file providers instead of one middlewares.yml and middlewares-chain.yml
- Added ability to put external apps behind Traefik.
- Added MariaDB and phpMyAdmin.

## [v2.3.1] - January 5, 2024

### Other

- Added override for port checks.

## [v2.3] - December 28, 2023

### Other

- Simplified data entry forms.
- Broke down and reassigned "Required Information" collection to their relevant section/steps instead of collecting all info at the beginning.
- Added UI, instead of commandline for certain steps (e.g. Must Read Info, Authelia, etc.)
- Added Docker data size on disk and option to prune unused data/volumes/images.
- Added option to uninstall/remove Auto-Traefik.
- Added "Expert Mode" - will allow overriding certain steps (e.g. IP checks). Mode can be changed from Auto-Traefik Options.
- Added Docker and Docker Compose version info to Docker menu.

## [v2.2.1] - December 6, 2023

### Other

- Fix for the script not creating docker folders when they do not already exist.
- Added comment on how to find Authelia verification email.

## [v2.2] - December 2, 2023

### Other

- Potential fix for "Could not read certificate" error. Replaced openssl certificate check with acme.json file checks.
- Removed unnecessary stoppage and restart of containers - only services being worked on will restart instead of the whole stack.
- Improved the UI/UX for collecting required information and license check.

## [v2.1] - November 28, 2023

### Other

- Several improvements and bug fixes. Potential fix for "Could not read certificate" error.
- Added Dozzle, Homepage, and Uptime Kuma.

## [v2.0] - November 15, 2023

### Other

- Free options for everyone - The system, docker, and port checks are available for anyone to use. No purchase necessary. This is great for anyone that wants to troubleshoot or to ensure that you system passes all checks to setup a Docker/Traefik stack.
- Auto-Traefik now has 3 levels of licensing: Free/Unregistered, Auto-Traefik, and Auto-Traefik+ to fit the needs of most people.
- Most of the navigation is now through a commandline GUI. This will continue to evolve.
- Added ability to complete the whole process in steps, instead of one-go as in v1.
- Expanded Auto-Traefik Options - reset, view key information, license checks, and build a sanitized troubleshooting log without any sensitive information.
- Modified main docker compose file to now be more modular. All the individual services are available as individual yml files in a separate folder.
- Added Authelia for multifactor authentication, with ability to change authentication mechanisms for apps from the UI.
- Added Portainer. This is just the start. Many more apps will be added.
- More to come.

## [v1.1.4] - October 31, 2023

### Other

- Increased service start check timeout to avoid false positives

## [v1.1.3] - October 30, 2023

### Other

- Minor changes to logging - added a few more logging spots
- Updated Traefik version to 2.10
- Fixed a bug where subdomain resolution check would not exit on error

## [v1.1.2] - October 16, 2023

### Other

- Added auto-traefik output logging to /tmp/auto-traefik/auto-traefik.log to help troubleshoot
- Added failsafe - in case container with same name already exists, script will fail

## [v1.1.1] - October 14, 2023

### Other

- Added a backup method to check WAN IP. Some IP check sites present Cloudflare challenge, interfering with the process.

## [v1.1] - October 9, 2023

### Other

- Added version check. Now the users will see a warning of there is a new version available for download.
- Clean up repository and organized files.
- Reduced unnecessary sleeps/waits in the script.
- Improved check for certificates, instead of sleeping for a certain time, which can fail sometimes.
- Added check for Let's Encrypt rate limiting.
- Added backup for acme.json if successful. Can be handy if rate limit is hit.

## [v1.0] - September 23, 2023

### Other

- Initial Release
