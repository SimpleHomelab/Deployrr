---
title: Jellyfin app on LG webOS TV or Xbox shows error -27
sidebar:
  label: Jellyfin error -27 on LG TV or Xbox
description: Fix the -27 connection error in the Jellyfin app on LG webOS TVs and Xbox when Jellyfin runs behind Traefik, by changing one security header.
type: troubleshooting
tags:
  - media
  - traefik
  - auth
applies_to: v6.0+
apps: [jellyfin]
symptoms:
  - "Jellyfin app on my LG TV shows error -27 when I add my server"
  - "Jellyfin Xbox app can't connect to my server"
  - "Jellyfin works in a web browser but not in the LG webOS app"
  - "The TV app fails before it shows the login page"
related:
  - reverse-proxy/authentik-removal
  - reverse-proxy/setup-auth-bypass-using-file-provider
  - reverse-proxy/check-traefik-logs
  - reverse-proxy/restrict-access-using-ip-allowlist
  - apps/gpu-transcoding
videos:
  - id: cUZ6kkum1pc
    start: 655
    title: "Traefik middlewares and chains: Secure Headers middleware"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
further_reading:
  - title: "UDMS part 18: the Security Headers middleware"
    url: https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Security_Headers
last_reviewed: 2026-11-08
status: current
old_paths: ["/apps/jellyfin-client-on-lg-webos"]
sources:
  - { type: discord, ref: "https://discord.com/channels/974306760171073556/1159825615147511901/1352742863594586112" }
  - { type: discord, ref: "https://discord.com/channels/974306760171073556/1347615487932235817" }
---

## Symptoms

You run Jellyfin behind Traefik with your own domain. The Jellyfin app on an LG webOS TV or an Xbox can't connect, and you see this error:

```txt
-27
```

At the same time:

- Jellyfin opens fine in a web browser on your phone or computer.
- Jellyfin works on your local network and from outside.
- Other Jellyfin apps connect without trouble.

The error shows up before the login page.

## Cause

Traefik adds a security header called `X-Frame-Options` (set as `SAMEORIGIN`) to your apps. The LG webOS and Xbox apps don't accept it. Browsers and most other apps do.

Deployrr sets this header in the file `middlewares-secure-headers.yml`. All Deployrr login chains use that file (`chain-no-auth`, `chain-basic-auth`, `chain-authelia`, `chain-authentik`, `chain-oauth` and `chain-tinyauth`), so every app behind Traefik gets the header.

To understand what this file does, watch [Traefik middlewares and chains: Secure Headers middleware at 10:55](https://youtu.be/cUZ6kkum1pc?t=655) (manual Docker Compose setup; Deployrr creates the file for you).

## Fix

1. Open the file in your Docker folder:

   ```bash
   sudo nano appdata/traefik3/rules/HOSTNAME/middlewares-secure-headers.yml
   ```

   Replace `HOSTNAME` with the host name of your server. It is the name of the folder inside `appdata/traefik3/rules/`.

2. Find the `customFrameOptionsValue` line. The comment above it says `Comment out customFrameOptionsValue if you're using Jellyfin on LG WebOS`. Put a `#` in front of `customFrameOptionsValue`, after the spaces, so it becomes a comment:

   ```yaml
           # customFrameOptionsValue: SAMEORIGIN
   ```

3. Save the file.
4. Traefik loads the change on its own, usually within seconds. If the TV still fails, restart Traefik:

   ```bash
   sudo docker restart traefik
   ```

   With the [Deployrr bash aliases](/using-deployrr/bash-aliases/): `dcrestart traefik`.

5. On the TV, open the Jellyfin app and add your server again. Use your full address, for example `https://jellyfin.YOUR_DOMAIN`. Replace `YOUR_DOMAIN` with your own domain.
6. If it still fails, try the address with `https://` and without it. Also try it with `:443` at the end and without it.

:::note
This change applies to every app that uses the secure headers file, not only Jellyfin. The other security headers stay on.
:::

## If the TV app still can't log in

The TV app may get past the connection and then stop at a login step from Authelia, Authentik, TinyAuth, Google OAuth or Basic HTTP Auth. TV apps can't show those login pages. Jellyfin has its own login, so you can switch Jellyfin to No Authentication in Traefik. For apps that can send a custom header, [Auth Bypass](/reverse-proxy/setup-auth-bypass-using-file-provider/) is another way to skip the login page.

First check which chain Jellyfin uses. If Traefik was running when you installed Jellyfin, Deployrr asked you to **Pick an Authentication Method** and created `app-jellyfin.yml` in `appdata/traefik3/rules/HOSTNAME/`. Open that file and look for a chain name such as `chain-authelia`. If you skipped the question, Jellyfin uses `chain-no-auth` already.

To switch Jellyfin to `chain-no-auth`, use **Security** > **Manage Auth** (Pro license) or edit the file. [Remove Authentik](/reverse-proxy/authentik-removal/) has the steps for both and a table of chains. Use `chain-no-auth` instead of the chain it suggests.

:::caution
`chain-no-auth` leaves Jellyfin open to anyone who can reach your domain, except for Jellyfin's own login. Use a strong password on every Jellyfin account.
:::

## Check it worked

1. Open the Jellyfin app on the TV or Xbox.
2. Enter your server address.
3. The app should show the Jellyfin login page, with no `-27` error.

## Related

- [Remove Authentik](/reverse-proxy/authentik-removal/): how to change an app's login chain, with a table of chains.
- [Set up GPU hardware transcoding](/apps/gpu-transcoding/): let Jellyfin use your graphics card when it converts video for a TV or phone.
