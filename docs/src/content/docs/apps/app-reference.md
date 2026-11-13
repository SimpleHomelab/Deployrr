---
title: "App reference: container names, ports and folders"
description: Look up the container name, internal port, .env port variable, folders inside the container and health check status of each Deployrr v6 app.
type: reference
tags:
  - app-networking
  - ports
  - compose
  - docker
  - media
applies_to: v6.0+
related:
  - using-deployrr/connecting-apps
  - apps/media-library-empty
  - apps/deunhealth
  - using-deployrr/docker-folder-layout
  - using-deployrr/second-app-instances
further_reading:
  - title: "UDMS part 14: connecting apps with container names"
    url: https://www.simplehomelab.com/udms-14-docker-media-server/
videos:
  - id: oY1U_Htes9A
    start: 171
    title: "DeUnhealth guide: health check on qBittorrent and automatic restart"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
  - id: THuLgGwq0vg
    start: 1589
    title: "Docker Compose media server guide: host port and container port explained"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
last_reviewed: 2026-11-12
status: current
old_paths: []
sources: []
---

Use this page to look up how an app is set up by default. It covers container names, ports, the folders an app sees inside its container, and which apps have a Docker health check.

The tables show the defaults. Your own files are the final word. See [Check your own files](#check-your-own-files).

## Container names and ports

To connect one app to another, use `container-name:internal-port`. See [Connect your apps to each other](/using-deployrr/connecting-apps/) for the steps and for what to avoid.

- **Internal port** is the port inside the container. Use it when one container talks to another.
- **.env port variable** holds the port you use in your browser. Deployrr asks for it at install and saves it in your `.env` file.

For the difference between the two ports, watch [Docker Compose media server guide at 26:29](https://youtu.be/THuLgGwq0vg?t=1589) (manual Docker Compose setup). To understand how apps reach each other by container name, see [UDMS part 14: connecting apps with container names](https://www.simplehomelab.com/udms-14-docker-media-server/) (manual setup).

| App | Container name | Internal port | .env port variable | Extra ports |
| --- | --- | --- | --- | --- |
| Adminer | `adminer` | 8080 | `ADMINER_PORT` | |
| Airsonic-Advanced | `airsonic-advanced` | 4040 | `AIRSONICADVANCED_PORT` | |
| Audiobookshelf | `audiobookshelf` | 80 | `AUDIOBOOKSHELF_PORT` | |
| Autobrr | `autobrr` | 7474 | `AUTOBRR_PORT` | |
| Baikal | `baikal` | 80 | `BAIKAL_PORT` | |
| Bazarr | `bazarr` | 6767 | `BAZARR_PORT` | |
| Beets | `beets` | 8337 | `BEETS_PORT` | |
| Bookstack | `bookstack` | 80 | `BOOKSTACK_PORT` | |
| Boxarr | `boxarr` | 8888 | `BOXARR_PORT` | |
| cAdvisor | `cadvisor` | 8080 | `CADVISOR_PORT` | |
| Calibre | `calibre` | 8080 | `CALIBRE_PORT` | 8081 (`CALIBRE_WEBSERVER_PORT`) |
| Calibre-Web | `calibre-web` | 8083 | `CALIBREWEB_PORT` | |
| Change-Detection | `change-detection` | 5000 | `CHANGEDETECTION_PORT` | |
| Chromium | `chromium` | 3000 | `CHROMIUM_PORT` | |
| Cleanuparr | `cleanuparr` | 11011 | `CLEANUPARR_PORT` | |
| Cloud Commander | `cloud-commander` | 8000 | `CLOUDCOMMANDER_PORT` | |
| CrowdSec | `crowdsec` | 8080 | `CROWDSEC_PORT` | |
| CyberChef | `cyberchef` | 8000 | `CYBERCHEF_PORT` | |
| Dashy | `dashy` | 8080 | `DASHY_PORT` | |
| DDNS Updater | `ddns-updater` | 8000 | `DDNSUPDATER_PORT` | |
| Deployrr Dashboard | `deployrr-dashboard` | 3000 | `DEPLOYRRDASHBOARD_PORT` | |
| DigiKam | `digikam` | 3000 | `DIGIKAM_PORT` | |
| Dispatcharr | `dispatcharr` | 9191 | `DISPATCHARR_PORT` | |
| Dockhand | `dockhand` | 3000 | `DOCKHAND_PORT` | |
| Dockpeek | `dockpeek` | 8000 | `DOCKPEEK_PORT` | |
| Dockwatch | `dockwatch` | 80 | `DOCKWATCH_PORT` | |
| DokuWiki | `dokuwiki` | 80 | `DOKUWIKI_PORT` | |
| Double Commander | `double-commander` | 3000 | `DOUBLECOMMANDER_PORT` | |
| Dozzle | `dozzle` | 8080 | `DOZZLE_PORT` | |
| Dozzle Agent | `dozzle-agent` | 7007 | `DOZZLEAGENT_PORT` | |
| DweebUI | `dweebui` | 8000 | `DWEEBUI_PORT` | |
| Emby | `emby` | 8096 | `EMBY_PORT` | 8920 |
| ESPHome | `esphome` | 6052 | `ESPHOME_PORT` | |
| FileZilla | `filezilla` | 3000 | `FILEZILLA_PORT` | |
| Flame | `flame` | 5005 | `FLAME_PORT` | |
| Flaresolverr | `flaresolverr` | 8191 | `FLARESOLVERR_PORT` | |
| Flowise | `flowise` | Same as `FLOWISE_PORT` (default 5023) | `FLOWISE_PORT` | |
| FreshRSS | `freshrss` | 80 | `FRESHRSS_PORT` | |
| Funkwhale | `funkwhale` | 80 | `FUNKWHALE_PORT` | |
| GameVault | `gamevault` | 8080 | `GAMEVAULT_PORT` | |
| Glances | `glances` | 61208 | `GLANCES_PORT` | |
| Gonic | `gonic` | 80 | `GONIC_PORT` | |
| Grafana | `grafana` | 3000 | `GRAFANA_PORT` | |
| Grocy | `grocy` | 80 | `GROCY_PORT` | |
| Guacamole | `guacamole` | 8080 | `GUACAMOLE_PORT` | |
| Heimdall | `heimdall` | 80 | `HEIMDALL_PORT` | |
| Homarr | `homarr` | 7575 | `HOMARR_PORT` | |
| Homepage | `homepage` | 3000 | `HOMEPAGE_PORT` | |
| Homer | `homer` | 8080 | `HOMER_PORT` | |
| Immich | `immich` | 2283 | `IMMICH_PORT` | |
| InfluxDB | `influxdb` | 8086 | `INFLUXDB_PORT` | |
| IT-Tools | `it-tools` | 80 | `ITTOOLS_PORT` | |
| Jackett | `jackett` | 9117 | `JACKETT_PORT` | |
| Jellyfin | `jellyfin` | 8096 | `JELLYFIN_PORT` | |
| Jellyseerr | `jellyseerr` | 5055 | `JELLYSEERR_PORT` | |
| Kasm | `kasm` | 443 | `KASM_PORT` | 3000 (`KASM_INSTALLATION_PORT`) |
| Kavita | `kavita` | 5000 | `KAVITA_PORT` | |
| Komga | `komga` | 25600 | `KOMGA_PORT` | |
| Langfuse | `langfuse` | 3000 | `LANGFUSE_PORT` | |
| Lidarr | `lidarr` | 8686 | `LIDARR_PORT` | |
| Lollypop | `lollypop` | 3000 | `LOLLYPOP_PORT` | |
| Maintainerr | `maintainerr` | 6246 | `MAINTAINERR_PORT` | |
| MariaDB | `mariadb` | 3306 | `MARIADB_PORT` | |
| Mosquitto | `mosquitto` | 1883 | `MOSQUITTO_PORT` | 9001 websocket (`MOSQUITTO_WS_PORT`) |
| MQTTX-Web | `mqttx-web` | 80 | `MQTTXWEB_PORT` | |
| Mylar3 | `mylar3` | 8090 | `MYLAR3_PORT` | |
| n8n | `n8n` | 5678 | `N8N_PORT` | |
| Navidrome | `navidrome` | 4533 | `NAVIDROME_PORT` | |
| Nextcloud | `nextcloud` | 80 | `NEXTCLOUD_PORT` | |
| Nginx Proxy Manager | `npm` | 81 | `NPM_ADMIN_PORT` | 80 and 443 |
| Node Exporter | `node-exporter` | 9100 | `NODEEXPORTER_PORT` | |
| Node-RED | `node-red` | 1880 | `NODERED_PORT` | |
| Notifiarr | `notifiarr` | 5454 | `NOTIFIARR_PORT` | |
| NZBGet | `nzbget` | 6789 | `NZBGET_PORT` | |
| Ollama | `ollama` | 11434 | `OLLAMA_PORT` | |
| Ombi | `ombi` | 3579 | `OMBI_PORT` | |
| Open-WebUI | `open-webui` | 8080 | `OPENWEBUI_PORT` | |
| OpenHands | `openhands` | 3000 | `OPENHANDS_PORT` | |
| Organizr | `organizr` | 80 | `ORGANIZR_PORT` | |
| Overseerr | `overseerr` | 5055 | `OVERSEERR_PORT` | |
| Paperless-AI | `paperless-ai` | 3000 | `PAPERLESSAI_PORT` | |
| Paperless-NGX | `paperless-ngx` | 8000 | `PAPERLESSNGX_PORT` | |
| PdfDing | `pdfding` | 8000 | `PDFDING_PORT` | |
| pgAdmin | `pgadmin` | 80 | `PGADMIN_PORT` | |
| phpMyAdmin | `phpmyadmin` | 80 | `PHPMYADMIN_PORT` | |
| Pi-hole | `pihole` | 80 | `PIHOLE_PORT` | 53 (TCP and UDP), 67 (UDP) |
| Piwigo | `piwigo` | 80 | `PIWIGO_PORT` | |
| Plex | `plex` | 32400 | `PLEX_PORT` | 3005, 8324, 32469, 1900 (UDP), 32410 and 32412 to 32414 (UDP) |
| Portainer | `portainer` | 9000 | `PORTAINER_PORT` | |
| PostgreSQL | `postgresql` | 5432 | `POSTGRESQL_PORT` | |
| PrivateBin | `privatebin` | 8080 | `PRIVATEBIN_PORT` | |
| ProjectSend | `projectsend` | 80 | `PROJECTSEND_PORT` | |
| Prometheus | `prometheus` | 9090 | `PROMETHEUS_PORT` | |
| Prowlarr | `prowlarr` | 9696 | `PROWLARR_PORT` | |
| Pulse | `pulse` | 7655 | `PULSE_PORT` | |
| qBittorrent | `qbittorrent` | 8080 | `QBITTORRENT_PORT` | |
| Qdrant | `qdrant` | 6333 | `QDRANT_PORT` | 6334 |
| Radarr | `radarr` | 7878 | `RADARR_PORT` | |
| Redis | `redis` | 6379 | `REDIS_PORT` | |
| Redis Commander | `redis-commander` | 8081 | `REDISCOMMANDER_PORT` | |
| Remmina | `remmina` | 3000 | `REMMINA_PORT` | |
| Resilio-Sync | `resilio-sync` | 8888 | `RESILIOSYNC_PORT` | 55555 |
| SABnzbd | `sabnzbd` | 8080 | `SABNZBD_PORT` | |
| Scrutiny | `scrutiny` | 8080 | `SCRUTINY_PORT` | |
| SearXNG | `searxng` | 8080 | `SEARXNG_PORT` | |
| SmokePing | `smokeping` | 80 | `SMOKEPING_PORT` | |
| Sonarr | `sonarr` | 8989 | `SONARR_PORT` | |
| Speedtest Tracker | `speedtest-tracker` | 80 | `SPEEDTEST_TRACKER_PORT` | |
| Stirling PDF | `stirling-pdf` | 8080 | `STIRLINGPDF_PORT` | |
| Supabase | `supabase-kong` | 8000 | `SUPABASE_PORT` | See the note below the table |
| Tautulli | `tautulli` | 8181 | `TAUTULLI_PORT` | |
| Termix | `termix` | 8080 | `TERMIX_PORT` | |
| The Lounge | `thelounge` | 9000 | `THELOUNGE_PORT` | |
| Theme Park | `theme-park` | 80 | `THEMEPARK_PORT` | |
| Transmission | `transmission` | 9091 | `TRANSMISSION_PORT` | 51413 (TCP and UDP) |
| Traefik | `traefik` | 8080 (dashboard) | `TRAEFIK_PORT` | 80, 81, 443 and 444 (443 and 444 also UDP) |
| Trilium | `trilium` | 8080 | `TRILIUM_PORT` | |
| Uptime-Kuma | `uptime-kuma` | 3001 | `UPTIMEKUMA_PORT` | |
| Vaultwarden | `vaultwarden` | 80 | `VAULTWARDEN_PORT` | |
| Vikunja | `vikunja` | 3456 | `VIKUNJA_PORT` | |
| Viniplay | `viniplay` | 8998 | `VINIPLAY_PORT` | |
| VS Code | `vscode` | 8443 | `VSCODE_PORT` | |
| Wallos | `wallos` | 80 | `WALLOS_PORT` | |
| Weaviate | `weaviate` | 8080 | `WEAVIATE_PORT` | 50051 |
| WG-Easy | `wg-easy` | 51821 | `WGEASY_PORT` | 51820 (UDP, the VPN port) |
| What's Up Docker | `wud` | 3000 | `WUD_PORT` | |
| Wikidocs | `wikidocs` | 80 | `WIKIDOCS_PORT` | |
| XPipe Webtop | `xpipe-webtop` | 3000 | `XPIPEWEBTOP_PORT` | |

Notes:

- **Extra ports** are not the web page. Pi-hole port 53 can clash with a service already on your server. See [Pi-hole will not start because port 53 is already in use](/apps/pi-hole-port-53-conflict/).
- **Supabase** has many containers. The web page and API go through `supabase-kong` on port 8000. `supabase-kong` also publishes 8443 (`SUPABASE_KONG_HTTPS_PORT`). The separate `supabase-pooler` container publishes 5432 (`SUPABASE_POOLER_PORT`) and 6543 (`SUPABASE_POOLER_PROXY_PORT`). Port 5432 is also the default of the PostgreSQL app, so check for a clash if you run both.
- **Dockpeek, Dockwatch and What's Up Docker** are only on the `socket_proxy` network, not on `default`. Other apps can't reach them by container name. Use your server IP and the host port instead.
- **Nginx Proxy Manager** admin page is port 81. **Traefik** dashboard is port 8080.

## Apps on the host network

These apps use the host network. They have no container name on the Docker network. From another app or device, use your server's IP address and the port the app listens on.

| App | Port it listens on | .env port variable |
| --- | --- | --- |
| GPTWOL | 5000 by default | `GPTWOL_PORT` |
| Homebridge | 8581 | `HOMEBRIDGE_PORT` |
| Netdata | 19999 | `NETDATA_PORT` |
| Sshwifty | 9182 by default | `SSHWIFTY_PORT` |
| Cloudflare Tunnel | No web page | None |
| Tailscale | No web page | None |
| ZeroTier | No web page | None |

Homebridge and Netdata always listen on 8581 and 19999. Deployrr asks for `HOMEBRIDGE_PORT` and `NETDATA_PORT` at install, but changing them does not move the app to another port.

## qBittorrent VPN and Gluetun

The `qbittorrent-vpn` container shares the network of the `gluetun` container. It has no network or `ports` section of its own. When you install qBittorrent VPN, Deployrr adds a port to the Gluetun file: `QBITTORRENTVPN_PORT` (8082 by default) on your server, 8080 inside.

- In your browser, use `http://YOUR_SERVER_IP:QBITTORRENTVPN_PORT`.
- From other containers, use `gluetun:8080`.

See [Connect your apps to each other](/using-deployrr/connecting-apps/#apps-that-run-through-gluetun). To set it up, see [Install qBittorrent VPN](/apps/qbittorrent-vpn/).

## Apps with no web page

These containers have no web page and publish no port. Gluetun publishes no port until you install qBittorrent VPN.

- **Gluetun**, **Kometa**, **DeUnhealth**, **Docker Garbage Collection** and **Socket Proxy** run in the background.
- **Traefik Access Log for Dozzle**, **Traefik Error Log for Dozzle** and **Traefik Certs Dumper** support Traefik.
- **Authelia** (`authelia`), **Authentik** (`authentik`), **TinyAuth** (`tinyauth`) and **Google OAuth** (`oauth`) are login pages. You reach them through Traefik at the address you chose.

## Helper containers

Some apps start extra containers for their database or cache. You see them in the `docker ps` list (with the Deployrr bash aliases: `dps`). Apart from `supabase-pooler` (see the Supabase note above), they publish no port. Other containers reach them on the `default` network.

| App | Helper containers |
| --- | --- |
| Authelia | `authelia-redis` |
| Authentik | `authentik-postgresql`, `authentik-worker` |
| Autobrr | `autobrr-postgresql` |
| Bookstack | `bookstack-mariadb` |
| Dockhand | `dockhand-postgresql` |
| Flowise | `flowise-postgresql`, `flowise-redis` |
| GameVault | `gamevault-postgresql` |
| Guacamole | `guacamole-mariadb`, `guacd` |
| Immich | `immich-machine-learning`, `immich-postgresql`, `immich-redis` |
| Langfuse | `langfuse-clickhouse`, `langfuse-minio`, `langfuse-postgresql`, `langfuse-redis`, `langfuse-worker` |
| n8n | `n8n-postgresql` |
| Nextcloud | `nextcloud-mariadb`, `nextcloud-redis` |
| Paperless-NGX | `paperless-ngx-mariadb`, `paperless-ngx-redis`, `gotenberg`, `tika` |
| PdfDing | `pdfding-postgresql` |
| Scrutiny | `scrutiny-influxdb` |
| SearXNG | `searxng-valkey` |
| Speedtest Tracker | `speedtest-tracker-mariadb` |
| Supabase | `supabase` (Studio), `supabase-analytics`, `supabase-auth`, `supabase-db`, `supabase-edge-functions`, `supabase-imgproxy`, `supabase-meta`, `supabase-pooler`, `realtime-dev.supabase-realtime`, `supabase-rest`, `supabase-storage`, `supabase-vector` |
| Vikunja | `vikunja-mariadb` |

## Folders inside the containers

Apps see your folders under different paths than on the server. Use the path in the right column when an app asks you to pick a folder.

Every app keeps its settings in `appdata/APP_NAME` inside your Docker folder. Most apps mount it at `/config`. To check an app, look at the `volumes` section of its file. See [Docker folder layout](/using-deployrr/docker-folder-layout/).

| Folder on your server | Path in the container | Apps |
| --- | --- | --- |
| Downloads folder | `/data/downloads` | Sonarr, Radarr, Lidarr, Prowlarr, Jackett, qBittorrent, qBittorrent VPN, SABnzbd, NZBGet, Mylar3, Plex, Jellyfin, Emby |
| Media Folders 1 to 3 | `/data/media1`, `/data/media2`, `/data/media3` | Sonarr, Radarr, Lidarr, Bazarr, Plex, Jellyfin, Emby, Navidrome, Gonic, Funkwhale, Airsonic-Advanced, Lollypop, Beets, Cloud Commander, Double Commander |
| RAM (`/dev/shm`), for transcoding | `/data/transcode` | Plex, Jellyfin, Emby |
| Books folder | `/data/books` | Calibre, Calibre-Web, Kavita, Komga |
| Comics folder | `/data/comics` | Komga |
| Photos folder | `/data/photos` | DigiKam, Piwigo |
| Audiobooks folder | `/audiobooks` | Audiobookshelf |
| Podcasts folder | `/podcasts` | Audiobookshelf |
| Your home folder | `/data/YOUR_USERNAME` | Cloud Commander, Double Commander, VS Code |

`YOUR_USERNAME` is your own Linux user name. The home folder is `/home/YOUR_USERNAME` on the server.

Some apps differ:

- **Transmission** mounts `Downloads/torrents` at `/data/downloads`. It mounts the whole Downloads folder at `/data/watch`.
- **Beets** and **Resilio Sync** mount the Downloads folder at `/downloads`.
- **Mylar3** mounts the Comics folder at `/comics`.
- **Calibre** has the comics line in its file, but switched off.

:::note
In the files, the Media Folders lines start with `#`. Deployrr switches them on when you install the app, only for the folders you have set by then. A folder you set later is not added to apps already installed. If an app shows an empty library, see [Media app shows an empty library or no folders](/apps/media-library-empty/). To set the folders, see [Set your media, downloads and other folders](/storage/folders/).
:::

## Which apps have a health check

A health check lets Docker mark a container `healthy` or `unhealthy`. [DeUnhealth](/apps/deunhealth/) restarts a container that is `unhealthy`. It can only act on containers that have a check. To see how a health check and DeUnhealth work together, watch [DeUnhealth guide: health check on qBittorrent at 2:51](https://youtu.be/oY1U_Htes9A?t=171) (manual Docker Compose setup).

These apps have a health check:

Cleanuparr, Cloudflare Tunnel, Dashy, Dozzle Agent, Flowise, Immich, MariaDB, Paperless-NGX, PostgreSQL, Pulse, qBittorrent VPN, Redis, Authentik and Nginx Proxy Manager.

Most helper database and cache containers have one too, for example `n8n-postgresql`, `nextcloud-mariadb`, `immich-postgresql` and `authelia-redis`. `langfuse-worker`, `gotenberg`, `tika`, `guacd` and `authentik-worker` have none.

Every other app has no health check. Its status never shows `unhealthy`, so the DeUnhealth label does nothing there.

To check one container, run this. Replace `CONTAINER` with its container name.

```bash
sudo docker inspect --format '{{json .State.Health}}' CONTAINER
```

If the output is `null`, the container has no health check. Otherwise the output shows its status (`healthy`, `unhealthy` or `starting`) and the last checks.

## Check your own files

The tables show what Deployrr sets up by default. Your own files can differ.

- **Container name, ports, folders and health check:** open `compose/HOSTNAME/APP.yml` inside your Docker folder. Replace `HOSTNAME` with your server's host name and `APP` with the app. Look for `container_name`, `ports`, `volumes` and `healthcheck`.
- **Ports you picked:** they are in your `.env` file. See [Edit .env values and secrets](/using-deployrr/edit-env-and-secrets/).
- **A second copy of an app:** it has its own container name and its own port. See [Run a second copy of an app](/using-deployrr/second-app-instances/).
