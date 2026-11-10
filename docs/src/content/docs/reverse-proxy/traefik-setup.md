---
title: Set up Traefik
description: Pick Traefik as your proxy, then run Preparation, Staging and Production in Deployrr v6 to get working HTTPS addresses for your apps.
type: how-to
tags:
  - traefik
  - domain
  - remote-access
  - ports
apps:
  - traefik
applies_to: v6.0+
related:
  - getting-started/quick-start
  - reverse-proxy/check-traefik-logs
  - networking/opnsense-conflict
  - reverse-proxy/restrict-access-using-ip-allowlist
  - networking/ufw-firewall-vps
further_reading: []
last_reviewed: 2026-11-09
status: current
old_paths: []
sources: []
---

Traefik is the reverse proxy that gives your apps their own web addresses, such as `https://traefik.YOUR_DOMAIN`, with HTTPS. This page walks you through the Deployrr setup: pick Traefik, run **Preparation**, **Staging** and **Production**, then decide what to do next.

## Before you start

- Finish the steps in the [Quick start](/getting-started/quick-start/): **Prerequisites**, Setup Mode set to **Hybrid**, and Domain Checks.
- You need a Deployrr Plus or Pro license.
- Your domain uses Cloudflare as its DNS provider. The domain can come from any registrar that lets you change the DNS servers to Cloudflare.
- The DNS records for your domain point to your public IP. That means an A record for the domain and a wildcard record (`*.YOUR_DOMAIN`, often a CNAME). Set both to DNS only (grey cloud) in Cloudflare. With the Cloudflare proxy (orange cloud) on, Domain Checks sees a different IP and fails with "Cloudflare proxy is probably enabled/orange-clouded".
- Make a Cloudflare DNS API token. In Cloudflare, go to **My Profile** > **API Tokens**. Use a user token, not an Account API Token. Give it these two permissions:
  - Zone / Zone / Read
  - Zone / DNS / Edit
- The **Socket Proxy** app is running. You can check it in the **Docker** menu.
- Ports 80, 81, 443 and 444 are free on your server.
- If you use Nginx Proxy Manager (NPM), Deployrr will offer to stop it. It stops it and does not remove it. NPM and Traefik both need ports 80 and 443. To use NPM instead of Traefik, see [Use Nginx Proxy Manager instead of Traefik](/reverse-proxy/nginx-proxy-manager/).

## Steps

### Pick Traefik as your proxy type

1. In Deployrr, open **Proxy** > **Proxy Type** ("Pick a Reverse Proxy").
2. Select **Traefik** ("Advanced Dynamic Reverse Proxy and Load Balancer").
3. Read the intro box. It ends with "Do you want to set Traefik as your Proxy Type?". Confirm.
4. If Deployrr asks to stop NPM, agree.

This step turns Traefik on in your compose file ("Enabling traefik.yml in compose file...") and turns NPM off ("Disabling npm.yml in compose file..."). You need it before you can use **Traefik Mode**.

:::caution
If Setup Mode is **Local**, you see a "Proxy Type - Local Mode Warning" box. Your changes have no effect until you switch to **Hybrid**. Go to **Prerequisites** > **Setup Mode**, pick **Hybrid**, then come back.
:::

### Choose Simple or Advanced mode (optional)

Traefik has two modes. This choice decides which ports you forward on your router. Until you pick one, the **Traefik Mode** entry shows "NOT SET", and Manage Exposure and Traefikify behave as in Simple mode. You can also change it later. To compare the modes in more detail, see [Simple vs Advanced Traefik mode](/reverse-proxy/simple-vs-advanced-mode/).

| Mode | Router port forwards | What you get |
| --- | --- | --- |
| Simple | 80 to 80 and 443 to 443 on your Docker host | Every app opens on your LAN and from the internet. |
| Advanced | 80 to 81 and 443 to 444 on your Docker host | You can make each app internal, external or both. |

1. Open **Proxy** > **Traefik** > **Traefik Mode** ("Toggle how apps are exposed").
2. Read the box. It names the mode you switched to ("Simple mode ENABLED" or "Advanced mode ENABLED") and the port forwards it needs. The first time, you get Simple. Each time you select **Traefik Mode** after that, it toggles between Simple and Advanced. Select it again if you got the wrong one.

   If you see a "Proxy Type Required" box, do [Pick Traefik as your proxy type](#pick-traefik-as-your-proxy-type) first. If you see "Requirements Not Met", read and acknowledge the **Disclaimers** in **Prerequisites** first.
3. Set up the matching port forwards on your router.

:::note
In Advanced mode, local traffic can count as external if your router has no hairpinning and you have no local DNS with rewrites, such as Pi-hole or AdGuard Home. Then apps you made internal only may not open by their domain name. Turn on hairpinning on your router, or set up local DNS rewrites.
:::

### Run Preparation

1. Open **Proxy** > **Traefik** > **Preparation** ("Traefik Preparation"). After it finishes, this entry shows "- DONE".
2. Read the first box. It lists what you need: the Cloudflare token, its permissions, Cloudflare as your DNS provider, and a valid domain.
3. Select **Yes** to continue. It is the button on the right. Enter picks **No** by default, so move to **Yes** first.
4. If a **Requirements Not Met** box appears (with the number of missing items), it lists what is missing. Fix those items and start again. The requirements are:
   - All **Prerequisites** done
   - Setup Mode **Hybrid**
   - Socket Proxy running
   - A Plus or Pro license
5. If you see "It appears that Traefik preparation was already done. If you proceed, previous setup may be overwritten.", press `Y` only if you want to redo it.
6. In the **Traefik Secrets** form, fill in these fields:
   - **Basic Auth Username**
   - **Basic Auth Password**
   - **Cloudflare DNS API Token**
7. If a password exists already, you can leave the password blank to keep it ("Leave password blank to keep existing").
8. Type the password again in **Confirm Basic Auth Password**.
9. Wait for the 11 steps to finish. You should see "Traefik Preparation completed successfully" and "You can now proceed to Traefik Staging to obtain SSL certificates".

The basic auth username and password become the login for basic auth protection, until you set up a stronger login.

If Preparation stops with an error, use this table.

| Message | What to do |
| --- | --- |
| Username and Cloudflare API Token are required. | Fill in both fields. |
| Incomplete or incorrect information. All secrets are required. | Fill in every field in the form. |
| Traefik preparation was cancelled. or Password confirmation was cancelled. | You closed a form. Run Preparation again. |
| Password cannot be empty. | Type a password. |
| Passwords do not match. | Type the same password in both fields. |
| Invalid Cloudflare token. Please check token permissions. | Make a new user token with Zone / Zone / Read and Zone / DNS / Edit. |
| Port N is occupied. This is needed for Traefik. | Stop whatever uses that port (443, 444, 80 or 81), then run Preparation again. |

### Run Staging

Staging gets test certificates from the Let's Encrypt staging server. This keeps you away from the real rate limit while you check that everything works.

1. Open **Proxy** > **Traefik** > **Staging** ("Setup Traefik Staging"). It needs the same things as Preparation, and Preparation done.
2. If you ran Staging or Production before and certificates exist, you see a warning that it was already done. Press `Y` to continue.
3. If your existing certificate is a staging one, Deployrr asks "Reuse existing staging SSL certificate? Press Y/y to reuse or any other key to create new certificates". Press `Y` to reuse. Press any other key to get new ones. If it is a production certificate, Staging deletes it without asking and gets a new staging one.
4. Wait while Traefik starts. The first start can take a few minutes because Deployrr downloads the Traefik image.
5. Wait while Deployrr watches the logs. You see "Monitoring traefik logs for progress (this can take up to 15 min)...". Progress lines such as these are normal:
   - Obtaining bundled SAN certificate
   - Waiting for DNS propagation
   - The server validated our request
   - Validations succeeded; requesting certificates
6. Wait for "Traefik Staging Setup completed successfully".
7. Open `https://traefik.YOUR_DOMAIN` in your browser. Replace `YOUR_DOMAIN` with your domain. You should see the Traefik dashboard. A "Not Secure" warning is normal here, because staging certificates are test certificates.
8. Read the warning "Enable a strong authentication system from the 'Security' menu." You do that after Production.

If Staging fails, find your message here.

| Message | What to do |
| --- | --- |
| Failed to find zone | The Cloudflare token is wrong. It needs Zone / Zone / Read and Zone / DNS / Edit. |
| Could not find DNS validation TXT record | In Cloudflare, delete all `_acme-challenge` TXT records for your domain (Deployrr's hint spells it `_acme_challenge`). Run Staging again. |
| Cannot get ACME client get directory. Possible DNS server issue. | Check your router DNS settings and that your server has internet access. |
| Unable to obtain ACME certificate | Check the token. If you use an advanced firewall such as UDM or OPNsense, see [Traefik staging fails on OPNsense](/networking/opnsense-conflict/). |
| Getting certificate failed with error 429 | You hit the Let's Encrypt rate limit. Wait at least 24 hours. |
| Timed out. Could not verify if Traefik is running. | Read the Traefik log. See [Read the Traefik logs](/reverse-proxy/check-traefik-logs/). |
| Staging certificate could not be verified. Try re-running Deployrr. | Close Deployrr, start it again and repeat Staging. |

### Run Production

Production switches Traefik to real Let's Encrypt certificates. Browsers trust them.

1. Open **Proxy** > **Traefik** > **Production** ("Setup Traefik Production"). It needs Staging done and Traefik running.
2. If Production was done before, or a production certificate exists, you see a warning. Press `Y` to continue.
3. If you have production certificates already, Deployrr asks "Reuse existing production SSL certificate?". Press `Y` to reuse them and skip getting new ones.
4. Wait while Deployrr watches the logs. You see the same progress lines as in Staging. Production can take several minutes.
5. Wait for "Traefik Production Setup completed successfully".
6. Note the addresses it shows:
   - **Traefik Dashboard URL:** `https://traefik.YOUR_DOMAIN`
   - **Local Access (LAN):** `http://SERVER_IP:8080`
   - The Deployrr Dashboard URL, if the Deployrr Dashboard is running. By default it is `https://deployrr.YOUR_DOMAIN`.

   Deployrr also adds the Traefik dashboard, and the Deployrr Dashboard if it runs, to your Deployrr Dashboard.
7. Read the last message: "IMPORTANT: Enable a strong authentication system from the 'Security' menu."

:::note
The LAN address always shows port 8080. If 8080 was already in use during Preparation, Deployrr picked the next free port instead ("Port N assigned for Traefik dashboard"). Use that port. The LAN address has no login, so only use it inside your home network.
:::

Deployrr keeps the old log as `traefik_staging.log` and starts a fresh `traefik.log`.

Production shows the same errors as Staging, plus these:

| Message | What to do |
| --- | --- |
| Real LetsEncrypt certificate could not be verified. (or "... after restart.") | Check the Traefik log as described in [Read the Traefik logs](/reverse-proxy/check-traefik-logs/), then run Production again. |
| Traefik container did not start within 5 minutes | Check the Traefik log, then run Production again. The Deployrr Dashboard entries are skipped this time ("Dashboard registration skipped"). |

## Check it worked

1. Open `https://traefik.YOUR_DOMAIN` in your browser.
2. Check that the browser shows a padlock and no "Not Secure" warning.
3. Log in with the basic auth username and password you chose in Preparation.
4. Check that Traefik is running:

   ```bash
   dps
   ```

   Without the Deployrr bash aliases, run:

   ```bash
   sudo docker ps -a
   ```

   You should see `traefik` with a status that starts with "Up".

## What to do next

- Install apps from **Apps** > **Browse Apps**. For apps that support Traefik, Deployrr asks for a subdomain (the app name without hyphens by default) and a login method, then sets up the route for you. In Advanced mode it also asks you to pick an exposure method: Both, Internal or External. Cancel picks Internal.
- The **Proxy** > **Traefik** menu has more tools once Production is done: **Manage Exposure**, **Traefikify**, **Un-Traefikify**, **Domain Passthrough** and **Auth Bypass**.
- Add login protection from the **Security** menu. You can choose Authelia, Authentik, Google OAuth or TinyAuth. See [Choose a login method](/reverse-proxy/choose-login-method/).
- Put an app that Deployrr did not install behind Traefik with **Proxy** > **Traefik** > **Traefikify**. See [Put any app behind Traefik with Traefikify](/reverse-proxy/traefikify/), or [Home Assistant behind Traefik](/apps/home-assistant-behind-traefik/) or [Use one domain across several servers](/reverse-proxy/multi-server-same-domain/) for examples.
- Limit who can reach an app with [an IP allowlist](/reverse-proxy/restrict-access-using-ip-allowlist/).
- Block known bad visitors with [CrowdSec](/reverse-proxy/crowdsec/).
- If your server is a VPS, see [Fix the UFW firewall on a VPS](/networking/ufw-firewall-vps/).

## Related

- [Quick start](/getting-started/quick-start/): Prerequisites, Setup Mode and Domain Checks.
- [Read the Traefik logs](/reverse-proxy/check-traefik-logs/): find out why a certificate or route fails.
- [Traefik staging fails on OPNsense](/networking/opnsense-conflict/): fix certificate errors caused by a firewall that filters DNS.
- [Allow only some IP addresses to reach an app](/reverse-proxy/restrict-access-using-ip-allowlist/): let only chosen addresses reach an app.
- [Fix the UFW firewall on a VPS](/networking/ufw-firewall-vps/): fix apps that can't reach the internet or show certificate errors on a VPS.
