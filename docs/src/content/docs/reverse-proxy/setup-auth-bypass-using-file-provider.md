---
title: Let mobile apps skip the login page (Auth Bypass)
description: Set an Auth Bypass key in Deployrr and add a bypass route, so apps like LunaSea and NZB360 skip your login page when they send the key.
type: how-to
tags:
  - auth
  - traefik
  - remote-access
apps: [traefik]
applies_to: v6.0+
related:
  - reverse-proxy/check-traefik-logs
  - using-deployrr/bash-aliases
  - reverse-proxy/multi-server-same-domain
  - apps/home-assistant-behind-traefik
  - apps/jellyfin-client-on-lg-webos
further_reading:
  - title: "UDMS part 28: Why and how to conditionally bypass Traefik auth with a key"
    url: "https://www.simplehomelab.com/udms-28-traefik-auth-bypass/"
last_reviewed: 2026-11-08
status: current
old_paths: ["/traefik/setup-auth-bypass-using-file-provider"]
sources:
  - { type: discord, ref: "https://discord.com/channels/974306760171073556/1380058913663357069" }
sidebar:
  order: 14
---

Some mobile apps cannot show your login page. LunaSea and NZB360 are two examples. Auth Bypass lets such an app skip the login when it sends a secret key with each request. Everyone else still sees your login page.

This page shows how to set the key, add a bypass route to an app, and set up the mobile app.

:::caution
Anyone who has the key can open the app without logging in. Use a long, random key. Keep it secret. Don't post it in screenshots, chats or forum threads.
:::

## Before you start

- Traefik Production is done and Traefik is running. See the [Quick start](/getting-started/quick-start/) if it is not.
- You have a Plus or Pro license, all **Prerequisites** steps are done, and the **Socket Proxy** app is running. If something is missing, Deployrr shows a **Requirements Not Met** box that lists it.
- The app has a file named `app-NAME.yml` in `appdata/traefik3/rules/HOSTNAME/` inside your Docker folder. `NAME` is the app name and `HOSTNAME` is your server's hostname. Deployrr creates this file when you use **Traefikify**.
- The app has a login method set (for example Authelia or Basic HTTP Auth). If it has none, there is nothing to bypass. See [Choose a login method](/reverse-proxy/choose-login-method/).

## Steps

### Set the key

1. In Deployrr, go to **Proxy** > **Traefik** > **Auth Bypass**. Its description reads "Set Traefik Forward Auth Bypass Key". It shows **Set** after you have saved a key.
2. Read the **Traefik Auth Bypass Key** box and confirm that you want to proceed.
3. In the **Docker Environment Variables** box, check the key. Deployrr suggests a random key of 16 letters and digits. You can use it as it is or type your own.
4. Confirm. Deployrr saves the key in the `.env` file in your Docker folder.
5. Wait for the **Auth Bypass Key - Set** box and close it.
6. Check that **Auth Bypass** now shows **Set** in the menu. The success box can show even if you cancelled the key box.

If you run **Auth Bypass** again, the box shows your current key. Change it there to replace it.

### Let Traefik read the key

Deployrr does not do this step for you, and the success box does not mention it.

1. Open Traefik's compose file in a text editor. It is `compose/HOSTNAME/traefik.yml` inside your Docker folder.
2. Find this line in the `environment` list:

   ```yaml
   # - TRAEFIK_AUTH_BYPASS_KEY
   ```

3. Remove the `# ` at the start so it reads like this. Keep the same indent. If the line already has no `#`, leave it.

   ```yaml
   - TRAEFIK_AUTH_BYPASS_KEY
   ```

4. Save the file.
5. Recreate Traefik so it picks up the key:

   ```bash
   dcrec traefik
   ```

   This uses a Deployrr alias. See [Bash aliases](/using-deployrr/bash-aliases/).

Do step 5 again each time you change the key.

### Add the bypass route to an app

**Traefikify** does not ask about the bypass, and always creates a normal rules file. Add the bypass route to that file by hand.

1. Open `appdata/traefik3/rules/HOSTNAME/app-NAME.yml` in a text editor.
2. Find the app's normal router. It is named `NAME-rtr`. Add this line under its `rule:` line, with the same indent:

   ```yaml
         priority: 99
   ```

   Leave the rest of the normal router as it is.
3. Add a second router under `routers:`, next to the first. Use the same indent as the first router.

   ```yaml
       NAME-rtr-bypass:
         rule: "Host(`SUBDOMAIN.{{env "DOMAINNAME_1"}}`) && Header(`traefik-auth-bypass-key`, `{{env "TRAEFIK_AUTH_BYPASS_KEY"}}`)"
         priority: 100
         entryPoints:
           - websecure-external
           - websecure-internal
         middlewares:
           - chain-no-auth
         service: NAME-svc
         tls:
           certResolver: dns-cloudflare
           options: tls-opts@file
   ```

4. Replace `NAME` with the app name from the file name. Replace `SUBDOMAIN` with the same subdomain the normal router uses.
5. Make `entryPoints` match the normal router. If it lists only one, list only that one.
6. Check that `service:` uses the same value as the normal router.
7. Save the file. Traefik picks up changes in this folder on its own. You don't need to restart it.

Don't type your key into this file. The `{{env "TRAEFIK_AUTH_BYPASS_KEY"}}` part reads it from Traefik.

The higher priority (100 against 99) makes Traefik try the bypass route first. Requests without the right header fall through to the normal route and its login. To understand why this works, read [UDMS part 28: Traefik conditional auth bypass](https://www.simplehomelab.com/udms-28-traefik-auth-bypass/) (manual setup, background only; it puts rules files in a different folder than Deployrr v6, so follow the steps on this page).

:::caution
If you run **Traefikify** again for this app and choose to overwrite the file, your bypass route is lost. Add it again afterwards. Keep a copy of the file outside the `rules` folder.
:::

### Set up the mobile app

1. In the mobile app, open the settings for your server or connection.
2. Find a setting for custom headers. LunaSea and NZB360 both have one.
3. Add a header with this name:

   ```text
   traefik-auth-bypass-key
   ```

4. Set the value to your key. In this page, `YOUR_BYPASS_KEY` stands for it.
5. Set the server address to the app's normal address, for example `https://SUBDOMAIN.YOUR_DOMAIN`.

## Check it worked

Run these from a computer. Replace `SUBDOMAIN.YOUR_DOMAIN` with your app's address and `YOUR_BYPASS_KEY` with your key.

1. Request the app without the header:

   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" https://SUBDOMAIN.YOUR_DOMAIN
   ```

   You should get a redirect to your login page (such as `302`) or `401`.

2. Request it with the header:

   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" -H "traefik-auth-bypass-key: YOUR_BYPASS_KEY" https://SUBDOMAIN.YOUR_DOMAIN
   ```

   You should get the app's own response, such as `200`, and no login redirect.

If both requests show the login redirect, check these:

- The `# ` is removed from the Traefik compose line, and you ran `dcrec traefik` after that.
- The header name is spelled `traefik-auth-bypass-key`, in lowercase with hyphens.
- The key in your request is the one you set in **Auth Bypass**.

[Read the Traefik logs](/reverse-proxy/check-traefik-logs/) if the app does not load at all.

:::note
The **Auth Bypass Key - Set** box tells you to use a `-bypass` template with **Traefikify** and to send an `X-Auth-Bypass` header. Follow this page instead. **Traefikify** has no bypass option, and the route on this page checks for the `traefik-auth-bypass-key` header.
:::

## Related

- [Read the Traefik logs](/reverse-proxy/check-traefik-logs/): find out why a route does not match.
- [Bash aliases](/using-deployrr/bash-aliases/): what `dcrec` and the other shortcuts do.
- [Use one domain across several servers](/reverse-proxy/multi-server-same-domain/): Traefikify for apps on other machines.
- [Home Assistant behind Traefik](/apps/home-assistant-behind-traefik/): another app set up with a rules file.
- [Allow only some IP addresses to reach an app](/reverse-proxy/restrict-access-using-ip-allowlist/): limit an app to your LAN or VPN instead of skipping the login.
