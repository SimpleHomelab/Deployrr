---
title: Use one domain across several servers
description: Run Deployrr on more than one server and reach every app on subdomains of the same domain, with one Traefik on your main server.
type: guide
tags:
  - traefik
  - domain
  - remote-access
applies_to: v6.0+
apps: [jellyfin]
related:
  - apps/home-assistant-behind-traefik
  - using-deployrr/second-app-instances
  - reverse-proxy/check-traefik-logs
  - reverse-proxy/point-root-domain-to-a-dashboard
  - getting-started/quick-start
further_reading: []
last_reviewed: 2026-11-08
status: current
old_paths: ["/traefik/multi-server-same-domain"]
sources:
  - { type: discord, ref: "https://discord.com/channels/974306760171073556/974314326494171226/1344756299841146984" }
---

You can run Deployrr on several machines and still reach all their apps on one domain, for example `jellyfin.example.com` and `sonarr.example.com`. One server runs Traefik. The others run apps. This guide is for you if you have, say, a storage server and a second server for other apps.

## Overview

You end up with this layout:

| Server | Setup Mode | What it does |
| --- | --- | --- |
| Main server | Hybrid | Runs Traefik, your domain, and your login protection. Your router sends ports 80 and 443 here. |
| Other servers | Local | Run apps. Their apps are open only on your home network. |

The main server's Traefik sends each subdomain to the right machine. You tell it where each app lives with **Traefikify**. The other servers need no domain, no Traefik and no port forwarding.

Your DNS stays as it is. The `*` CNAME record pointing to `@` that Hybrid mode asks for already covers every new subdomain.

## Before you start

- The main server is set up with a domain, Cloudflare and Traefik Production, and Traefik is running. Follow the [Quick start](/getting-started/quick-start/) if it is not.
- You have a Plus or Pro license on the main server. **Traefikify** and Hybrid mode need it. Local mode works with a Basic, Plus or Pro license.
- On the main server, all **Prerequisites** steps are done and the **Socket Proxy** app is running. **Traefikify** needs both. If something is missing, Deployrr shows a **Requirements Not Met** box that lists it.
- The servers can reach each other on your network. A VPN between sites also works.
- If you want login protection on an app, that auth app (for example Authelia) is already running on the main server.

## Set up the main server

1. In Deployrr, open **Prerequisites**. The current mode shows next to **Setup Mode**.
2. If it shows Local, select **Setup Mode**. The setting switches each time you select it. The **Server Setup Mode** box should say `Hybrid mode ENABLED`.
3. Meet the Hybrid requirements listed in the box and in the [Quick start](/getting-started/quick-start/): a domain, Cloudflare DNS with an A record and a `*` CNAME record, Cloudflare SSL mode set to FULL, and ports 80 and 443 forwarded to this server.
4. Go to **Proxy** > **Proxy Type** and pick Traefik. Switching a server to Local mode clears this choice, so check it if the server was in Local mode before.
5. Set up Traefik with **Proxy** > **Traefik** > **Production** and make sure Traefik is running.

:::caution
Keep the main Traefik on your most reliable server. If this server is off, every app on every server is unreachable from your domain.
:::

## Set up each other server

1. Install Deployrr on the server.
2. Open **Prerequisites** and check the mode next to **Setup Mode**. If it shows Hybrid, select **Setup Mode** once. The box should say `Local mode ENABLED`. In Local mode, apps are open on the internal network only. No reverse proxy, domain name or port forwarding is needed.
3. Install your apps as usual.
4. Open each app in a browser on your network, at `http://SERVER_IP:PORT`. Write down the IP address and the port. You need both next.

## Add each app to the main server's Traefik

Do this on the main server, once for each app on another server.

1. In Deployrr, go to **Proxy** > **Traefik** > **Traefikify**.
2. Read the **Traefikify** box and confirm that you want to proceed.
3. Answer the prompts:
   - `Enter a name for the App.`: a lowercase name, for example `jellyfin`
   - `Enter a subdomain for the App.`: the default is the name without hyphens
   - `Host IP Address of the App.`: the IP address of the other server, not the main server
   - `WebUI protocol (http/https) of the App:`: `http` for most apps. Type exactly `http` or `https`.
   - `WebUI port number of the App:`: the port you wrote down
4. At **Pick an Authentication Method**, pick the method you want. Authelia, Authentik, Google OAuth and TinyAuth only show up if they are running on the main server. Basic HTTP Auth and No Authentication are always there. **Skip** means no authentication. [Choose a login method](/reverse-proxy/choose-login-method/) helps you pick.
5. At **Pick an Exposure Method**, pick how you reach the app. In Simple Traefik mode, the only choice is **Both** (internal and external). Advanced mode, under **Proxy** > **Traefik** > **Traefik Mode**, adds **Internal** and **External**. Advanced mode also needs your router to forward ports 80 and 443 to ports 81 and 444 on the main server.
6. If the Deployrr Dashboard is running, Deployrr asks if you want to add the app to it. Say yes to see the app in the Dashboard's **Apps (Remote)** section. See [Set up and maintain the Deployrr Dashboard](/using-deployrr/dashboard/).

Deployrr creates a file named `app-NAME.yml` in `appdata/traefik3/rules/HOSTNAME/` inside your Docker folder. `NAME` is the app name and `HOSTNAME` is the main server's hostname. Traefik picks up the new file on its own, so you don't need to restart it.

If you see `Connection to http://192.168.1.20:8096 could not be verified`, setup still continues. Your IP address and port will differ. Check the IP address and the port, and see the limits below.

If you made a mistake, run **Traefikify** again with the same name. Deployrr asks if you want to overwrite the file. You can also remove the app with **Un-Traefikify** in the same menu.

## Example: Jellyfin on a second server

Your main server runs Traefik for `example.com`. A second server at `192.168.1.20` is in Local mode and runs Jellyfin.

1. On the second server, open `http://192.168.1.20:8096`. Jellyfin loads. Use the port that your Jellyfin uses if it differs from 8096.
2. On the main server, go to **Proxy** > **Traefik** > **Traefikify** and confirm.
3. Enter these values:
   - Name: `jellyfin`
   - Subdomain: `jellyfin`
   - Host IP address: `192.168.1.20`
   - Protocol: `http`
   - Port: `8096`
4. Pick an authentication method and an exposure method.
5. Open `https://jellyfin.example.com`.

Replace `example.com` and `192.168.1.20` with your own domain and IP address.

If the Jellyfin app on an LG TV or Xbox then shows error -27, see [Jellyfin app on LG webOS TV or Xbox shows error -27](/apps/jellyfin-client-on-lg-webos/).

## Check it worked

1. Open `https://SUBDOMAIN.YOUR_DOMAIN` in a browser. Replace the placeholders with your subdomain and domain.
2. You should see the app, or your login page if you picked an auth method.
3. Turn off Wi-Fi on your phone and open the same address. This tests access from outside your network. Skip this step if you chose **Internal**.

If the page does not load, [read the Traefik logs](/reverse-proxy/check-traefik-logs/) on the main server.

## Limits

- The main server is a single point of failure. If it is down, no app is reachable by its domain name. Apps on other servers still work at their local `IP:PORT` address.
- The main server must reach each other server. A VPN, a different network or a different site all work if the main server can open the app's IP address and port.
- The app's port must be open to the main server. If a firewall runs on the other server, allow the app's port from the main server's IP address.
- Give each other server a fixed IP address, or a DHCP reservation on your router. The IP address is saved in the app's file. If the address changes, the app stops loading until you fix it.

## If the other server runs its own Traefik

Your router can send ports 80 and 443 to one machine only. If another server runs its own Traefik for a different domain, use **Domain Passthrough** on the main server instead of **Traefikify**. It is in **Proxy** > **Traefik**, with the description "To Another Traefik Instance". Deployrr asks for a name for the host, the other server's IP address and the domain to pass through. All requests for that domain and its subdomains then go to the other server. This has the same requirements as **Traefikify**, including a Plus or Pro license.

## Next steps

- Put a Home Assistant that runs elsewhere behind Traefik: [Home Assistant behind Traefik](/apps/home-assistant-behind-traefik/).
- Add more apps and link them: [Connect your apps to each other](/using-deployrr/connecting-apps/).

## Related

- [Home Assistant behind Traefik](/apps/home-assistant-behind-traefik/): a worked Traefikify example for an app on another machine.
- [Run a second copy of an app](/using-deployrr/second-app-instances/): the Traefikify prompts and the rules file in more detail.
- [Read the Traefik logs](/reverse-proxy/check-traefik-logs/): find out why a subdomain does not load.
- [Open a dashboard at your root domain](/reverse-proxy/point-root-domain-to-a-dashboard/): change the address in a rules file.
- [Quick start](/getting-started/quick-start/): set up Hybrid mode and Traefik.
