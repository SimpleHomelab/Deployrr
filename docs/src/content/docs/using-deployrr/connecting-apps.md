---
title: Connect your apps to each other
description: Find the host name and port to type when one app needs to reach another, such as Prowlarr to Sonarr or Sonarr to qBittorrent.
type: how-to
tags:
  - app-networking
  - docker
  - media
applies_to: v6.0+
apps: [sonarr, radarr, prowlarr, qbittorrent, qbittorrent-vpn, gluetun, sabnzbd, plex]
related:
  - using-deployrr/second-app-instances
  - using-deployrr/custom-yml
  - using-deployrr/bash-aliases
  - docker/no-internet-in-containers
  - apps/qbittorrent-webui-troubleshooting
further_reading: []
last_reviewed: 2026-11-08
status: current
old_paths: ["/networking/connecting-applications-together"]
sources: []
sidebar:
  order: 6
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

This works when both apps are on the same Docker network. Most apps installed with Deployrr are on the `default` network, so this is the normal case.

Do not type `localhost` or `127.0.0.1`. Inside a container, those point to the container itself and not to the other app.

## Steps

1. Look up the container name and internal port of the app you want to reach. Use the table below.

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

### Example: Prowlarr to Sonarr

In Prowlarr, add Sonarr as an app. Use these values:

- **Prowlarr Server**: `http://prowlarr:9696`
- **Sonarr Server**: `http://sonarr:8989`

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

You may also see `socket_proxy` or `traefik_proxy` in some files. Those are separate networks for Traefik and related apps. They don't matter when you connect apps like Sonarr and qBittorrent.

## When an app is not on the default network

Some apps do not use the container name method.

### Apps that use host networking

Some apps have `network_mode: host` in their file. Examples include Homebridge, Tailscale, ZeroTier, Netdata, Sshwifty and Cloudflare Tunnel. They have no container name on the Docker network.

To connect to one of them from another app, use the IP address of your server and the port the app listens on.

### Apps that run through Gluetun

The qBittorrent VPN app has `network_mode: "service:gluetun"` in its file. It shares the network of the Gluetun container. It has no network of its own and no `ports` section.

To connect another app to it, use `gluetun` as the host name and `8080` as the port. Other apps can reach `gluetun` because Gluetun is on the `default` network.

:::caution
After you install qBittorrent VPN, Deployrr shows a message that says to use `gluetun` and your qBittorrent VPN port (8082 by default). That port only works from your browser. From another container, use port `8080`.
:::

When you install qBittorrent VPN, Deployrr turns on a port mapping in the Gluetun file and restarts Gluetun. After that, the qBittorrent web page is at `http://YOUR_SERVER_IP:QBITTORRENTVPN_PORT`. Replace `YOUR_SERVER_IP` with your server's local IP address and `QBITTORRENTVPN_PORT` with the port you picked at install.

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

## Related

- [Run a second copy of an app](/using-deployrr/second-app-instances/): a second copy gets its own container name and port.
- [Add your own containers with custom.yml](/using-deployrr/custom-yml/): put your own containers on the same network.
- [Bash aliases](/using-deployrr/bash-aliases/): `dps` shows running containers.
