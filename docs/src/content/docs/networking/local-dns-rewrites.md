---
title: Set up local DNS rewrites so Internal apps open at home
sidebar:
  label: Local DNS rewrites
description: Point *.YOUR_DOMAIN at your server's LAN IP with Pi-hole or AdGuard Home so Internal apps open by name from devices on your home network.
type: how-to
tags:
  - domain
  - traefik
  - app-networking
  - ports
applies_to: v6.0+
apps: [pihole]
related:
  - reverse-proxy/simple-vs-advanced-mode
  - apps/pi-hole-port-53-conflict
  - networking/domain-checks-failed
  - host/fixed-ip
  - reverse-proxy/restrict-access-using-ip-allowlist
last_reviewed: 2026-11-12
status: current
old_paths: []
sources: []
videos:
  - id: rdqbAr0TFnQ
    start: 4191
    title: "Deployrr 5 walkthrough: Why Internal apps need a local DNS rewrite (Pi-hole or AdGuard Home)"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
---

A local DNS rewrite tells your home devices that your app names live at your server's LAN IP address. The request then stays inside your network. This page shows how to set one up in Pi-hole, AdGuard Home or your router.

The main reason to do this is Advanced mode. There, Traefik serves Internal apps on port 443 and External apps on port 444, and your router forwards 443 to 444. A home device that gets the server's LAN IP goes to port 443, so Traefik treats it as Internal. Without a rewrite, your domain points to your public IP and the request may count as external. See [If an Internal app won't open from home](/reverse-proxy/simple-vs-advanced-mode/#if-an-internal-app-wont-open-from-home).

To hear why Internal apps need this, watch [Deployrr 5 walkthrough: hairpinning and DNS rewrites at 1:09:51](https://youtu.be/rdqbAr0TFnQ?t=4191) (shows Deployrr v5; menus differ in v6).

A rewrite also helps in Simple mode. Your traffic stays local and does not leave through your router.

## Before you start

- Your domain and Traefik work. See [Set up Traefik](/reverse-proxy/traefik-setup/) if they do not.
- You know your server's LAN IP address. This page calls it `SERVER_LAN_IP`. The server's address must not change, so see [Give your server a fixed IP address](/host/fixed-ip/) if it might.
- You have a device on your network to test from, other than the server.
- Setup Mode is **Hybrid**. In **Local** mode Deployrr uses no reverse proxy, so you don't need rewrites.
- **Domain Checks** and Traefik **Production** are done. See the next section for why.

## Do the rewrite after Domain Checks

Deployrr's **Domain Checks** look up your domain through the server's own DNS. They expect your public IP. If the server itself uses a DNS server with your rewrite, check 4 and check 6 fail with an IP mismatch, because the domain now resolves to your LAN IP.

- Finish **Domain Checks** and Traefik before you add the rewrite. Deployrr keeps the passed result and does not rerun the checks on its own.
- If you must run **Domain Checks** again later, point the server's own DNS at a public DNS server such as `1.1.1.1` first, then switch it back.

Traefik is not affected. It checks its certificates against Cloudflare's public DNS servers, not your local one.

Replace `YOUR_DOMAIN` with your domain and `SERVER_LAN_IP` with your server's LAN IP wherever you see them.

## Steps

### Install Pi-hole from Deployrr (skip if you already have a DNS server)

1. In Deployrr, go to **Apps** > **Browse Apps**.
2. Select **Pi-hole** and choose **Install**.
3. At **Do you want to install this app?**, choose **Yes**.
4. In **Pi-hole - Password Configuration**, keep the suggested password or type your own. Write it down. You need it to log in to Pi-hole.
5. In **Pi-hole - Configuration**, `home.internal` is filled in. This is the local domain Pi-hole uses for your home devices. Keep it or enter your own, such as `myhome.internal`. Don't enter your public domain here.
6. At **Enter the port for Pi-hole (Web interface port)**, keep the suggested port (`83`, or the next free port) or enter another.
7. Wait for the install to finish. Deployrr shows a note with the address of the Pi-hole web interface: `http://SERVER_LAN_IP:PORT/admin/`.

Pi-hole uses port 53 on your server, and port 67 for DHCP. If the install fails with "address already in use", see [Pi-hole will not start because port 53 is already in use](/apps/pi-hole-port-53-conflict/).

### Add the rewrite in Pi-hole

Menus differ between Pi-hole versions. Deployrr installs the latest Pi-hole release, and these steps match Pi-hole v6.

Use a wildcard to cover every app at once. Use single records if you only want a few apps.

**Every app (wildcard):**

1. Open the Pi-hole web interface and log in.
2. Go to **Settings** > **All settings**.
3. Switch to **Expert** view.
4. Open the **Miscellaneous** tab.
5. Find the `misc.dnsmasq_lines` setting and add this line:

   ```text
   address=/YOUR_DOMAIN/SERVER_LAN_IP
   ```

6. Save.

:::note
This line answers for `YOUR_DOMAIN` itself and for every subdomain, such as `app.YOUR_DOMAIN` and `anything.YOUR_DOMAIN`. All of them go to `SERVER_LAN_IP`.
:::

**One app at a time:**

1. Open the Pi-hole web interface and log in.
2. Go to **Settings** > **Local DNS Records**.
3. Add the domain `app.YOUR_DOMAIN` and the IP address `SERVER_LAN_IP`, then add the record.
4. Repeat for each app.

### Add the rewrite in AdGuard Home

Use this if you run AdGuard Home on another device. AdGuard Home is not in the Deployrr v6 app list.

1. Open the AdGuard Home web interface.
2. Go to **Filters** > **DNS rewrites**.
3. Select **Add DNS rewrite**.
4. For the domain, enter `*.YOUR_DOMAIN`.
5. For the IP address, enter `SERVER_LAN_IP`.
6. Save.

### Use your router instead

Many routers can do the same. OPNsense, for example, has Unbound host overrides. Look for "local DNS", "host override" or "DNS rewrite" in your router settings. The names differ by brand. If you use OPNsense, also read [Traefik staging fails with unable to obtain ACME certificate on OPNsense](/networking/opnsense-conflict/).

### Test before you switch your network

In the next steps, `DNS_SERVER_IP` is the LAN IP of the device that runs your DNS server. If Deployrr installed Pi-hole, that is `SERVER_LAN_IP`.

1. On another device on your network, run this command. Use your own domain and IP:

   ```bash
   nslookup app.YOUR_DOMAIN DNS_SERVER_IP
   ```

2. Read the answer. It should show `SERVER_LAN_IP` as the address.
3. If it shows your public IP, the rewrite is not saved or is in the wrong place. Check the steps above.

### Point your devices at the DNS server

1. To test on one device first, open that device's network settings and set its DNS server to `DNS_SERVER_IP`.
2. To cover your whole network, open your router's DHCP settings and set the DNS server to `DNS_SERVER_IP`. The setting name differs by brand.
3. Restart the Wi-Fi on your devices, or wait for them to renew their DHCP lease.

:::caution
Write down your router's old DNS values before you change them. If the internet stops working for your devices, put the old values back.
:::

Keep these in mind:

- If the server or the Pi-hole container is down, devices that use it lose DNS. Websites stop opening until it is back or you change the DNS setting. If the server itself uses Pi-hole, it also can't renew certificates while Pi-hole is down.
- Do not add a public DNS server such as `1.1.1.1` as a second DNS server on the same devices. A device may pick it and skip your rewrite. Then Internal apps open only some of the time.

## Check it worked

1. On a device that uses the new DNS server, open `https://app.YOUR_DOMAIN`. The app should open.
2. Turn off Wi-Fi on your phone and open the same address on mobile data. An Internal app should not open. An External or Both app should still open in Advanced mode.

## If it still does not work

- **The old answer is cached.** Restart the browser. If that does not help, restart the device or clear its DNS cache.
- **The browser ignores your DNS server.** Browsers can use their own secure DNS, also called DNS over HTTPS. That skips Pi-hole. Turn it off in the browser's privacy or security settings.
- **The device does not use the new DNS server.** Run `nslookup app.YOUR_DOMAIN` with no server on the device. If the answer is your public IP, the device still uses another DNS server.
- **Domain Checks now fail with an IP mismatch.** The server uses your rewrite. See [Do the rewrite after Domain Checks](#do-the-rewrite-after-domain-checks) and [Domain Checks failed](/networking/domain-checks-failed/).
- **Pi-hole will not start.** See [Pi-hole will not start because port 53 is already in use](/apps/pi-hole-port-53-conflict/).

## Related

- [Simple vs Advanced Traefik mode](/reverse-proxy/simple-vs-advanced-mode/): what Internal and External mean.
- [Allow only some IP addresses to reach an app](/reverse-proxy/restrict-access-using-ip-allowlist/): limit an app to chosen addresses.
- [Give your server a fixed IP address](/host/fixed-ip/): keep `SERVER_LAN_IP` from changing.
