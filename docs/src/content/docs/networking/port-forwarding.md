---
title: Forward the right router ports for Deployrr
sidebar:
  order: 2
  label: Port forwarding
description: Find out which router ports Deployrr needs for Traefik Simple, Traefik Advanced or Nginx Proxy Manager, set them on your router, and test them.
type: how-to
tags:
  - ports
  - remote-access
  - traefik
  - domain
applies_to: v6.0+
apps:
  - traefik
  - npm
related:
  - getting-started/domain-checks-failed
  - reverse-proxy/simple-vs-advanced-mode
  - host/fixed-ip
  - networking/cg-nat
  - networking/local-dns-rewrites
further_reading:
  - title: "UDMS part 18: Setting up port forwarding"
    url: "https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Setting_Up_Port_Forwarding"
  - title: "UDMS part 18: CG-NAT"
    url: "https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#CG-NAT"
videos:
  - id: rdqbAr0TFnQ
    start: 2298
    title: "Deployrr 5 walkthrough: Port forwarding on the router"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: KMZIyoZ3jWM
    start: 1122
    title: "Traefik 3 guide: Forwarding ports 80 and 443 on the router"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
  - id: Nuo83uzTWco
    start: 277
    title: "Deployrr 6 overview: Options for CG-NAT"
last_reviewed: 2026-11-12
status: current
old_paths: []
sources: []
---

A port forward tells your router to send traffic from the internet to your Docker host. In Hybrid mode, Traefik or Nginx Proxy Manager needs two of them. This page shows which ports to forward, how to set them, and how to test them.

## Before you start

You only need port forwarding in **Hybrid** Setup Mode with a reverse proxy at home. Skip this page if:

- You use **Local** mode. Your apps are for your home network only. See [Setup Mode: Local or Hybrid](/getting-started/setup-mode/).
- You reach your apps with Tailscale. It needs no open ports. See [Set up Tailscale](/networking/tailscale/).
- Deployrr runs on a VPS. It has a public IP and no home router. If a firewall blocks the ports, see [Fix the UFW firewall on a VPS](/networking/ufw-firewall-vps/).

You also need:

- Hybrid mode with a reverse proxy picked. See [Set up Traefik](/reverse-proxy/traefik-setup/) or [Use Nginx Proxy Manager instead of Traefik](/reverse-proxy/nginx-proxy-manager/).
- Access to your router's admin page.
- To know your Traefik mode if you use Traefik. In Deployrr, open **Proxy** > **Traefik** and read the **Traefik Mode** line. It shows `NOT SET` until you select **Traefik Mode** once. The first time, you get Simple mode.

:::caution
Changing port forwards can cut off access to your apps. Before you change anything, write down every existing rule on your router. If you lose access, put the old rules back.
:::

## What to forward

Forward these ports, as TCP, to the LAN IP address of your Docker host.

| Reverse proxy | Forward router port 80 to | Forward router port 443 to |
| --- | --- | --- |
| Traefik, Simple mode | 80 | 443 |
| Traefik, Advanced mode | 81 | 444 |
| Nginx Proxy Manager | 80 | 443 |

The first number is the port on your router, the one the internet connects to. The second is the port on your Docker host. Some routers call them "external" and "internal" port.

Don't forward the Nginx Proxy Manager admin port. Deployrr suggests 81 for it at install, and you can pick another. You open the admin panel from your home network, so only 80 and 443 need a forward.

Your Docker host's LAN IP should not change. If your router hands out a new address later, the forwards point at the wrong machine. See [Give your server a fixed IP address](/host/fixed-ip/).

For what Simple and Advanced mode mean, see [Simple vs Advanced Traefik mode](/reverse-proxy/simple-vs-advanced-mode/).

## Steps

Router menus differ by brand. The names below are common ones. Check your router's manual if yours look different.

1. On the Docker host, find its LAN IP:

   ```bash
   ip -br addr
   ```

   Look for the line with your LAN address, for example `192.168.1.50/24`. Skip the `lo`, `docker0` and `br-` lines.

2. Log in to your router's admin page.
3. Write down the existing port forwarding rules.
4. Find the port forwarding page. It may be called **Port Forwarding**, **Virtual Server**, **NAT** or **Applications**.
5. Add a rule for port 80. Use TCP. Set the destination IP to your Docker host's LAN IP. Set the destination port from the table above.
6. Add a rule for port 443 the same way.
7. Save the rules. Some routers need a restart to apply them.

To see a router port forward set up, watch [Deployrr 5 walkthrough: Port forwarding at 38:18](https://youtu.be/rdqbAr0TFnQ?t=2298) (shows Deployrr v5; menus differ in v6, and it forwards 80 to 81 and 443 to 444 as in Advanced mode). For the same idea in a manual setup, watch [Traefik 3 guide: forwarding ports 80 and 443 at 18:42](https://youtu.be/KMZIyoZ3jWM?t=1122) (manual Docker Compose setup). For a written guide, see [UDMS part 18: Setting up port forwarding](https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Setting_Up_Port_Forwarding) (manual setup).

:::note
Forward only 80 and 443. Don't forward app ports such as 8989 to your server. Let Traefik or Nginx Proxy Manager be the way in from the internet, so your apps get HTTPS and a login from one place.
:::

Don't use a DMZ or UPnP for this. A DMZ exposes your whole server to the internet. UPnP lets devices open ports on their own. Use fixed rules for 80 and 443 only.

## Check it worked

### Check with Domain Checks

Use this before you install Traefik.

1. In Deployrr, open **Prerequisites**.
2. Select **Domain Checks**.
3. Read the first lines. The port 80 line shows one of these:

   ```txt
   Port 80 resolves to 80
   Port 80 resolves to 81
   ```

   The port 443 line shows one of these:

   ```txt
   Port 443 resolves to 443
   Port 443 resolves to 444
   ```

What the lines tell you:

- `80` and `443` mean your forwards match Simple mode or Nginx Proxy Manager.
- `81` and `444` mean your forwards match Advanced mode.

Each port is checked on its own, and Domain Checks doesn't compare the result with your Traefik mode. A mixed result such as `Port 80 resolves to 80` with `Port 443 resolves to 444` also passes. Make sure both lines show the pair you want for your mode.

A green line here doesn't always prove the forward reaches your server. When the test from the internet is refused, Domain Checks also shows `Port 80 resolves to 80` (or `Port 443 resolves to 443`). Do the [check from outside](#check-from-outside) too once your reverse proxy is running.

If you see an error instead, see [Domain Checks failed](/getting-started/domain-checks-failed/#fix-ports-80-and-443).

:::caution
Run **Domain Checks** before Traefik or Nginx Proxy Manager is installed. Once one of them is running, a rerun fails at port 80 with `Port 80 is reachable but something is already listening on it`. See [Rerunning Domain Checks after Traefik is running](/getting-started/domain-checks-failed/#rerunning-domain-checks-after-traefik-is-running).
:::

### Check from outside

Do this after Traefik or Nginx Proxy Manager is up and you have an app with an address.

1. Turn off Wi-Fi on your phone, so it uses mobile data.
2. Open `https://app.YOUR_DOMAIN` in the phone's browser. Replace `app` with your app's subdomain and `YOUR_DOMAIN` with your domain.
3. Check that the app's page or login opens with a padlock.

If an app is set to Internal in Advanced mode, it should not open from mobile data. Test with an External or Both app.

## If it doesn't work

- **The forward points at the wrong IP.** The Docker host may have a new LAN IP. Set the rules to the current address. Then give the host a fixed one. See [Give your server a fixed IP address](/host/fixed-ip/) and [Change the server IP](/host/change-server-ip/).
- **The ports don't match your mode.** Switching between Simple and Advanced later means changing the forwards too. See [Simple vs Advanced Traefik mode](/reverse-proxy/simple-vs-advanced-mode/).
- **Your ISP blocks port 80, or you are behind CG-NAT or double NAT.** Forwards on your router then do nothing. See [Behind CG-NAT](/networking/cg-nat/). For the options in v6, watch [Deployrr 6 overview: Options for CG-NAT at 4:37](https://youtu.be/Nuo83uzTWco?t=277).
- **A firewall on the server blocks the ports.** See [Fix the UFW firewall on a VPS](/networking/ufw-firewall-vps/).
- **Internal apps don't open from home in Advanced mode.** When you switch to Advanced mode, Deployrr's box notes: "If your router, gateway, or firewall is not capable of Hairpinning or you do not have a local DNS with rewrites (e.g. Pi-Hole, AdGuard Home, etc.), local traffic may be treated as external and you may not be able to access internal-only apps using FQDN." See [Set up local DNS rewrites](/networking/local-dns-rewrites/).
- **You use OPNsense.** See [Traefik staging fails with unable to obtain ACME certificate on OPNsense](/networking/opnsense-conflict/).

## Related

- [Domain Checks failed in Prerequisites](/getting-started/domain-checks-failed/): every check, its message and its fix.
- [Simple vs Advanced Traefik mode](/reverse-proxy/simple-vs-advanced-mode/): pick the mode that decides your ports.
- [Give your server a fixed IP address](/host/fixed-ip/): keep the forward's destination from changing.
- [Behind CG-NAT](/networking/cg-nat/): when forwards on your router can't work.
- [Set up local DNS rewrites](/networking/local-dns-rewrites/): open Internal apps from home.
