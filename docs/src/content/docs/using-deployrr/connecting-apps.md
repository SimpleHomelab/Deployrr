---
title: Connect your apps to each other
description: Find the host name and port to type when one app needs to reach another, connect Prowlarr to Sonarr, Radarr and Lidarr, and point Sonarr at qBittorrent.
type: how-to
tags:
  - app-networking
  - docker
  - media
applies_to: v6.0+
apps: [sonarr, radarr, lidarr, prowlarr, qbittorrent, qbittorrent-vpn, gluetun, sabnzbd, plex]
related:
  - using-deployrr/second-app-instances
  - using-deployrr/custom-yml
  - using-deployrr/bash-aliases
  - docker/no-internet-in-containers
  - apps/qbittorrent-webui-troubleshooting
videos:
  - id: arew_OGQYyw
    start: 1635
    title: "Gluetun VPN kill switch for qBittorrent: accessing qBittorrent from other services"
    note: "Manual Docker Compose setup. The video puts Gluetun and Radarr on a network called t3_proxy, not the default network of Deployrr v6, and it uses port 8081 on the host. The rule is the same: use the container name and the internal port 8080."
  - id: arew_OGQYyw
    start: 852
    title: "Gluetun VPN kill switch for qBittorrent: network_mode service gluetun"
    note: "Manual Docker Compose setup. It edits the qBittorrent file by hand and uses Docker labels and a t3_proxy network. Use it to understand what network_mode: service:gluetun means, not as steps to follow in Deployrr v6."
further_reading:
  - title: "UDMS part 14: connecting apps by container name or Docker host IP"
    url: https://www.simplehomelab.com/udms-14-docker-media-server/#Connecting_the_Apps
last_reviewed: 2026-11-13
status: current
old_paths: ["/networking/connecting-applications-together"]
sources: []
sidebar:
  order: 8
---

Apps like Sonarr, Radarr and Prowlarr ask you for a host name and a port when you add a download client, an indexer or another app. This page tells you what to type.

## Before you start

- Both apps are installed with Deployrr and running. See the [Quick start](/getting-started/quick-start/).
- You can open the web page of the app where you enter the connection. For example, Prowlarr, if you want to add Sonarr to it.

## The short answer

Use the container name of the other app and its internal port, joined with a colon:

```text
container-name:internal-port
```

This works when both apps are on the same Docker network. Most apps installed with Deployrr are on the `default` network, so this is the normal case. The same rule applies to the **Forward Hostname / IP** box in [Nginx Proxy Manager](/reverse-proxy/nginx-proxy-manager/).

Do not type `localhost` or `127.0.0.1`. Inside a container, those point to the container itself and not to the other app.

To understand how container names and the Docker host IP work together, read [UDMS part 14: connecting apps by container name or Docker host IP](https://www.simplehomelab.com/udms-14-docker-media-server/#Connecting_the_Apps) (manual setup; it builds its own Compose file, not the Deployrr files).

## Steps

1. Look up the container name and internal port of the app you want to reach. Use the table below for the common media apps, or the [App reference](/apps/app-reference/) for every app.

   | App | Enter this | Container name | Internal port |
   | --- | --- | --- | --- |
   | Radarr | `radarr:7878` | `radarr` | `7878` |
   | Sonarr | `sonarr:8989` | `sonarr` | `8989` |
   | Lidarr | `lidarr:8686` | `lidarr` | `8686` |
   | Bazarr | `bazarr:6767` | `bazarr` | `6767` |
   | Prowlarr | `prowlarr:9696` | `prowlarr` | `9696` |
   | qBittorrent | `qbittorrent:8080` | `qbittorrent` | `8080` |
   | SABnzbd | `sabnzbd:8080` | `sabnzbd` | `8080` |
   | Plex | `plex:32400` | `plex` | `32400` |

2. Open the web page of the app that needs the connection.

3. Enter the container name as the host and the internal port as the port.

4. Turn SSL or HTTPS off.

5. Use the **Test** button, then save.

### Example: Prowlarr to Sonarr, Radarr and Lidarr

Prowlarr keeps your indexers in one place and sends them to Sonarr, Radarr and Lidarr. You add each of those apps to Prowlarr once.

1. In Sonarr, go to **Settings** > **General** and copy the **API Key** from the **Security** section.
2. In Prowlarr, go to **Settings** > **Apps** and click **+**. Pick **Sonarr**.
3. Fill in the form:
   - **Sync Level**: **Full Sync** keeps Sonarr's indexers the same as Prowlarr's, and overwrites changes you make to them in Sonarr. **Add and Remove Only** adds and removes indexers when you add or remove them in Prowlarr, and doesn't sync other changes.
   - **Prowlarr Server**: `http://prowlarr:9696`. This is the address Sonarr uses to reach Prowlarr, so use the container name, not `localhost`.
   - **Application Server**: `http://sonarr:8989`
   - **API Key**: the key you copied in step 1.
4. Click **Test**, then **Save**. Prowlarr sends its indexers to Sonarr when you save.
5. Repeat for Radarr (`http://radarr:7878`) and Lidarr (`http://lidarr:8686`), with each app's own API key.

In Sonarr, Radarr or Lidarr, check **Settings** > **Indexers**. The indexers from Prowlarr have `(Prowlarr)` at the end of their name. Prowlarr only sends an indexer to an app if the indexer has categories for it. For example, a TV-only indexer doesn't show up in Radarr or Lidarr.

If you added indexers by hand in Sonarr before, you now have each one twice. Turn off the old entries without `(Prowlarr)` first, then delete them once searches work.

To send the indexers again after a change, click **Sync App Indexers** on Prowlarr's **Settings** > **Apps** page.

### Example: Sonarr to qBittorrent

In Sonarr, add qBittorrent as a download client. Use these values:

- **Host**: `qbittorrent`
- **Port**: `8080`

The port is `8080`, not the port you use in your browser. SABnzbd also uses `8080` inside its container. The host name tells them apart.

## Read the ports in your own files

Each app's Compose file shows both ports. The files are in the `compose/HOSTNAME` folder inside your Docker folder, where `HOSTNAME` is your server's hostname. Open the file, for example `compose/HOSTNAME/sonarr.yml`, and find the `ports` section:

```yaml
    container_name: sonarr
    networks:
      - default
    ports:
      - "$SONARR_PORT:8989"
```

- `container_name` is the host name to use.
- The number on the right of the colon (`8989`) is the internal port. Use it when connecting apps on the `default` network.
- The number on the left (`$SONARR_PORT`) is the host port. Deployrr asks for it when you install the app and saves it in your `.env` file. You use it in your browser.

`networks: - default` tells you the app is on the shared network. If you see it in both apps, use the container name and internal port.

You may also see `socket_proxy` or `traefik_proxy` in some files. `socket_proxy` is the network apps use to reach Docker through the Socket Proxy, and `traefik_proxy` is for Traefik and its helper apps. They don't matter when you connect apps like Sonarr and qBittorrent. A few apps are only on `socket_proxy`, which changes how you reach them. See [Apps only on the socket_proxy network](#apps-only-on-the-socket_proxy-network).

## When an app is not on the default network

Some apps do not use the container name method.

### Apps that use host networking

Some apps have `network_mode: host` in their file. Examples include Homebridge, [Tailscale](/networking/tailscale/), ZeroTier, Netdata, Sshwifty and Cloudflare Tunnel. They have no container name on the Docker network.

To connect to one of them from another app, use the IP address of your server and the port the app listens on.

### Apps only on the socket_proxy network

What's Up Docker, Dockpeek and Dockwatch have only `socket_proxy` under `networks`, not `default`. An app on the `default` network can't reach them by container name. For example, `wud:3000` fails from Nginx Proxy Manager or from a dashboard that is only on `default`. Docker GC and Deunhealth are also only on `socket_proxy`, but they have no web page to connect to.

To reach one of them, use the IP address of your server and its host port, for example `WUD_PORT`, `DOCKPEEK_PORT` or `DOCKWATCH_PORT` from your `.env` file. See [Use the server IP and host port instead](#use-the-server-ip-and-host-port-instead).

Apps that list both `default` and `socket_proxy`, such as Homepage, Homarr and Uptime Kuma, can still use the container name and internal port. Look up the internal ports in the [App reference](/apps/app-reference/).

### Apps that run through Gluetun

The qBittorrent VPN app has `network_mode: "service:gluetun"` in its file. To install it, see [Install qBittorrent VPN](/apps/qbittorrent-vpn/). It shares the network of the Gluetun container. It has no network of its own and no `ports` section.

To connect another app to it, use `gluetun` as the host name and `8080` as the port. Other apps can reach `gluetun` because Gluetun is on the `default` network.

:::caution
After you install qBittorrent VPN, Deployrr shows a message that says to use `gluetun` and your qBittorrent VPN port (8082 by default). That port only works from your browser. From another container, use port `8080`.
:::

To see the `gluetun` host name used from Radarr, watch [Gluetun VPN kill switch for qBittorrent: accessing qBittorrent from other services at 27:15](https://youtu.be/arew_OGQYyw?t=1635) (manual setup; the video uses a network called `t3_proxy`, not `default`, and port 8081 on the host).

When you install qBittorrent VPN, Deployrr turns on a port mapping in the Gluetun file and restarts Gluetun. After that, the qBittorrent web page is at `http://YOUR_SERVER_IP:QBITTORRENTVPN_PORT`. Replace `YOUR_SERVER_IP` with your server's local IP address and `QBITTORRENTVPN_PORT` with the port you picked at install. If that page doesn't open or says `Unauthorized`, see [qBittorrent web UI says Unauthorized or won't open](/apps/qbittorrent-webui-troubleshooting/).

## Use the server IP and host port instead

If the container name method does not work, or the other app is on a different machine, use the IP address of your server and the host port:

```text
YOUR_SERVER_IP:HOST_PORT
```

Replace `YOUR_SERVER_IP` with the local IP address of your server. Replace `HOST_PORT` with the port you use in your browser. You can find it in your `.env` file, for example `SONARR_PORT`.

## What to avoid

:::caution
Do not use your domain names, for example `sonarr.YOUR_DOMAIN`, to connect apps. That traffic goes through Traefik and your login protection, and the connection can fail.
:::

:::caution
Do not use container IP addresses, even though the `dips` alias shows them. A container can get a new IP address each time it restarts, and the connection then breaks. See [Bash aliases](/using-deployrr/bash-aliases/).
:::

## Check it worked

The **Test** button in the app shows a green check mark or a success message. If it fails, see these points:

- Check the container name and the port for typing mistakes.
- Check that the other app is running. Run `dps` to see all containers. See [Bash aliases](/using-deployrr/bash-aliases/).
- If you added a second copy of an app, it has its own container name. See [Run a second copy of an app](/using-deployrr/second-app-instances/).
- If you added a container yourself, check that it has `networks: - default` in its service. See [Add your own containers with custom.yml](/using-deployrr/custom-yml/).

### If the test says "Connection refused"

"Connection refused" means the name was found, but nothing answered on that port. Check these, most common first:

- **Wrong port.** With a container name, use the internal port (the number on the right in `ports`), not the host port from `.env`. With the server IP, it's the other way round: use the host port.
- **The app is still starting.** Wait a minute after a start or update, then test again. Run `dlogs APP`, with `APP` replaced by the container name, to see when it is ready. Press Ctrl+C to stop following the log.
- **You used a domain name.** `sonarr.YOUR_DOMAIN` goes through your reverse proxy and its login. Use the container name instead. See [What to avoid](#what-to-avoid).
- **The apps are on different networks.** Compare the `networks` lines of both apps' Compose files. If they share no network, use the server IP and host port.

If the test says the host can't be found or resolved instead, the container name is wrong, the app is not running, or the two apps share no network.

## Related

- [Run a second copy of an app](/using-deployrr/second-app-instances/): a second copy gets its own container name and port.
- [Add your own containers with custom.yml](/using-deployrr/custom-yml/): put your own containers on the same network.
- [Bash aliases](/using-deployrr/bash-aliases/): `dps` shows running containers.
