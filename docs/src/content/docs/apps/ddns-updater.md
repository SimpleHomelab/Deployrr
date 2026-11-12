---
title: Keep your Cloudflare A record up to date with DDNS Updater
sidebar:
  label: DDNS Updater
description: Install DDNS Updater so your Cloudflare A record follows your home IP when it changes, and set it to match the gray-cloud setup Deployrr expects.
type: how-to
tags:
  - domain
  - remote-access
  - docker
applies_to: v6.0+
apps: [ddns-updater]
related:
  - networking/domain-checks-failed
  - reverse-proxy/traefik-setup
  - reverse-proxy/certificate-errors
  - apps/manage-apps
  - reverse-proxy/choose-login-method
further_reading:
  - title: "UDMS part 18: CG-NAT"
    url: "https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#CG-NAT"
videos:
  - id: rdqbAr0TFnQ
    start: 2481
    title: "Deployrr 5 walkthrough: Domain Checks and gray-cloud records"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: KMZIyoZ3jWM
    start: 455
    title: "Traefik 3 guide: Cloudflare A record, wildcard CNAME and DNS API token"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
  - id: Nuo83uzTWco
    start: 277
    title: "Deployrr 6 overview: Options for CG-NAT"
last_reviewed: 2026-11-12
status: current
old_paths: []
sources: []
---

Most home internet plans give you a public IP that changes now and then. When it does, your Cloudflare A record points at the old address and your apps stop opening from outside. DDNS Updater checks your public IP and fixes the A record for you. This page shows how to install it and how to set it up the way Deployrr expects.

## What DDNS Updater does

- It checks your public IP every 12 hours and updates the record in Cloudflare when the IP has changed. After an update it waits 5 minutes before it will update again.
- It updates only the root record of your domain (`@`), for IPv4 only. The record's TTL is 600 seconds.
- It has a web page at `http://SERVER_IP:PORT`. If the Deployrr Dashboard runs, it also has an entry there.
- It keeps its own backups every 96 hours in `appdata/ddns-updater/backups`.

This is about your public IP, the address the internet sees. It is not your server's LAN address. For that, see [Change the server IP](/using-deployrr/change-server-ip/).

## Before you start

- You have a Basic, Plus or Pro license. A Free license can't install official apps. You see a License Required box. See [Licenses](/getting-started/licenses/).
- You finished Prerequisites. See the [Quick start](/getting-started/quick-start/).
- You use Cloudflare for your domain, and the A record for your root domain already exists. See [DNS records Deployrr expects](/networking/domain-checks-failed/#dns-records-deployrr-expects).
- You know your Cloudflare Zone ID. In Cloudflare, select your domain and open the **Overview** tab to find it.
- You have a Cloudflare DNS API token. DDNS Updater reuses the one you typed in **Proxy** > **Traefik** > **Preparation**. That step needs a Plus or Pro license, Hybrid setup mode and Socket Proxy running. See [Set up Traefik](/reverse-proxy/traefik-setup/). If you can't run it, make a token by hand. See [If the token is empty](#if-the-token-is-empty).

## Install DDNS Updater

1. Go to **Apps** > **Browse Apps**.
2. Select **DDNS Updater** ("Dynamic DNS updater").
3. Choose **Install**.
4. At "Do you want to install this app?", choose **Yes**.
5. In the **Port Configuration** box, accept the suggested port (8000, or the next free one) or type another.
6. In the **Required Information** box, paste your Cloudflare Zone ID from the **Overview** tab. The box shows what you type.
7. If Traefik is running, Deployrr asks more questions. See [If Traefik is running](#if-traefik-is-running).

Don't cancel the **Required Information** box. The install still finishes, but the Zone ID stays blank. If that happens, fill in `zone_identifier` in `config.json` by hand. See [Edit config.json](#edit-configjson).

Deployrr sets up the app with your **Domain 1** as the domain.

The install doesn't warn you if the token is empty. After the install, open `config.json` and check the `"token"` line. See [If the token is empty](#if-the-token-is-empty).

### If Traefik is running

Deployrr asks for these in order:

1. **Traefik Subdomain**. It suggests `ddnsupdater`.
2. A login method for the app.
3. In Advanced mode only, an exposure method: **Both**, **Internal** or **External**.

:::caution
This app holds your Cloudflare token. Choose **Internal** and pick a login method. Don't leave it open to the internet without a login. See [Choose a login method](/reverse-proxy/choose-login-method/) and [Simple vs Advanced Traefik mode](/reverse-proxy/simple-vs-advanced-mode/).
:::

## Edit config.json

You edit `appdata/ddns-updater/config.json` in the next two sections. The steps are the same each time.

:::caution
The config file holds your Cloudflare token. Keep it private. Don't share it, and don't paste it in Discord or in a support post. Remove the token from anything you share.
:::

1. Go to your Docker folder. The `cdd` command comes from the [Deployrr bash aliases](/using-deployrr/bash-aliases/). Without the aliases, use `cd` with the full path of your Docker folder.

   ```bash
   cdd
   ```

2. Back up the config file:

   ```bash
   cp appdata/ddns-updater/config.json appdata/ddns-updater/config.json.bak
   ```

3. Open the file:

   ```bash
   sudo nano appdata/ddns-updater/config.json
   ```

4. Make your change, then save the file.
5. Restart the app:

   ```bash
   sudo docker restart ddns-updater
   ```

If the file has a typo, copy the `.bak` file back over it and restart again.

## Set the record to gray cloud

The config Deployrr writes has `"proxied": true`. DDNS Updater then turns the root A record orange (proxied) in Cloudflare. Domain Checks wants the record gray (DNS only). See [Fix orange cloud records](/networking/domain-checks-failed/#fix-orange-cloud-records). To see why a proxied record fails the checks, watch [Deployrr 5 walkthrough: Domain Checks at 41:21](https://youtu.be/rdqbAr0TFnQ?t=2481) (shows Deployrr v5; menus and steps differ in v6).

If you follow the gray-cloud setup, change that setting to `false`.

1. Follow the steps in [Edit config.json](#edit-configjson).
2. In step 4, find the line `"proxied": true,` and change it to:

   ```json
   "proxied": false,
   ```

## If the token is empty

Deployrr copies the token from the Traefik Preparation step into the config. If you never ran that step, the `"token"` value in `config.json` is empty and DDNS Updater can't change your record.

1. In Cloudflare, go to **My Profile** > **API Tokens**. Make a user token, not an Account API token. Give it these two permissions:
   - Zone / Zone / Read
   - Zone / DNS / Edit

   See [Fix the Cloudflare token](/reverse-proxy/certificate-errors/#fix-the-cloudflare-token) for more.
2. Follow the steps in [Edit config.json](#edit-configjson).
3. In step 4, put the token between the quotes of the `"token"` line.

## After a reinstall

Every reinstall writes a fresh `config.json`. You lose `"proxied": false` and any token or Zone ID you added by hand. Do the edits again. Keep your `.bak` copy so you can compare. An app update with a new image leaves the file alone. See [Restart, Recreate or Reinstall](/using-deployrr/restart-recreate-reinstall/).

## Check it worked

1. Go to **Apps** > **Browse Apps**. The DDNS Updater line shows **[Running]**. **[Installed]** means it is installed but not running. See [Install and manage apps from the Apps menu](/apps/manage-apps/).
2. Open `http://SERVER_IP:8000` in a browser. Replace `SERVER_IP` with your server's LAN IP, and `8000` with your port if you changed it.
3. Read the log:

   ```bash
   sudo docker logs ddns-updater
   ```

   With the Deployrr bash aliases: `dlogs ddns-updater`. Press Ctrl+C to stop following the log.
4. In Cloudflare, open **DNS** > **Records**. The A record shows your current public IP, and the cloud is gray if you set `"proxied": false`.

## Subdomains

DDNS Updater only updates the root record. Deployrr's setup uses a wildcard CNAME (`*`) that points to your root domain, so your subdomains follow the root record.

If you made the wildcard an A record with an IP instead, it will not be updated. Change it to a CNAME that points to your root domain. See [DNS records Deployrr expects](/networking/domain-checks-failed/#dns-records-deployrr-expects). To see the root A record and wildcard CNAME made by hand, watch [Traefik 3 guide: Cloudflare settings at 7:35](https://youtu.be/KMZIyoZ3jWM?t=455) (manual Docker Compose setup).

## Are you behind CG-NAT?

A dynamic DNS updater can't help if your ISP puts many customers behind one shared public IP (CG-NAT). Port forwards on your router then do nothing. For the signs to look for and what to do, see the CG-NAT point in [Fix ports 80 and 443](/networking/domain-checks-failed/#fix-ports-80-and-443). For the options in v6, watch [Deployrr 6 overview: Options for CG-NAT at 4:37](https://youtu.be/Nuo83uzTWco?t=277). For background on how CG-NAT breaks port forwarding, read [UDMS part 18: CG-NAT](https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#CG-NAT) (manual setup).

## If it doesn't work

- **The web page does not open.** Check that the app is running and that you used the right port. If another app uses the port, see [Port already in use](/apps/port-already-in-use/).
- **The log shows an error from Cloudflare.** Check the Zone ID, the domain and the token in `config.json`. The token needs Zone / Zone / Read and Zone / DNS / Edit.
- **The record is still orange.** Set `"proxied": false` as shown above and restart the app.
- **Your IP changed and the record is old.** The app checks every 12 hours, so the record can stay old for a while. Read the log to see when it last checked.

## Related

- [Domain Checks failed in Prerequisites](/networking/domain-checks-failed/): the DNS records and gray cloud Deployrr expects.
- [Set up Traefik](/reverse-proxy/traefik-setup/): where you enter the Cloudflare token DDNS Updater reuses.
- [Certificate errors in Traefik](/reverse-proxy/certificate-errors/): how to fix the Cloudflare token.
- [Install and manage apps from the Apps menu](/apps/manage-apps/): status, logs and restart.
- [Choose a login method](/reverse-proxy/choose-login-method/): protect the app if you expose it.
