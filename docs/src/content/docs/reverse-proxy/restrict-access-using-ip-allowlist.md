---
title: Allow only some IP addresses to reach an app
description: Use Deployrr's Internal exposure, or a Traefik IP allowlist, so only your LAN or VPN addresses can open an app and everyone else gets 403 Forbidden.
type: how-to
tags:
  - traefik
  - auth
  - remote-access
  - firewall
apps: [traefik]
applies_to: v6.0+
related:
  - reverse-proxy/setup-auth-bypass-using-file-provider
  - reverse-proxy/check-traefik-logs
  - reverse-proxy/multi-server-same-domain
  - reverse-proxy/point-root-domain-to-a-dashboard
further_reading: []
last_reviewed: 2026-11-08
status: current
old_paths: ["/traefik/restrict-access-using-ip-allowlist"]
sources: []
---

You may want an app to open only from your home network, or only from your home network and a VPN. This page shows two ways to do that. Start with the built-in way. Use the IP allowlist when you need finer control.

## Before you start

- Traefik Production is done and Traefik is running. See the [Quick start](/getting-started/quick-start/) if it is not.
- The app has a file named `app-NAME.yml` in `appdata/traefik3/rules/HOSTNAME/` inside your Docker folder. `NAME` is the app name and `HOSTNAME` is your server's hostname. Deployrr creates this file when you install an app while Traefik is running, or when you use **Traefikify**.
- You can edit files in your Docker folder with a text editor.
- For Option 1: Setup Mode is **Hybrid**, Proxy Type is **Traefik**, and you have a Plus or Pro license. Manage Exposure needs all three.

## Option 1: Use Internal exposure (built in)

This is the simplest way. An app set to **Internal** answers only on your local network. Traefik does not publish it to the internet side at all.

1. In Deployrr, go to **Proxy** > **Traefik** > **Traefik Mode**.
2. Look at the **Traefik Mode** line. It shows the current mode. If it says **Simple**, select **Traefik Mode** once to switch to **Advanced**. If it already says **Advanced**, don't select it, or it switches back to Simple. In Simple mode every app is exposed both internally and externally, and you can't change that per app.
3. On your router, forward port 80 to port 81 on your server. Forward port 443 to port 444. These are the only ports the internet side needs. A VPS usually has no router to do this; see [Apps on a VPS cannot reach the internet](/networking/ufw-firewall-vps/) before you try Advanced mode there.
4. Make sure devices at home reach the server directly. Either your router supports hairpinning, or you use local DNS rewrites (in your router, Pi-hole or AdGuard Home) that point your app names at the server's local IP address. Without one of these, home traffic may count as external, and Internal apps don't open by name.
5. Go to **Proxy** > **Traefik** > **Manage Exposure**.
6. Select the app and choose **Change**.
7. In the **Change Exposure** box, choose **Internal** and select **Apply**. The options are **Both**, **Internal** and **External**. The change takes effect right away.

Internal works by which ports reach the server, not by checking who connects. If your router forwards ports 80 and 443 straight to the server instead of to 81 and 444, outside visitors can still reach Internal apps.

If this covers what you need, stop here.

## Option 2: Use an IP allowlist (manual)

Use this when Internal exposure is too blunt. For example, you want to allow your LAN and a VPN range, or the app must stay on **Both** but only some addresses may open it.

:::note
Manage Exposure only switches the internal and external lines in `app-NAME.yml` (and updates the app's links on the Deployrr Dashboard). It does not touch your allowlist or chain. The two can be used together.
:::

### Find your LAN range

1. On the server, run this command:

   ```bash
   ip -4 route
   ```

2. Look for a line that ends in `scope link`. It starts with a range such as `192.168.1.0/24`. That is your LAN range.
3. Write it down. If you use a VPN, find its address range in the VPN's settings and write that down too.

Private ranges you may see are `192.168.0.0/16`, `10.0.0.0/8` and `172.16.0.0/12`. Use the smallest range that covers your devices.

### Create the allowlist

1. In `appdata/traefik3/rules/HOSTNAME/`, create a file named `middlewares-ipallowlist.yml`.
2. Put this in it. Replace the example ranges with your own.

   ```yaml
   http:
     middlewares:
       middlewares-ipallowlist:
         ipAllowList:
           sourceRange:
             - "127.0.0.1/32"      # This server
             - "192.168.1.0/24"    # Your LAN range
             - "10.8.0.0/24"       # Your VPN range, if you have one
   ```

3. Save the file.

Deployrr does not ship an allowlist file, so you create this one yourself.

### Create a chain that uses it

The shipped `chain-no-auth` file has rate limiting and secure headers. Make a copy of it with the allowlist added.

1. In the same folder, create a file named `chain-no-auth-internal-only.yml`.
2. Put this in it:

   ```yaml
   http:
     middlewares:
       chain-no-auth-internal-only:
         chain:
           middlewares:
             - middlewares-ipallowlist
             - middlewares-rate-limit
             - middlewares-secure-headers
   ```

3. Save the file.

If the app uses a login chain such as Authelia, you can add `- middlewares-ipallowlist` to a chain of your own instead. Don't edit the chain files Deployrr ships. Make a copy with a new name.

:::caution
**Security** > **Manage Auth** replaces the chain name in `app-NAME.yml`. If you run it on this app, it swaps `chain-no-auth-internal-only` for the standard chain you pick. Set the chain by hand again afterward. Start your chain's name with an existing chain name, as in this example, or Manage Auth won't list the app at all. For the standard chains and how Manage Auth works, see [Remove Authentik](/apps/authentik-removal/).
:::

### Use the chain in the app

1. Open `appdata/traefik3/rules/HOSTNAME/app-NAME.yml`.
2. Find the `middlewares:` list under the app's router. It looks like this:

   ```yaml
         middlewares:
           - chain-no-auth
   ```

   If you picked a login method when you set up the app, you see a different chain name, such as `chain-authelia`. Replace that name instead.

3. Change the chain name to your new one. Don't add `@file`.

   ```yaml
         middlewares:
           - chain-no-auth-internal-only
   ```

4. Save the file. Traefik picks up changes in this folder on its own. You don't need to restart it.

:::caution
If you run **Traefikify** again for this app and choose to overwrite the file, the change is lost. Make it again afterward.
:::

Apps that use Docker labels instead of a rules file are the exception. Traefik, Google OAuth, Authelia, TinyAuth and Authentik do this. For those, add `@file` to the chain name in the label, for example `chain-no-auth-internal-only@file`.

### Keep Cloudflare on DNS only

The allowlist checks the address that connects to Traefik. That works only if nothing in front of Traefik hides the real address.

In Cloudflare, set your DNS records to **DNS only** (grey cloud). Deployrr's domain checks (**Prerequisites** > **Domain Checks**) expect this. They report an error if the records are proxied (orange cloud). With the orange cloud, Traefik sees Cloudflare's addresses and not your clients'.

## Check it worked

1. From a device inside an allowed range, open the app in a browser. It loads as normal.
2. From a device outside every allowed range, open the same address. A phone on mobile data, with Wi-Fi off, works well. You see `403 Forbidden`.
3. Or run this from a computer. Replace `SUBDOMAIN.YOUR_DOMAIN` with your app's address.

   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" https://SUBDOMAIN.YOUR_DOMAIN
   ```

   An allowed device prints the app's normal code, such as `200`. A blocked device prints `403`.

If an allowed device gets `403`, check these:

- Your range is written correctly, such as `192.168.1.0/24`, and covers the device's address.
- Your Cloudflare records are grey cloud.
- The file names and the names inside them match. `chain-no-auth-internal-only` in the chain file is the same name you put in `app-NAME.yml`.

[Read the Traefik logs](/reverse-proxy/check-traefik-logs/) for errors about the middleware or chain.

## Related

- [Let mobile apps skip the login page](/reverse-proxy/setup-auth-bypass-using-file-provider/): another change you make in `app-NAME.yml`.
- [Read the Traefik logs](/reverse-proxy/check-traefik-logs/): find out why a request was blocked or a file did not load.
- [Use one domain across several servers](/reverse-proxy/multi-server-same-domain/): Traefikify for apps on other machines.
- [Open a dashboard at your root domain](/reverse-proxy/point-root-domain-to-a-dashboard/): another change you make in `app-NAME.yml`.
