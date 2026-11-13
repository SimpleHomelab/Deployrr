---
title: Open a dashboard at your root domain
description: Change one line in an app's Traefik file so your dashboard opens at example.com and www.example.com instead of a subdomain.
type: how-to
tags:
  - traefik
  - domain
  - remote-access
apps:
  - traefik
  - homepage
applies_to: v6.0+
related:
  - reverse-proxy/check-traefik-logs
  - using-deployrr/second-app-instances
  - apps/home-assistant-behind-traefik
  - host/change-hostname
  - reverse-proxy/restrict-access-using-ip-allowlist
further_reading:
  - title: "UDMS part 18: Homepage behind Traefik (manual setup)"
    url: "https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Homepage"
videos:
  - id: 6S9PwhAlZUs
    start: 437
    title: "Traefik 3 guide: Homepage at the root domain and www"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
last_reviewed: 2026-11-08
status: current
old_paths: ["/traefik/point-root-domain-to-a-dashboard"]
sources:
  - type: discord
    ref: "https://discord.com/channels/974306760171073556/1345068762029887579"
sidebar:
  order: 16
---

By default, a dashboard opens at a subdomain such as `homepage.example.com`. Deployrr suggests the app name as the subdomain at install, but you may have picked another one. You can make it open at your root domain, `example.com`, and at `www.example.com`. You do this by changing the address rule in the app's Traefik file.

This page uses Homepage as the example. The same steps work for Homarr, Dashy, Organizr or any other app that Deployrr put behind Traefik.

## Before you start

- Traefik is set up, and the dashboard already opens at its subdomain. Deployrr only creates the app's Traefik file if Traefik was running when you installed the app. If the file is missing, put the app behind Traefik first with **Traefikify** in Deployrr.
- You can open a terminal on your server.
- You know your hostname and your Docker folder. Deployrr recommends `/home/YOUR_USER/docker`, but you choose the folder in **Prerequisites**.
- Your root domain points to your server in DNS. See the first step below.

## Steps

### Check your DNS

1. Sign in to Cloudflare and open the DNS records for your domain.
2. Check that the root domain (`example.com`) has a record that points to your home IP address.
3. Check that `www` resolves too. A wildcard record (`*`) that points to the root domain covers it. Otherwise, add a `www` record.

A wildcard record for subdomains does not cover the bare root domain, so the root domain needs its own record.

Deployrr does not create DNS records for you. Keep these records set to **DNS only** (grey cloud) in Cloudflare. Deployrr's setup checks expect that and warn about proxied (orange cloud) records.

### Back up the Traefik file

1. Go to your Docker folder:

   ```bash
   cdd
   ```

   Without the [bash aliases](/using-deployrr/bash-aliases/), use `cd YOUR_DOCKER_FOLDER`. Replace `YOUR_DOCKER_FOLDER` with the path to your Docker folder.

2. Copy the file for your dashboard to a safe place outside the rules folder:

   ```bash
   cp appdata/traefik3/rules/$HOSTNAME/app-homepage.yml ~/app-homepage.yml.bak
   ```

   Bash fills in `$HOSTNAME` for you. For another dashboard, replace `homepage` with its name, for example `app-homarr.yml`.

:::caution
Keep the backup outside the `rules` folder. Traefik reads the files in that folder, and a copy there can cause a clash.
:::

### Change the rule

1. Open the file:

   ```bash
   nano appdata/traefik3/rules/$HOSTNAME/app-homepage.yml
   ```

   If your editor is not nano, use the one you prefer.

2. Find the `rule:` line. It looks like this:

   ```yaml
   rule: "Host(`homepage.{{env "DOMAINNAME_1"}}`)"
   ```

   If you picked a different subdomain at install, your line shows that one instead of `homepage`. Use your subdomain in the second option below.

3. Replace it with the version you want.

   To open the dashboard at the root domain and `www` only:

   ```yaml
   rule: "Host(`{{env "DOMAINNAME_1"}}`) || Host(`www.{{env "DOMAINNAME_1"}}`)"
   ```

   To keep the subdomain as well:

   ```yaml
   rule: "Host(`homepage.{{env "DOMAINNAME_1"}}`) || Host(`{{env "DOMAINNAME_1"}}`) || Host(`www.{{env "DOMAINNAME_1"}}`)"
   ```

   Do not type your domain name. `{{env "DOMAINNAME_1"}}` already holds the domain you gave Deployrr.

   To see the same root domain and `www` idea in a manual setup, watch [Traefik 3 guide: Homepage at the root domain and www at 7:17](https://youtu.be/6S9PwhAlZUs?t=437) (manual Docker Compose setup that uses Docker labels, not a rules file). For background, see [UDMS part 18: Homepage behind Traefik](https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Homepage) (manual setup).

4. Leave every other line as it is. If one of the `entryPoints` lines starts with `#`, the app is set to internal or external access only. Leave it like that.
5. Save the file.

Here is a whole file after the change, for the first option. Your router name, entry points, middleware and address may differ. For example, the middleware is `chain-no-auth` only if you chose no login method at install. Change only the `rule:` line in your own file.

```yaml
http:
  routers:
    homepage-rtr:
      rule: "Host(`{{env "DOMAINNAME_1"}}`) || Host(`www.{{env "DOMAINNAME_1"}}`)"
      entryPoints:
        - websecure-external
        - websecure-internal
      middlewares:
        - chain-no-auth
      service: homepage-svc
      tls:
        certResolver: dns-cloudflare
        options: tls-opts@file
  services:
    homepage-svc:
      loadBalancer:
        servers:
          - url: "http://172.17.0.1:3001"
```

Traefik watches the files in the `rules/HOSTNAME` folder, so it picks up the change without a restart. It only watches files directly in that folder, not in subfolders.

Homepage accepts any host name, so you don't need to change anything in Homepage. Other dashboards may have their own allowed hosts setting. If yours shows a host error, check its own documentation.

:::note
The certificate that Deployrr sets up covers your root domain and all its subdomains. You do not need to request a new one.
:::

## Check it worked

1. Open `https://example.com` in your browser. Use your own domain.
2. Your dashboard should load with no certificate warning.
3. Open `https://www.example.com`. It should load the same dashboard.

If the page does not load, [read the Traefik logs](/reverse-proxy/check-traefik-logs/). A `404` for your root domain in the access log means Traefik found no router for it. Check the `rule:` line for typos, such as a missing backtick or bracket.

If the dashboard loads on your home network but not from outside, check your DNS records again.

## Common problems

- **Another app already uses the root domain.** Only one router should answer for an address. Remove the root domain from the other app's rule.
- **The change is gone.** Changing an app's login method or exposure in Deployrr leaves your `rule:` line alone. But if you run **Traefikify** again for the same app and choose to overwrite the file, or remove the app from Traefik and add it back, the rule goes back to the default. Restore it from your backup.
