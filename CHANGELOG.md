<h3>Releases</h3>
Total Supported Apps: 145+
<h5>v5.10 - July 29, 2025</h5>
<ul>
<li>NEW: Added Watchtower for automatic container updates.</li>
<li>NEW: Added Cleanuparr and Huntarr utilities.</li>
<li>NEW: Added CrowdSec Traefik Bouncer.</li>
<li>ENHANCEMENT: Major speed improvements for Stack Manager and Apps menu by optimizing app status checks and dialog box sizing.</li>
<li>ENHANCEMENT: Moved Docker aliases to UDMS bash aliases, included migration script, and improved alias deployment.</li>
<li>ENHANCEMENT: Docker Compose pull alias (dcpull) now pulls one container at a time to not overload the CPU.</li>
<li>ENHANCEMENT: Improved dashboard descriptions for Authelia, Authentik, and Google OAuth.</li>
<li>ENHANCEMENT: Added additional ways to check internet connectivity. This was failing for some folks.</li>
<li>ENHANCEMENT: Added default network to CrowdSec compose.</li>
<li>ENHANCEMENT: Added missing Docker labels placeholder in templates.</li>
<li>ENHANCEMENT: Fixed YAML syntax errors that prevented apps from being added to the dashboard.</li>
<li>ENHANCEMENT: Removed Readarr (unmaintained).</li>
<li>DOCS: Updated README and APPS.md.</li>
<li>Numerous other logic and reliability improvements.</li>
</ul>

<h5>v5.9 - June 14, 2025</h5>
<ul>
<li>NEW: Added Homer - A simple static homepage for your server.</li>
<li>NEW: Added Change Hostname tool under Tools menu - useful when migrating to a different host.</li>
<li>ENHANCEMENT: Improved SMB mount security with credentials files.</li>
<li>ENHANCEMENT: Added hostname mismatch detection to health checks.</li>
<li>ENHANCEMENT: Updated GPTWOL to use database instead of computers.txt.</li>
<li>ENHANCEMENT: Made Traefik dashboard port configurable via TRAEFIK_PORT variable.</li>
<li>ENHANCEMENT: Updated Redis configuration and compose.</li>
<li>ENHANCEMENT: Version updates (Authentik 2025.2 -> 2025.6.1, Authelia 4.38.19 -> 4.39.4, Traefik 3.3 -> 3.4, Deployrr Dashboard 1.2 -> 1.3.2)
<li>FIX: App descriptions were not being added to Deployrr Dashboard in some cases.</li>
<li>FIX: Existing Traefik SSL certs were not being respected - Deployrr was proceeding with Traefik logs monitoring when not needed.</li>
<li>FIX: Fixed Deployrr Dashboard URL not being added after Traefik setup (e.g. https://deployrr.example.com).</li>
<li>FIX: Updated Deployrr Dashboard bookmarks.yaml.</li>
<li>FIX: Authentik media folder permissions issue.</li>
</ul>

<h5>v5.8 - May 12, 2025</h5>
Total Supported Apps: 140+
<ul>
<li>NEW: Added TinyAuth - Lightweight self-hosted Single Sign-On and OAuth solution.</li>
<li>NEW: Added YAML Yoda - YAML validation tool integrated into health checks. Helps identify YAML issues in compose files.</li>
<li>NEW: Added SMB and NFS mount options under new Mounts menu.</li>
<li>NEW: Added Docker Login under Docker menu.</li>
<li>NEW: Redesigned Manage Auth interface for better auth provider selection.</li>
<li>ENHANCEMENT: Added HTTP/3 support to Traefik (not fully tested).</li>
<li>ENHANCEMENT: Added allowed hosts to Homepage and Deployrr Dashboard.</li>
<li>ENHANCEMENT: Auto-add file provider for Deployrr Dashboard after Traefik setup.</li>
<li>ENHANCEMENT: Updated transmission download path to match Arr apps.</li>
<li>ENHANCEMENT: Improved UX. Menus won't rewrite/clear terminal message history.</li>
<li>FIX: Various Docker aliases and .bashrc integration fixes.</li>
<li>FIX: Improved auth provider validation in Manage Auth.</li>
<li>FIX: Removed obsolete Deployarr Dashboard includes.</li>
<li>FIX: Pin reset/reminder email was not being sent.</li>
<li>VISUAL: Updated Deployrr icon in dashboard.</li>
<li>A few other minor improvements and bug fixes.</li>
</ul>

<h5>v5.7.1 - April 15, 2025</h5>
<ul>
<li>NEW: Deployarr is now Deployrr (finally got the spelling right!). Many changes to reflect this. Minor release to ensure nothing breaks but major functionality remains the same.</li>
<li>NEW: Updated LICENSE to clarify what is open source what is proprietary. 
<li>NEW: One-line Deplorr install/setup method. No more 3-step process to get started or manually picking the architecture.</li>
<li>FIX: Minor fix for qBittorrent VPN appdata path in compose file.</li>
</ul>

<h5>v5.7 - March 5, 2025</h5>
Total Supported Apps: 140+

<ul>
<li>NEW: Added Audiobookshelf, Cloudflare Tunnel, FileZilla, Immich (Phew!), Pi-Hole (v6), Trilium Next, Vikunja, and WikiDocs.</li>
<li>NEW: Huge focus on self-hosted AI with Flowise, n8n, Ollama, Open-WebUI, OpenHands, Qdrant, and Weaviate.</li>
<li>NEW: Added Audiobooks and Podcasts folders to support new media apps.</li>
<li>NEW: Added system health diagnostics and monitoring (Beta).</li>
<li>NEW: Auto systemd-resolved configuration for Debian systems.</li>
<li>NEW: Official documentation now available at https://docs.deployarr.app.</li>
<li>ENHANCEMENT: Enabled hardware acceleration for KASM apps (Kasm, Chromium, DigiKam, Lollypop).</li>
<li>ENHANCEMENT: Updated Traefik to v3.3, Authentik to 2025.2, Authelia to 4.38.19</li>
<li>ENHANCEMENT: Added Uptime Kuma to socket_proxy network.</li>
<li>ENHANCEMENT: Reduced rclone --dir-cache-time from 24h to 1h for more frequent media scans Plex/Jellyfin.</li>
<li>ENHANCEMENT: Changed file provider IP from SERVER_LAN_IP to DOCKER0_IP.</li>
<li>ENHANCEMENT: Modified main menu UI, moved verify to prerequisites menu.</li>
<li>ENHANCEMENT: Added comment on memory overcommit warning to Redis compose.</li>
<li>ENHANCEMENT: Moved Smokeping to selfh.st icon.</li>
<li>ENHANCEMENT: Added Immich Folder setup for uploads (System->Folders).</li>
<li>FIX: Potential fix for malformed compose file.</li>
<li>FIX: Debian DNS configuration issues.</li>
<li>FIX: Plex subdomain placeholder issues.</li>
<li>FIX: Changed app reachable check to IP 127.0.0.1.</li>
<li>FIX: Simplified resolved.conf template.</li>
<li>A few other minor improvements that no one cares about.</li>
</ul>

<h5>v5.6 - January 28, 2025</h5>
Total Supported Apps: 125
<ul>
<li>NEW: Added Wallos and n8n.</li>
<li>NEW: .env Editor in Tools menu to edit environment variables.</li>
<li>NEW: Secrets Editor in Tools menu to edit secrets using nano editor.</li>
<li>NEW: Un-Traefikify to remove Traefik file providers.</li>
<li>ENHANCEMENT: Updated Traefik to v3.3.</li>
<li>ENHANCEMENT: Changed traefik certs dumper image to: ghcr.io/kereis/traefik-certs-dumper:latest.</li>
<li>FIX: CrowdSec installation issues due to journalctl. Replaced journalctl with rsyslog.</li>
<li>FIX: Some deployarr dashboard links were obsolete.</li>
<li>DON'T CARE: Rebranded SmartHomeBeginner to SimpleHomelab.</li>
<li>CARE: Moved Deployarr resources and dependencies to www.deployarr.app. Hopefully it does not cause any issues.</li>
<li>A few other minor improvements.</li>
</ul>

<h5>v5.5 - January 12, 2025</h5>
Total Supported Apps: 123
<ul>
<li>NEW: Added Paperless-NGX (+ support services Paperless-AI, Gotenberg, and Tika), Bookstack, PdfDing, Privatebin, and SSHwifty.</li>
<li>NEW: Tool to create PostgreSQL database from within Deployarr.</li>
<li>ENHANCEMENT: Switched Deployarr Dashboard to use selfh.st icons.</li>
<li>ENHANCEMENT: Socket proxy install will now to check for malformed docker compose and error out. </li>
<li>ENHANCEMENT: Improved handling of rclone config folder missing in some distros.</li>
<li>ENHANCEMENT: Log messages improved to share details on databases being created.</li>
<li>REMOVED: Photoshow (domain compromised) and not maintained.</li>
<li>ENHANCEMENT: Added a note on MagicDNS and added accept-dns false option by default.</li>
<li>FIX: Xpipe-Webtop port environment variable name was wrongly specified as WEBTOP_PORT in the compose file.</li>
<li>FIX: CrowdSec repo error fix.</li>
<li>ENHANCEMENT: Under the hood, significant improvements to database management.</li>
<li>A few other minor improvements.</li>
</ul>

<h5>v5.4.2 - December 30, 2024</h5>
<ul>
<li>FIX: Icons of some apps were not being set on Deployarr Dashboard.</li>
<li>FIX: qBittorrent VPN required manually adding stuff to configuration to allow initial login with admin/adminadmin.</li>
<li>ENHANCEMENT: Modified internet connectivity check. Expert mode will allow overriding this step. </li>
<li>ENHANCEMENT: Remove yq requirement. Implemented an alternate method to manage secrets in master docker compose file.</li>
<li>ENHANCEMENT: More descriptive messages when requirements for a step are not met.</li>
<li>A few other minor improvements.</li>
</ul>

<h5>v5.4.1 - December 24, 2024</h5>
<ul>
<li>ENHANCEMENT: Disabled ports in Authentik docker compose. Not needed. Was causing conflict with Portainer.</li>
<li>Changed postgres_default_passwd to postgres_default_password. Manual change PostgreSQL docker compose required.</li>
</ul>

<h5>v5.4 - December 23, 2024</h5>
Total Supported Apps: 115
<ul>
<li>NEW: Authentik, SearXNG, Beets, and DokuWiki.</li>
<li>ENHANCEMENT: Redis added by default to Authelia, SearXNG, Nextcloud. Redis switched to alpine image and removed password.</li>
<li>ENHANCEMENT: Improved menu to pick available authentication methods. Simplified background logic.</li>
<li>ENHANCEMENT: DOCKER_HOST variable is now automatically set after installing socket proxy and used by several containers that depend on it.</li>
<li>ENHANCEMENT: Added PostgreSQL health check.</li>
<li>ENHANCEMENT: Authelia, Guacamole, Nextcloud, Redis-commander, and SearXNG now have depends_on key to enhance reliability.</li>
<li>ENHANCEMENT: Service recreation stepsnow does not suppress messages so error messages are visible.</li>
<li>ENHANCEMENT: Updated disclaimer to clarify data collection.</li>
<li>ENHANCEMENT: Option to reset "already setup/running" error and force install an app.</li>
<li>FIX: Socket proxy was running/requirement check was failing. </li>
<li>FIX: Internet connectivity check improved and now with an option to override.</li>
<li>FIX: Permissions fixed for Komga.</li>
<li>FIX: DDNS-Updater container always unhealthy for proxied domains.</li>
<li>FIX: Recreate option was not working in Stack Manager.</li>
<li>DON'T CARE: Signficant standardization and simplification underneath to app installation workflow.</li>
<li>Several other minor UI/UX improvements.</li>
</ul>

<h5>v5.3.1 - December 18, 2024</h5>
<ul>
<li>FIX: syntax error: operand expected (error token is "+").</li>
</ul>

<h5>v5.3 - December 6, 2024</h5>
Total Supported Apps: 111
<ul>
<li>NEW: Added Dozzle Agent, Kasm, Komga, Calibre, Calibre-Web, Organizr, Home Assistant Core, Mylar3, Remmina, and Stirling PDF.</li>
<li>ENHANCEMENT: Made the wait time for Traefik SSL certs a bit interesting (rerun Traefik setup to find out).</li>
<li>ENHANCEMENT: Traefik wait time now includes DNS propagation check messages.</li>
<li>ENHANCEMENT: Improved Traefik support for existing SSL certificates and get user to confirm if they want to use them.</li>
<li>ENHANCEMENT: License status is now intelligently extended, without having to reverify every few days.</li>
<li>NEW: Comics folder to suppor the new Komga, Calibre and Calibre-Web apps.</li>
<li>NEW: Traefik dashboard is now exposed on port 8080 by default.</li>
<li>ENHANCEMENT: Stack Manager is now included in Basic and Plus license (previously only Pro).</li>
<li>ENHANCEMENT: Some path changes to be consistent. e.g Books folder is now /data/books in Kavita. Changed VSCode mount point inside the container. </li>
<li>ENHANCEMENT: When required now "[POST-INSTALL NOTES]" are now displayed after an app is installed. Be sure to read them.</li>
<li>ENHANCEMENT: Numerous AI-suggested syntax and logic improvements.</li>
<li>ENHANCEMENT: Reliability of apps dependent on MariaDB (e.g. Nextcloud, Guacamole, Speedtest-Tracker) improved.</li>
<li>FIX: Inconsistencies with MariaDB root password, causing issues. Renamed mysql_root_password to mariadb_root_password. May require manual updates to some app compose files.</li>
<li>FIX: Some Docker bash aliases were not working when using custom Docker folder.</li>
<li>FIX: secrets defintion in main docker compose was not working as expected, causing yaml syntax errors. Few other minor reliability improvements with secrets.</li>
<li>FIX: OAuth container had TLS specification conflicting with Traefik's universal TLS options with tls-opts.yml file.</li>
<li>FIX: Typos and other minor improvements.</li>
<li>DON'T CARE: Deployarr development is now done via private Git repository due to addition of couple of other contributors.</li>
</ul>

<h5>v5.2 - November 7, 2024</h5>
Total Supported Apps: 101
<ul>
<li>NEW: Added DigiKam, Redis Commander, PHotoshow, Node Exporter, Funkwhale, Gonic, GPTWOL, CrowdSec, and CrowdSec Firewall Bouncer.</li>
<li>ENHANCEMENT: Deployarr PIN now saved locally and shown in About menu, in case you forget. To change it, just reset it.</li>
<li>FIX: DWEEBUI_SECRET not found error.</li>
<li>Other minor improvements and fixes.</li>
<li>Next few releases will focus on stability (e.g. on Debian 12) and improvements (e.g. Guacamole).</li>
</ul>

<h5>v5.1 - October 30, 2024</h5>
Total Supported Apps: 91
<ul>
<li>NEW: Added DweebUI, Cloud Commander, Double Commander, Theme Park, Notifiarr, Flaresolverr, ESPHome, Emby, Dockwatch, Lollypop, qBittorrent without VPN, Transmission without VPN, Tailscale, What's Up Docker (WUD), and ZeroTier.</li>
<li>NEW: Changed Plex transcode folder path to match Jellyfin/Emby.</li>
<li>NEW: qBittorrent is now without VPN by default. There is a separate menu item to install it with VPN.</li>
<li>FIX: Bash Aliases was not working with custom Docker Folder.</li>
<li>FIX: Messages after app installation was showing wrong port number in certain situations.</li>
<li>ENHANCEMENT: Improved port availability check. On top of occupied ports on the system, .env will now be checked for ports already defined for other apps.</li>
</ul>

<h5>v5.0.1 - September 30, 2024</h5>
<ul>
<li>FIX: System checks was not being marked as done after completion. Required exiting and relaunching Deployarr.</li>
<li>FIX: Better Rclone remotes detection.</li>
<li>FIX: Rclone installation was failing due to unzip requirement.</li>
<li>FIX: Running the script with sudo failed on Debian due to lack of sudo package by default.</li>
<li>FIX: All apps that required MariaDB databases (Speedtest Tracker, NextCloud, and Gaucamole) failed on migration. Existing databases will now be recognized instead of force creating new ones.</li>
<li>FIX: Traefik will respect existing acme.json file upon migration/reinstallation.</li>
<li>FIX: SSL certificates (acme.json) were being emptied unnecessarily.</li>
</ul>

<h5>v5.0 - September 29, 2024</h5>
Total Supported Apps: 76

<ul>
<li>NEW: Deployarr logo and icon.</li>
<li>NEW: Local mode for installing apps for local access only (no reverse proxy). This should now remove the Traefik requirement and allow multi-server setups.</li>
<li>NEW: Traefik Exposure Modes. Simple - all apps behind Traefik accessible internally and externally. Advanced - control over exposing apps internally, externally, or both. </li>
<li>NEW: By default Traefik will use file providers to expose apps via reverse proxy. Previously this was done using Docker labels. Some apps (e.g. Traefik, OAuth, and Authelia), will continue to use labels. </li>
<li>NEW: Deployarr Dashboard - New Homepage based dashboard that auto-populates as you install new apps. It works but will evolve over time.</li>
<li>NEW: Recommended order of steps for various setups.</li>
<li>NEW: License changes. There are now 3 license types: Basic, Plus, and Pro. Basic allows local-only installs. See License Types description in About menu.</li>
<li>NEW: Deployarr pin reset feature.</li>
<li>NEW: All apps are now exposed to Docker host using ports. Deployarr will suggest ports during installation.</li>
<li>NEW: Deployarr will now call Cloudflare API to check the validity of the DNS API token for Traefik.</li>
<li>NEW: Included v4 to v5 migration instructions.</li>
<li>ENHANCEMENT: Description error messages when requirements are not met for a specific step.</li>
<li>ENHANCEMENT: Signficant improvement in speed/responsiveness.</li>
<li>ENHANCEMENT: Menu reorganized based on past feedback. </li>
<li>REMOVED: Traefik v2 to v3 migration.</li>
<li>REMOVED: Auto-Traefik to Deployarr migration.</li>
<li>REMOVED: Account registration directly from the script. Not needed anymore, as all previous "Basic" features are now free for anyone.</li>
<li>OTHERS: Eleventy-million minor changes (over 9000 lines of code rewritten). </li>
</ul>

<h5>v4.6.1 - August 7, 2024</h5>
<ul>
<li>FIX: Pin creation was broken.</li>
</ul>

<h5>v4.6 - August 6, 2024</h5>
Total Supported Apps: 75
<ul>
<li>NEW: Added Baikal, Piwigo, Resilio Sync, Node-RED, Homebridge, Mosquitto, Jackett, MQTTX Web, Scrutiny, and Chromium.</li>
<li>FIX: Smokeping and FreshRSS appdata folder was wrongly mapped.</li>
<li>FIX: Plex was calling SERVER_IP instead of SERVER_LAN_IP env.</li>
<li>KNOWN ISSUES: If the hostname changes Deployarr can break until the new hostname are manually changed in various location. This isssue is not specific to just v4.6 and applies to previous versions as well.</li>
<li>NOTE: Auto-Traefik to Deployarr migration and Traefik v2 to v3 migration support will be removed in the next release.</li>
</ul>

<h5>v4.5.4 - July 15, 2024</h5>
<ul>
<li>FIX: User creation was not working. Final fix (hopefully).</li>
</ul>

<h5>v4.5.3 - July 15, 2024</h5>
<ul>
<li>FIX: User creation was not working.</li>
</ul>

<h5>v4.5.2 - July 15, 2024</h5>
<ul>
<li>NEW: Optin to Share Usage Stats.</li>
<li>NEW: 6-digit numerical pin to protect from unauthorized use of email.</li>
<li>NEW: Stack Manager: Option to pull image updates and upgrade containers.</li>
<li>FIX: 4.5.1 was complaining about upgrading to 4.5.1 when it was already the latest.</li>
<li>Other minor improvements</li>
</ul>

<h5>v4.5.1 - July 14, 2024</h5>
<ul>
<li>Minor bug fixes.</li>
</ul>

<h5>v4.5 - July 13, 2024</h5>
Total Supported Apps: 65
<ul>
<li>NEW: Added Kometa.</li>
<li>NEW: Rclone Remote SMB mount, Automount, Delay Media Apps, and Refresh Cache.</li>
<li>NEW: Reorganized menu. All prerequisite steps are now in one place.</li>
<li>FIX: Removed Plex requirement for Tautulli - would not work if Plex is in a different server.</li>
<li>ENHANCEMENT: Expanded bash aliases.</li>
<li>Other minor improvements and fixes.</li>
</ul>

<h5>v4.4.1 - July 5, 2024</h5>
<ul>
<li>FIX: Bug fixes.</li>
<li>ENHANCEMENT: Improved handling of passwords/strings with special characters.</li>
<li><s>KNOWN ISSUE: Authelia not working as expected. Password does not work</s>.</li>
</ul>

<h5>v4.4 - July 4, 2024</h5>
Total Supported Apps: 64
<ul>
<li>NEW: Added Flame, Kavita, Netdata, and pgAdmin.</li>
<li>NEW: Installing required packages is now a separate step in System Prep menu.</li>
<li>FIX: Some users downgraded from Pro to Basic.</li>
<li>FIX: Bash aliases was not installing properly.</li>
<li>FIX: Some premature/harmless error messages.</li>
<li>ENHANCEMENT: Improved compatibility with Debian.</li>
<li>ENHANCEMENT: Improved compatibility with older Ubuntu (>=20.04) / Debian (>=11).</li>
</ul>

<h5>v4.3 - June 27, 2024</h5>
Total Supported Apps: 60
<ul>
<li>NEW: Added Maintainerr, CyberChef, The Lounge.</li>
<li>FIX: Feedback/Review was not working.</li>
<li>FIX: Some premature error messages.</li>
</ul>

<h5>v4.2.1 - June 27, 2024</h5>
<ul>
<li>NEW: Ability to clear Deployarr cache.</li>
<li>FIX: License check was not working.</li>
</ul>

<h5>v4.2 - June 26, 2024</h5>
Total Supported Apps: 57
<ul>
<li>NEW: Added Wireguard + WebUI with WG-Easy, cAdvisor, Dashy, Docker Garbage Colleciton, and Traefik Certs Dumper.</li>
<li>ENHANCEMENT: Revamped license checks and new user creation.</li>
<li>ENHANCEMENT: If MariaDB is running Speedtest-Tracker will now offer to use MariaDB instead of SQLite.</li>
<li>ENHANCEMENT: If Plex is installed and Logs are found, they will be passed automatically to Tautulli.</li>
<li>FIX: Feedbacks were not being registered. Please submit or re-submit feedback (especially if you did since v4.0).</li>
<li>FIX: Minor bug fixes.</li>
<li>NOTICE: Traefik v2 remnants will be removed in next version (automatic migration won't be possible).</li>
</ul>

<h5>v4.1 - June 23, 2024</h5>
<ul>
<li>NEW: Added Airsonic-Advanced, Change-Detection, FreshRSS, Grocy, Heimdall, Jellyseerr, NZBGet, Ombi, Overseerr, Smokeping, and Tautulli.</li>
<li>ENHANCEMENT: Changed qBittorrent from Docker Labels to File Provider for Traefik.</li>
<li>FIX: Speedtest-Tracker latest version was not working without an API Key. Added API Key feature.</li>
<li>FIX: Minor bug fixes.</li>
</ul>

<h5>v4.0.1 - June 17, 2024</h5>
<ul>
<li>FIX: Switching Authentication method was working.</li>
<li>FIX: Re-registering an existing account caused account downgrade to Deployarr Basic.</li>
<li>FIX: Installing MariaDB/PostgreSQL before Traefik caused errors due to improper secrets addition.</li>
<li>FIX: Non-critical error messages were displayed if docker folder was not set.</li>
<li>FIX: Update process was failing due to incorrect extension.</li>
</ul>

<h5>v4.0 - June 16, 2024</h5>
<ul>
<li>Deployarr now supports 40 Apps!!!</li>
<li>NEW: Licence naming: Free (previously Unregistered), Basic (previously Starter Free), Plus (previously Auto-Traefik), and Pro (previously Auto-Traefik+).</li>
<li>NEW: Auto-Traefik to Deployarr auto migration.</li>
<li>NEW: Ability register a free account from within Deployarr to gain free Basic license.</li>
<li>NEW: Added Bazarr, DeUnhealth, Gluetun VPN, Lidarr, Plex, Prowlarr, Jellyfin, qBittorrent, Radarr, Readarr, and Sonarr.</li>
<li>NEW: Starter config for qBittorrent with pre-configured folders to eliminate permissions issues. Also includes a fix for not being able to login using the default username and password. qBittorrent used Gluetun VPN Kill switch by default.</li>
<li>NEW: Gluetun VPN supports both Wireguard and OpenVPN.</li>
<li>NEW: Ability to get customized discount codes right from the About menu.</li>
<li>NEW: Ability to toggle Intro Messages on/off on the menus.</li>
<li>NEW: Key announcements right on the menu without needing update the script.</li>
<li>ENHANCEMENT: Ability to set custom data folder for Nextcloud.</li>
<li>ENHANCEMENT: customRequestHeaders and forceSTSHeader enabled by default (needed for Nextcloud).</li>
<li>ENHANCEMENT: SABnzbd now exposed to host machine via port 8090. qBittorrent via 8091.</li>
<li>ENHANCEMENT: Out of the 3 media folders, only one needs to be set (anyone). Previously, Media Folder 1 was required.</li>
<li>ENHANCEMENT: All menus updated with descriptive options.</li>
<li>ENHANCEMENT: System prep menu now display all configuration info for quick verification.</li>
<li>FIX: Minor fix in IT-Tools docker labels.</li>
<li>Updated README.md</li>
<li>Too many other minor changes to list</li>
</ul>

<h5>June 14, 2024</h5>
<ul>
<li>NEW: Goodbye Auto-Traefik. Hello Deployarr - https://github.com/anandslab/deployarr</li>
<li>v3.3.3 will be the last version of Auto-Traefik.</li>
</ul>

<h5>v3.3.3 - June 6, 2024</h5>
<ul>
<li>NEW APPS: Nextcloud (not AIO version; uses existing Redis and MariaDB services), SABnzbd.</li>
<li>NEW: Graphics card detection (EXPERIMENTAL).</li>
<li>FIX: Traefik staging was failing while checking for staging certificates.</li>
<li>Other minor bug fixes.</li>
</ul>

<h5>v3.3.2.1 - May 27, 2024</h5>
<ul>
<li>FIX: Adding external app behind Traefik was broken.</li>
</ul>

<h5>v3.3.2 - May 25, 2024</h5>
<ul>
<li>NEW: ShellInaBox added (web-based terminal).</li>
<li>NEW: Authelia upgraded to v4.38.8.</li>
<li>NEW: Ability to set custom Docker folder and Backup folder.</li>
<li>ENHANCEMENT: UI/UX improvements throughout, including a new Apps menu.</li>
<li>ENHANCEMENT: More clarity on which steps are required and which ones are not.</li>
</ul>

<h5>v3.3.1 - May 23, 2024</h5>
<ul>
<li>NEW: Adminer, PostgreSQL, and Redis</li>
<li>NEW: Ability to create MariaDB database using the script (from Tools menu).</li>
<li>NEW: System Prep menu expanded with additional settings in preparation for future apps. Many of these are optional for now: SMTP Details, Downloads Folder, Media Folders, Server LAN IP, etc.</li>
<li>NEW: Ability to set a Traefik Auth Bypass Key - in preparation for future apps.</li>
<li>ENHANCEMENT: Reverse Proxy menu improved with more context based information (e.g. Number of external apps behind Traefik).</li>
<li>ENHANCEMENT: All sensitive info use by the script are now more securely stored as docker secrets.</li>
<li>ENHANCEMENT: Apps menu now shows status (Running), image version if available, and authentication mode beside their name.</li>
<li>ENHANCEMENT: Backups menu now shows the Backup Folder, Number of Backups, and Size of Backups Folder.</li>
<li>FIX: Ability to set authentication mode while added external apps behind Traefik was broken.</li>
<li>Several other minor fixes and improvements.</li>
</ul>

<h5>v3.3 - May 18, 2024</h5>
<ul>
<li>ENHANCEMENT: Colors galore! Color coding of menu and status texts for better UX.</li>
<li>NEW: Traefik v3 now default.</li>
<li>NEW: Traefik v2 to v3 migration assistant (EXPERIMENTAL).</li>
<li>NEW: Traefik Access and Errors now available via Dozzle.</li>
<li>FIX: With no Authelia and with OAuth, setting authentication system during app install wasn't working properly.</li>
<li>FIX: Rules syntax changes for Traefik v3 compliance.</li>
<li>FIX: Bash Aliases Fix - was erroring out previously.</li>
<li>Several other minor fixes and improvements.</li>
</ul>

<h5>v3.2.2 - April 26, 2024</h5>
<ul>
<li>NEW: New Name for Auto-Traefik: Deployarr (coming soon).</li>
</ul>

<h5>v3.2.1 - April 26, 2024</h5>
<ul>
<li>NEW: Speedtest-Tracker added.</li>
<li>FIX: Enabling authentication during app install was not working as expected.</li>
<li>OTHER: Additional minor bug fixes.</li>
</ul>

<h5>v3.2 - April 25, 2024</h5>
<ul>
<li>ANNOUNCEMENT: Auto-Traefik will be renamed shortly: "Traefik" is a trademarked word and Auto-Traefik does more than just Traefik.</li>
<li>ANNOUNCEMENT: Membership plugin that supports license verification will need an upgrade in the coming days. Please expect some down times that might hinder license checks.</li>
<li>NEW: Reverted a change introduced in 3.1. Sudoing should not be used when calling the script initially. Elevation to root will still be required after the script starts running.</li>
<li>NEW: Added Google OAuth (Traefik Forward Authentication).</li>
<li>NeW: Added Visual Studio Code Server (VS Code), DDNS Updater, and IT Tools.</li>
<li>NEW: Tools menu with Stack Manager, Backups, and Permissions Checks.</li>
<li>FIX: Improve Docker Folder permissions.</li>
<li>ENHANCEMENT: Improved service delete option to remove secrets as well.</li>
<li>ENHANCEMENT: Improved Auto-Traefik reset option.</li>
<li>ENHANCEMENT: Arranged all apps in alphabetical order in Apps menu.</li>
<li>ENHANCEMENT: Improved required info section with option to create new Linux users and warnings for certain situations (running as root, user not present, etc.).</li>
<li>Others: Over 2000 lines of code changed/improved.</li>
</ul>

<h5>v3.1.1 - April 16, 2024</h5>
<ul>
<li>NEW: Grafana added.</li>
<li>FIX: Prometheus permissions error.</li>
<li>ENHANCEMENT: Automated Vaultwarden Admin Token setup.</li>
</ul>

<h5>v3.1 - April 14, 2024</h5>
<ul>
<li>NEW: Sudo will now be required to invoke the script.</li>
<li>NEW: Stack Manager - Stop/Stop containers, Containers Status, Disable/Enable/Delete Services, and more.</li>
<li>NEW: Migrate and Restore Auto-Traefik and Docker Environment to a new system.</li>
<li>NEW: 'About' menu with relevant info on Auto-Traefik.</li>
<li>NEW: Added Glances.</li>
<li>NEW: Added Homarr.</li>
<li>NEW: Added InfluxDB.</li>
<li>NEW: Added Prometheus.</li>
<li>NEW: Added Vaultwarden.</li>
<li>NEW: Second domain passthrough to another Traefik instance on a different host, as explained in https://www.smarthomebeginner.com/multiple-traefik-instances/.</li>
<li>ENHANCEMENT: Improved compatibility with GLIBC. The script should now work on older version of Ubuntu/Debian/OMV.</li>
<li>ENHANCEMENT: Code improvements.</li>
<li>ENHANCEMENT: 'Authentication' Menu is now 'Security'.</li>
</ul>

<h5>v3.0.4 - March 29, 2024</h5>
<ul>
<li>ENHANCEMENT: Improved reliability of status/completion checks for various steps.</li>
<li>ENHANCEMENT: Reorganized menu to allow for future additions.</li>
<li>NEW: Added changelog view: Settings->View Changelog.</li>
</ul>

<h5>v3.0.3 - March 28, 2024</h5>
<ul>
<li>FIX: Removed compres middleware. Probably not important for homelab/low-traffic environment. Plus, this was causing "mine: no media type" error in Traefik logs.</li>
<li>ENHANCEMENT: Improved reliability of Docker Root Folder backups.</li>
<li>ENHANCEMENT: Added UDM/OPNsense specific troubleshooting tips.</li>
</ul>

<h5>v3.0.2 - March 21, 2024</h5>
<ul>
<li>FIX: Guacamole secrets error.</li>
<li>NEW: Automatic script updates - bye bye manual downloads!.</li>
<li>NEW: Ability to submit your rating/feedback.</li>
</ul>


<h5>v3.0.1 - March 18, 2024</h5>
<ul>
<li>FIX: Traefik dashboard 404.</li>
</ul>

<h5>v3.0 - March 15, 2024</h5>
<ul>
<li>NEW: Added Guacamole for Remote Admin</li>
<li>NEW: Backups (create, view, restore, and delete)</li>
<li>NEW: Additional ability (Docker Environment Setup, Socket Proxy Setup, etc.) for registered free-membership tier.</li>
<li>ENHANCEMENT: Added ability to set subdomain name during app setup</li>
<li>ENHANCEMENT: Added ability to set authentication type during app setup</li>
<li>ENHANCEMENT: Added feedback message when requirements are not met for a specific step</li>
<li>ENHANCEMENT: Authelia middlewares and configuration change to align with developer's recommendation</li>
<li>ENHANCEMENT: UI Improvements</li>
<li>ENHANCEMENT: Added password suggestions wherever password needs to be set</li>
<li>ENHANCEMENT: Added expert override for certain DNS issues</li>
<li>FIX: Bug fix for Docker Aliases</li>
</ul>
Over 1000 lines of code changed. 

<h5>v2.4.2 - February 27, 2024</h5>
<ul>
<li>Improved Traefik port 80 and 443 check for Traefik.</li>
<li>Implemented <a href="https://github.com/chaifeng/ufw-docker">UFW-Docker</a>. All though this appears to work, at this point it is an Experimental feature.</li>
<li>Implemented Docker secrets. At this point, this only applies to Traefik, Authelia, and MariaDB. This will be the default moving forward.</li>
<li>Improved the reliability of creating Docker secrets.</li>
<li>Added the ability to change authentication method for external/non-docker apps.</li>
<li>UI improvements for changing authentication methods for apps.</li>
<li>Changed Authelia users_database.yml to users.yml to align with Docs and <a href="https://www.smarthomebeginner.com/authelia-docker-compose-guide-2024/">Authelia guide</a> on SmartHomeBeginner.com</li>
</ul>

<h5>v2.4.1 - February 4, 2024</h5>
<ul>
<li>Bug fixes.</li>
</ul>

<h5>v2.4 - February 4, 2024</h5>
<ul>
<li>Unfortunately, many breaking changes, which make it incompatible with setup done with previous versions of the script.</li>
<li>Replace Cloudflare Email + Global API Key with Scoped API Token (CF_DNS_API_TOKEN)</li>
<li>Added Secrets for Basic HTTP Auth and CF_DNS_API_TOKEN</li>
<li>Additional Traefik checks - dangling TXT records, DNS error.</li>
<li>Improved port checks and added override option. </li>
<li>Changed DOMAINNAME variable to DOMAINNAME_1.</li>
<li>Docker Compose File now has the server's hostname as suffix.</li>
<li>Changed Traefik entrypoint names form http and https to web and websecure as in some online documentation.</li>
<li>Broke up middlewares to individual file providers instead of one middlewares.yml and middlewares-chain.yml</li>
<li>Added ability to put external apps behind Traefik.</li>
<li>Added MariaDB and phpMyAdmin.</li>
</ul>

<h5>v2.3.1 - January 5, 2024</h5>
<ul>
<li>Added override for port checks.</li>
</ul>

<h5>v2.3 - December 28, 2023</h5>
<ul>
<li>Simplified data entry forms.</li>
<li>Broke down and reassigned "Required Information" collection to their relevant section/steps instead of collecting all info at the beginning.</li>
<li>Added UI, instead of commandline for certain steps (e.g. Must Read Info, Authelia, etc.)
<li>Added Docker data size on disk and option to prune unused data/volumes/images.</li>
<li>Added option to uninstall/remove Auto-Traefik.</li>
<li>Added "Expert Mode" - will allow overriding certain steps (e.g. IP checks). Mode can be changed from Auto-Traefik Options.</li>
<li>Added Docker and Docker Compose version info to Docker menu.</li>
</ul>

<h5>v2.2.1 - December 6, 2023</h5>
<ul>
<li>Fix for the script not creating docker folders when they do not already exist.</li>
<li>Added comment on how to find Authelia verification email.</li>
</ul>

<h5>v2.2 - December 2, 2023</h5>
<ul>
<li>Potential fix for "Could not read certificate" error. Replaced openssl certificate check with acme.json file checks.</li>
<li>Removed unnecessary stoppage and restart of containers - only services being worked on will restart instead of the whole stack.</li>
<li>Improved the UI/UX for collecting required information and license check. </li>
</ul>

<h5>v2.1 - November 28, 2023</h5>
<ul>
<li>Several improvements and bug fixes. Potential fix for "Could not read certificate" error.</li>
<li>Added Dozzle, Homepage, and Uptime Kuma.</li>
</ul>

<h5>v2.0 - November 15, 2023</h5>
<ul>
<li>Free options for everyone - The system, docker, and port checks are available for anyone to use. No purchase necessary. This is great for anyone that wants to troubleshoot or to ensure that you system passes all checks to setup a Docker/Traefik stack.</li>
<li>Auto-Traefik now has 3 levels of licensing: Free/Unregistered, Auto-Traefik, and Auto-Traefik+ to fit the needs of most people.</li>
<li>Most of the navigation is now through a commandline GUI. This will continue to evolve.</li>
<li>Added ability to complete the whole process in steps, instead of one-go as in v1.</li>
<li>Expanded Auto-Traefik Options - reset, view key information, license checks, and build a sanitized troubleshooting log without any sensitive information.</li>
<li>Modified main docker compose file to now be more modular. All the individual services are available as individual yml files in a separate folder.</li>
<li>Added Authelia for multifactor authentication, with ability to change authentication mechanisms for apps from the UI.</li>
<li>Added Portainer. This is just the start. Many more apps will be added. </li>
<li>More to come.</li>
</ul>

<h5>v1.1.4 - October 31, 2023</h5>
<ul>
<li>Increased service start check timeout to avoid false positives</li>
</ul>

<h5>v1.1.3 - October 30, 2023</h5>
<ul>
<li>Minor changes to logging - added a few more logging spots</li>
<li>Updated Traefik version to 2.10</li>
<li>Fixed a bug where subdomain resolution check would not exit on error</li>
</ul>

<h5>v1.1.2 - October 16, 2023</h5>
<ul>
<li>Added auto-traefik output logging to /tmp/auto-traefik/auto-traefik.log to help troubleshoot</li>
<li>Added failsafe - in case container with same name already exists, script will fail</li>
</ul>

<h5>v1.1.1 - October 14, 2023</h5>
<ul>
<li>Added a backup method to check WAN IP. Some IP check sites present Cloudflare challenge, interfering with the process.</li>
</ul>

<h5>v1.1 - October 9, 2023</h5>
<ul>
<li>Added version check. Now the users will see a warning of there is a new version available for download.</li>
<li>Clean up repository and organized files.</li>
<li>Reduced unnecessary sleeps/waits in the script.</li>
<li>Improved check for certificates, instead of sleeping for a certain time, which can fail sometimes. </li>
<li>Added check for Let's Encrypt rate limiting.</li>
<li>Added backup for acme.json if successful. Can be handy if rate limit is hit.</li>
</ul>

<h5>v1.0 - September 23, 2023</h5>
<ul>
<li>Initial Release</li>
</ul>

