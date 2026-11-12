---
title: "Behind CG-NAT: your apps can't be reached from the internet"
sidebar:
  order: 4
  label: Behind CG-NAT
description: "Find out if your ISP uses CG-NAT, then pick a fix: ask for a public IP, use Local mode with Tailscale, or run Deployrr on a VPS."
type: troubleshooting
tags:
  - remote-access
  - ports
  - domain
applies_to: v6.0+
symptoms:
  - "Port 80 is not reachable from the internet"
  - "Port 443 is not reachable from the internet"
  - "You are not behind ISP CG-NAT - Carrier-grade NATs use a shared IP."
  - Router port forwards for 80 and 443 are set but nothing reaches your server
  - Router WAN IP starts with 100.64 to 100.127
  - Router WAN IP is different from the IP a "what is my IP" site shows
  - Apps open at home but not from mobile data
related:
  - getting-started/domain-checks-failed
  - apps/ddns-updater
  - networking/tailscale
  - getting-started/setup-mode
  - networking/ufw-firewall-vps
further_reading:
  - title: "UDMS part 18: CG-NAT"
    url: "https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#CG-NAT"
  - title: "UDMS part 16: Tailscale for remote homelab access"
    url: "https://www.simplehomelab.com/udms-part-16-tailscale-homelab-remote-access/"
videos:
  - id: Nuo83uzTWco
    start: 277
    title: "Deployrr 6 overview: Options for CG-NAT"
  - id: M6GMp4FJrB8
    start: 38
    title: "Tailscale tutorial: remote access without opening ports"
last_reviewed: 2026-11-12
status: current
old_paths: []
sources: []
---

You forwarded ports 80 and 443 on your router, but your server still can't be reached from the internet. **Domain Checks** may fail on port 80. A likely cause is CG-NAT. This page shows you how to check, and what you can do about it.

Most of this page is general networking guidance, not Deployrr steps. Router menus differ by brand.

## Symptoms

- **Domain Checks** stops at port 80 or port 443 in Hybrid mode:

  ```txt
  Port 80 is not reachable from the internet
  ```

  The list of likely causes on screen includes this line:

  ```txt
  --->4. You are not behind ISP CG-NAT - Carrier-grade NATs use a shared IP.
  ```

- Your port forwards look right, and the server has no firewall in the way, but nothing gets through.
- Your apps open at home but not from mobile data.

## Cause

CG-NAT (carrier-grade NAT) means your ISP shares one public IP address between many customers. Your router gets a private address from the ISP, not a public one. The internet can't reach your router, so a port forward on it does nothing.

Double NAT looks similar. A second router or an ISP modem sits in front of your own router. The port forward on your router is not enough, because the router in front blocks traffic first.

## Fix

### 1. Check if you are behind CG-NAT

1. Log in to your router. Find the WAN or Internet IP address. It is usually on a status page.
2. On the Deployrr server, find the public IP address the internet sees:

   ```bash
   curl -4 https://ifconfig.me
   ```

   You can also use a "what is my IP" website from any device on your network.

3. Compare the two addresses.

| Router WAN address | What it means |
| --- | --- |
| Same as your public IP | No CG-NAT. Go back to [Domain Checks failed](/getting-started/domain-checks-failed/#fix-ports-80-and-443) and check the other causes. |
| Starts with `100.64` to `100.127` (100.64.0.0 to 100.127.255.255) | CG-NAT. |
| Starts with `10.`, `192.168.` or `172.16` to `172.31` | Double NAT. Another router or modem is in front of yours. |
| Different from your public IP, in another range | Treat it like CG-NAT. Ask your ISP. |

Deployrr also prints `Current WAN IP:` with your public IP before check 3. You only see it if the run gets past the port checks. Port 80 usually fails first behind CG-NAT, so use the `curl` command above.

For background, see [UDMS part 18: CG-NAT](https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#CG-NAT) (manual setup). For the options in v6, watch [Deployrr 6 overview: Options for CG-NAT at 4:37](https://youtu.be/Nuo83uzTWco?t=277).

### 2. If you have double NAT

This is general guidance. Pick one:

- Put the device in front of your router into bridge mode, so your router gets the public IP. Your ISP can often tell you how.
- Or forward ports 80 and 443 on both devices. The first device forwards to your router's address. Your router forwards to the Docker host.

Then check again. Your router's WAN address should now match your public IP.

### 3. If you have CG-NAT, pick an option

Choose one.

**Option A: Ask your ISP for a public IPv4 address.**
Ask for a public IP, or to move you off CG-NAT. Some ISPs charge for this, or only offer it on a business plan. With a public IP, your home server works with Hybrid mode as normal. Ask for a public IPv4, not only IPv6.

**Option B: Use Local mode, and reach your apps over Tailscale.**
Local mode serves your apps on your home network only. It needs no domain, no reverse proxy and no port forwarding. See [Setup Mode: Local or Hybrid](/getting-started/setup-mode/). Then add Tailscale to reach the apps from outside. You open them at `http://TAILSCALE-IP:PORT`, with plain `http` and no domain name. See [Set up Tailscale](/networking/tailscale/). To see why Tailscale needs no open ports, watch [Tailscale tutorial: remote access without opening ports at 0:38](https://youtu.be/M6GMp4FJrB8?t=38).

**Option C: Run Deployrr on a VPS.**
A VPS has its own public IP, so there is nothing to forward. See [Fix the UFW firewall on a VPS](/networking/ufw-firewall-vps/) for firewall and Simple mode advice on a VPS. If you also have a server at home, you can run Hybrid mode with Traefik on the VPS and add the home apps with **Traefikify**. The VPS must be able to reach each home app's IP and port. Behind CG-NAT it can't do that over the internet, so connect the two servers with a VPN such as Tailscale. See [Use one domain across several servers](/reverse-proxy/multi-server-same-domain/), including its limits.

**Option D: Use a tunnel service.**
Services such as Cloudflare Tunnel connect your server to the internet without a forwarded port. This is outside Deployrr's setup, and this page has no steps for it.

### 4. Skip DDNS Updater

A dynamic DNS updater can't help behind CG-NAT. It keeps your Cloudflare A record in line with your public IP. That doesn't help when the IP is shared and your router can't receive the traffic. See [Keep your Cloudflare A record up to date with DDNS Updater](/apps/ddns-updater/#are-you-behind-cg-nat).

### A note on IPv6

Some ISPs give you IPv6 even when IPv4 is behind CG-NAT. This page doesn't cover IPv6 setups. Deployrr's DDNS Updater updates IPv4 records only, and the Domain Checks steps here are written around a public IPv4. Don't count on IPv6 alone to get Hybrid mode working.

## After you get a public IP

1. Check that your router forwards the right ports to the Docker host. Simple mode needs 80 to 80 and 443 to 443. Advanced mode needs 80 to 81 and 443 to 444. See [Simple vs Advanced Traefik mode](/reverse-proxy/simple-vs-advanced-mode/).
2. Check that your Cloudflare A record has your new public IP. See [DNS records Deployrr expects](/getting-started/domain-checks-failed/#dns-records-deployrr-expects).
3. If **Domain Checks** doesn't show `DONE`, run it again from **Prerequisites** > **Domain Checks**.

:::caution
Don't rerun **Domain Checks** once it shows `DONE` and Traefik is running. It fails at port 80 because Traefik uses that port. See [Rerunning Domain Checks after Traefik is running](/getting-started/domain-checks-failed/#rerunning-domain-checks-after-traefik-is-running).
:::

## Check it worked

1. The router WAN address now matches the public IP from `curl -4 https://ifconfig.me`.
2. **Domain Checks** ends with `Domain Checks Passed: 8 / 8`, or your Local mode or VPS setup opens your apps as you planned.
3. Turn off Wi-Fi on your phone and open your app. With Tailscale, open `http://TAILSCALE-IP:PORT`. Otherwise open `https://app.YOUR_DOMAIN`. Replace `app` and `YOUR_DOMAIN` with your subdomain and domain.

## Related

- [Domain Checks failed in Prerequisites](/getting-started/domain-checks-failed/): every check, its message and its fix.
- [Keep your Cloudflare A record up to date with DDNS Updater](/apps/ddns-updater/): for changing home IPs, not CG-NAT.
- [Set up Tailscale](/networking/tailscale/): reach your apps from anywhere with no port forwarding.
- [Setup Mode: Local or Hybrid](/getting-started/setup-mode/): what Local mode needs and allows.
- [Fix the UFW firewall on a VPS](/networking/ufw-firewall-vps/): firewall and Simple mode on a VPS.
