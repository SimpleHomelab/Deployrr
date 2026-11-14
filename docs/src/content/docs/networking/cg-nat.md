---
title: "Behind CG-NAT: your apps can't be reached from the internet"
sidebar:
  order: 4
  label: Behind CG-NAT
description: "Find out if your ISP uses CG-NAT, then pick a fix: ask for a public IP, use Local mode with Tailscale, ZeroTier or Cloudflare Tunnel, or run Deployrr on a VPS."
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
  - id: olFVgvwjve0
    start: 150
    title: "ZeroTier tutorial: create a network and connect your devices"
last_reviewed: 2026-11-14
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

The device in front of your router is usually a modem or router from your ISP. Its menus differ by ISP.

Your router's WAN address shows which network the device in front uses. If your router's WAN IP is `192.168.0.20`, the device in front is often at `192.168.0.1`. Open that address in a browser to reach its admin page. The login is often on a label on the device.

Pick one of these, in this order.

**Best: bridge mode on the device in front.**
Bridge mode turns the ISP device into a plain modem, so your router gets the public IP. It may be called **Bridge Mode**, **Modem Mode** or **IP Passthrough**. Your ISP can often tell you how, or turn it on for you.

:::caution
Bridge mode can cut your internet until your router picks up the new address. The ISP device's Wi-Fi and its other network ports often stop working too, so anything plugged into them goes offline. Before you switch:

1. Write down the ISP device's settings, its admin address and its login.
2. If your ISP uses PPPoE, get the PPPoE username and password from your ISP first. Your router needs them after the switch.
3. Know how to go back. Most ISP devices return to their old settings with a factory reset, using the reset button.

After the switch, restart your router, or renew its WAN address, so it gets the public IP.
:::

**Next: put your router in the device's DMZ.**
If the ISP device has no bridge mode, look for **DMZ** or **Exposed Host**. Set it to your router's WAN IP. The ISP device then sends all traffic from the internet to your router, and your router's port forwards and firewall still apply. Give your router's WAN a fixed address on the ISP device first, so the DMZ keeps pointing at it. Never set the DMZ to your Docker host's address. That exposes the whole server to the internet.

**Last: forward ports on both devices.**
On the ISP device, forward ports 80 and 443 (TCP) to your router's WAN IP, with the same port numbers. On your router, forward them to the Docker host as in [What to forward](/networking/port-forwarding/#what-to-forward). In Advanced Traefik mode, only your router changes the ports to 81 and 444. The ISP device still forwards 80 to 80 and 443 to 443. Give your router's WAN a fixed address on the ISP device here too.

Then check again:

- With bridge mode, your router's WAN address now matches your public IP.
- With a DMZ or forwards on both devices, your router's WAN address stays private. That is expected. Test with the [check from outside](/networking/port-forwarding/#check-from-outside) instead.

### 3. If you have CG-NAT, pick an option

Choose one.

**Option A: Ask your ISP for a public IPv4 address.**
Ask for a public IP, or to move you off CG-NAT. Some ISPs charge for this, or only offer it on a business plan. With a public IP, your home server works with Hybrid mode as normal. Ask for a public IPv4, not only IPv6.

**Option B: Use Local mode, and reach your apps over Tailscale.**
Local mode serves your apps on your home network only. It needs no domain, no reverse proxy and no port forwarding. See [Setup Mode: Local or Hybrid](/getting-started/setup-mode/). Then add Tailscale to reach the apps from outside. You open them at `http://TAILSCALE-IP:PORT`, with plain `http` and no domain name. See [Set up Tailscale](/networking/tailscale/). To see why Tailscale needs no open ports, watch [Tailscale tutorial: remote access without opening ports at 0:38](https://youtu.be/M6GMp4FJrB8?t=38).

**Option C: Run Deployrr on a VPS.**
A VPS has its own public IP, so there is nothing to forward. See [Fix the UFW firewall on a VPS](/networking/ufw-firewall-vps/) for firewall and Simple mode advice on a VPS. If you also have a server at home, you can run Hybrid mode with Traefik on the VPS and add the home apps with **Traefikify**. The VPS must be able to reach each home app's IP and port. Behind CG-NAT it can't do that over the internet, so connect the two servers with Tailscale. See [Traefik on a VPS with your apps at home](#traefik-on-a-vps-with-your-apps-at-home) below.

**Option D: Use ZeroTier or Cloudflare Tunnel.**
Deployrr can install both, and neither needs a forwarded port. ZeroTier works like Tailscale: your devices join a private network, and you open apps at `http://ZEROTIER-IP:PORT`. Cloudflare Tunnel makes apps public on your domain, and Cloudflare carries the traffic to your server. Neither one makes **Domain Checks** pass, so use them with Local mode. See [ZeroTier or Cloudflare Tunnel](#zerotier-or-cloudflare-tunnel) below.

#### Tailscale, ZeroTier or Cloudflare Tunnel?

Options B and D differ mainly in who can open your apps.

| | Tailscale | ZeroTier | Cloudflare Tunnel |
|---|---|---|---|
| Who can open your apps | Devices signed in to your Tailscale account | Devices you authorize on your ZeroTier network | Anyone with the address, unless you add a login |
| What each device needs | The Tailscale app | The ZeroTier app | A web browser |
| Address you open | `http://TAILSCALE-IP:PORT` | `http://ZEROTIER-IP:PORT` | `https://app.YOUR_DOMAIN` |
| Domain needed | No | No | Yes, with DNS on Cloudflare |
| Traffic path | Usually direct between your devices | Usually direct between your devices | Always through Cloudflare |

- Pick Tailscale or ZeroTier when only you and your household use the apps. Nothing is public, so an app without its own login stays safe. Both fall back to a relay when two devices can't connect directly, and a relayed link is slower.
- Pick Cloudflare Tunnel when people need to open an app without installing anything, such as a shared photo album. Every app you add to the tunnel is public, so give each one a login.
- For Jellyfin, Plex or other media streaming, use Tailscale or ZeroTier. With a tunnel, every stream goes through Cloudflare, and Cloudflare's terms restrict serving a lot of video through its network.
- Between Tailscale and ZeroTier, Tailscale has more help on this site. [Set up Tailscale](/networking/tailscale/) covers it in full, and the [VPS setup below](#traefik-on-a-vps-with-your-apps-at-home) uses it.
- You can run more than one. For example, use Tailscale for your own apps and a tunnel for the one app you share.

### 4. Skip DDNS Updater

A dynamic DNS updater can't help behind CG-NAT. It keeps your Cloudflare A record in line with your public IP. That doesn't help when the IP is shared and your router can't receive the traffic. See [Keep your Cloudflare A record up to date with DDNS Updater](/apps/ddns-updater/#are-you-behind-cg-nat).

### A note on IPv6

Some ISPs give you IPv6 even when IPv4 is behind CG-NAT. This page doesn't cover IPv6 setups. Deployrr's DDNS Updater updates IPv4 records only, and the Domain Checks steps here are written around a public IPv4. Don't count on IPv6 alone to get Hybrid mode working.

## Traefik on a VPS with your apps at home

This is Option C with your apps still at home. Traefik and your domain run on the VPS. Your home server stays behind CG-NAT with no open ports. Tailscale connects the two servers, and Traefik on the VPS sends each visitor to the home app over it.

### Before you start

- Deployrr runs on the VPS in Hybrid mode, and Traefik Production is done. Simple Traefik mode suits a VPS. See [Fix the UFW firewall on a VPS](/networking/ufw-firewall-vps/) and [Secure a VPS](/host/secure-a-vps/).
- Your domain's DNS records point to the VPS's public IP, not your home IP. See [DNS records Deployrr expects](/getting-started/domain-checks-failed/#dns-records-deployrr-expects).
- The VPS has a Plus or Pro license, which **Traefikify** needs. See [Licenses](/getting-started/licenses/).
- The app runs on the home server, and you can open it at home at `http://HOME-IP:PORT`.

### Steps

1. Install Tailscale on the VPS from Deployrr. See [Set up Tailscale](/networking/tailscale/).
2. Install Tailscale on the home server, and sign it in to the same Tailscale account. If the home server runs Deployrr, follow the same page. Otherwise, use Tailscale's own install steps for that system.
3. Find the home server's Tailscale IP. It usually starts with `100.`. See [Find the server's Tailscale IP](/networking/tailscale/#5-find-the-servers-tailscale-ip).
4. On the VPS, test that Traefik can reach the home app. Replace `TAILSCALE-IP` with the home server's Tailscale IP and `PORT` with the app's port:

   ```bash
   sudo docker exec traefik wget -q --spider http://TAILSCALE-IP:PORT/ && echo OK
   ```

   `OK`, or `server returned error` with an HTTP code such as `401`, means Traefik reached the app. For the other results, see [Use a hostname instead of an IP address](/reverse-proxy/traefikify/#use-a-hostname-instead-of-an-ip-address).
5. On the VPS, run **Proxy** > **Traefik** > **Traefikify**. At **Host IP Address of the App**, type the home server's Tailscale IP. At **WebUI port number of the App**, type the app's port on the home server. See [Put an app behind Traefik](/reverse-proxy/traefikify/#put-an-app-behind-traefik).
6. Repeat steps 4 and 5 for each home app.

Use the Tailscale IP, not the home server's Tailscale machine name. [Set up Tailscale](/networking/tailscale/#2-turn-off-magicdns-in-tailscale) has you turn off MagicDNS, so Traefik can't look up Tailscale names.

### Things to know

- Every visit goes through the VPS. The VPS's bandwidth and your home upload speed limit how fast apps load, which matters most for video streaming.
- The home server keeps the same Tailscale IP unless you remove it from your Tailscale account. If it gets a new one, run **Traefikify** again with the same name. You can also change the address on the `url:` line of the app's rules file on the VPS.
- If you use access controls in the Tailscale admin console, allow the VPS to reach the home server on each app's port. Tailscale's default rules allow it.
- Apps on the VPS itself are added as usual. For other ways to share one domain, see [Use one domain across several servers](/reverse-proxy/multi-server-same-domain/).

## ZeroTier or Cloudflare Tunnel

This is Option D. Both apps are in **Apps** > **Browse Apps**. Neither has a web page of its own.

### Before you start

- You have a Basic, Plus or Pro license. See [Licenses](/getting-started/licenses/).
- Run **System** > **Network** first, so Deployrr checks your server for the network adapter (`/dev/net/tun`). Without it, the install stops with **Requirements Not Met**, after the app's first box. The steps are the same as for Tailscale. See [Set the network adapter](/networking/tailscale/#1-set-the-network-adapter).
- In a Proxmox LXC container, pass `/dev/net/tun` into the container first. See [Pass /dev/net/tun into the container](/host/proxmox-lxc/#pass-devnettun-into-the-container).

### ZeroTier

1. Sign in at `my.zerotier.com`, create a network, and copy its Network ID.
2. In Deployrr, go to **Apps** > **Browse Apps**, select **ZeroTier** and choose **Install**. At `Do you want to install this app?`, choose **Yes**. The **ZeroTier Host Networking** box says you will open apps at `ZEROTIER-IP:PORT`. Select **OK**.
3. At **ZeroTier - Configuration**, which asks `Enter value for ZEROTIER_NETWORKID:`, paste the Network ID. Deployrr joins the server to the network after the install. If you leave it empty, or the join fails, join later with:

   ```bash
   sudo docker exec zerotier zerotier-cli join YOUR_NETWORK_ID
   ```

4. In ZeroTier Central, find the server under the network's members and authorize it. It gets a ZeroTier IP once you do.
5. Install ZeroTier on your phone or laptop, join the same network, and authorize that device too.
6. Open `http://ZEROTIER-IP:PORT`, with the server's ZeroTier IP from ZeroTier Central and the app's port.

To see the ZeroTier network and the device clients set up, watch [ZeroTier tutorial: create a network and connect your devices at 2:30](https://youtu.be/olFVgvwjve0?t=150). The video doesn't cover the Deployrr install, so use the steps above for that part.

### Cloudflare Tunnel

Your domain must use Cloudflare for DNS. See [Cloudflare for Deployrr](/networking/cloudflare/).

1. In the Cloudflare Zero Trust dashboard, create a tunnel of type Cloudflared. Cloudflare shows an install command with a long token in it. Copy only the token.
2. In Deployrr, go to **Apps** > **Browse Apps**, select **Cloudflare Tunnel** and choose **Install**. At `Do you want to install this app?`, choose **Yes**. At the **Cloudflare Tunnel Token Required** box, choose **Yes**.
3. At **Cloudflare Tunnel - Configuration**, which asks `Enter value for CLOUDFLARE_TUNNEL_TOKEN:`, paste the token. Don't leave it empty. The box accepts an empty value, but the tunnel can't connect without a token.
4. Back in Cloudflare, add a public hostname to the tunnel for each app. Pick the subdomain and your domain, and set the service to `http://localhost:PORT`, with the app's port. The tunnel runs on the server's own network, so `localhost` reaches the app.
5. Turn off Wi-Fi on your phone and open `https://app.YOUR_DOMAIN`.

Things to know:

- Anyone who has the address can open the app. For apps without their own login, add one in Cloudflare Zero Trust before you share the address.
- If a DNS record with the same name already exists, Cloudflare won't add the public hostname. Delete the old record first.
- The token gives control of the tunnel. Treat it like a password. Deployrr saves it in your `.env` file as `CLOUDFLARE_TUNNEL_TOKEN`. To change it, edit that value with **Tools** > **.env Editor** (Pro license) or by hand, then run **Tools** > **Stack Manager** > **Recreate** on the app. See [Edit .env values and secrets](/using-deployrr/edit-env-and-secrets/).
- This page doesn't cover sending tunnel traffic through Traefik.

## After you get a public IP

1. Check that your router forwards the right ports to the Docker host. Simple mode needs 80 to 80 and 443 to 443. Advanced mode needs 80 to 81 and 443 to 444. See [Simple vs Advanced Traefik mode](/reverse-proxy/simple-vs-advanced-mode/).
2. Check that your Cloudflare A record has your new public IP. See [DNS records Deployrr expects](/getting-started/domain-checks-failed/#dns-records-deployrr-expects).
3. If **Domain Checks** doesn't show `DONE`, run it again from **Prerequisites** > **Domain Checks**.

:::caution
Don't rerun **Domain Checks** once it shows `DONE` and Traefik is running. It fails at port 80 because Traefik uses that port. See [Rerunning Domain Checks after Traefik is running](/getting-started/domain-checks-failed/#rerunning-domain-checks-after-traefik-is-running).
:::

## Check it worked

1. The router WAN address now matches the public IP from `curl -4 https://ifconfig.me`. If you kept double NAT with a DMZ or two forwards, skip this and use the [check from outside](/networking/port-forwarding/#check-from-outside).
2. **Domain Checks** ends with `Domain Checks Passed: 8 / 8`, or your Local mode or VPS setup opens your apps as you planned.
3. Turn off Wi-Fi on your phone and open your app. With Tailscale, open `http://TAILSCALE-IP:PORT`. With ZeroTier, open `http://ZEROTIER-IP:PORT`. Otherwise open `https://app.YOUR_DOMAIN`. Replace `app` and `YOUR_DOMAIN` with your subdomain and domain.
