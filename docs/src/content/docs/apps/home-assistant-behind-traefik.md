---
title: "Home Assistant behind Traefik: fix 400 Bad Request"
sidebar:
  label: Home Assistant behind Traefik
description: Put a Home Assistant that runs elsewhere behind Deployrr's Traefik, and fix the 400 Bad Request error by adding trusted proxies to configuration.yaml.
type: troubleshooting
tags:
  - traefik
  - remote-access
applies_to: v6.0+
symptoms:
  - "400: Bad Request"
  - "A request from a reverse proxy was received from 192.168.1.100, but your HTTP integration is not set-up for reverse proxies"
  - Home Assistant works on http://HOME_ASSISTANT_IP:8123 but shows a 400 error on https://homeassistant.YOUR_DOMAIN
  - How do I put Home Assistant behind Traefik with Deployrr
related:
  - apps/home-assistant-container
  - using-deployrr/second-app-instances
  - reverse-proxy/check-traefik-logs
  - reverse-proxy/setup-auth-bypass-using-file-provider
  - reverse-proxy/multi-server-same-domain
videos:
  - id: 6S9PwhAlZUs
    start: 543
    title: "Traefik guide: external HTTP apps behind Traefik with a file provider"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
further_reading:
  - title: Home Assistant HTTP integration (reverse proxies and trusted proxies)
    url: https://www.home-assistant.io/integrations/http/
  - title: "UDMS part 18: adding non-Docker or external apps behind Traefik"
    url: https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Adding_non-Docker_or_External_Apps_Behind_Traefik
last_reviewed: 2026-11-12
status: current
old_paths: ["/apps/home-assistant-behind-traefik"]
sources:
  - { type: discord, ref: "https://discord.com/channels/974306760171073556/1380094049729380462" }
---

Home Assistant is not an app you install from the Deployrr menu in v6. Install it the way Home Assistant's own guide recommends, for example as a Home Assistant OS VM or on another machine. If you still want it as a container, add it yourself with [custom.yml](/using-deployrr/custom-yml/). See [Run Home Assistant as a container with custom.yml](/apps/home-assistant-container/).

Putting that Home Assistant behind Deployrr's Traefik still works well, and this page shows how. It also fixes the `400: Bad Request` error that appears when you skip the Home Assistant side.

## Symptoms

You added Home Assistant to Traefik. The address `https://homeassistant.YOUR_DOMAIN` shows this instead of the login page:

```txt
400: Bad Request
```

Home Assistant logs this line. Your IP address will be different:

```txt
A request from a reverse proxy was received from 192.168.1.100, but your HTTP integration is not set-up for reverse proxies
```

Opening Home Assistant directly on `http://HOME_ASSISTANT_IP:8123` still works.

This page uses port `8123`. New Home Assistant OS installs from 2026.8 on use port `80` by default. Use the port you open Home Assistant on.

## Cause

Traefik forwards your request to Home Assistant. Home Assistant sees a request from Traefik's side, not from your browser. By default it refuses requests that arrive through a proxy. You must tell it which address to trust.

## Before you start

- You have a Plus or Pro license.
- Socket Proxy and Traefik Production are set up, and Traefik is running.
- Home Assistant is running and you can open it on your network at `http://HOME_ASSISTANT_IP:8123`.
- The machine that runs Deployrr can reach Home Assistant on that IP and port.
- You can change Home Assistant's settings as an administrator.

## Fix

### Part 1: Add Home Assistant to Traefik

If you already did this part, go to part 2. The same steps work for any app on another machine. See [Use one domain across several servers](/reverse-proxy/multi-server-same-domain/).

1. In Deployrr, go to **Proxy** > **Traefik** > **Traefikify**.
2. Read the **Traefikify** box and confirm that you want to proceed.
3. Answer the prompts:
   - Name of the app: `homeassistant`
   - Subdomain: `homeassistant`
   - Host IP address: the IP address of the machine that runs Home Assistant
   - WebUI protocol: `http`
   - WebUI port: `8123`
   Deployrr then tests the address. If you see `Connection to http://HOME_ASSISTANT_IP:8123 could not be verified`, setup still continues, but check the IP and port.
4. Pick an authentication method.
5. Pick an exposure method. In Simple Traefik mode, the only choice is **Both** (internal and external). Advanced mode, under **Proxy** > **Traefik** > **Traefik Mode**, adds **Internal** and **External**.

Deployrr shows a success box with the address, for example `https://homeassistant.YOUR_DOMAIN`. Traefik picks up the new file on its own, so you don't need to restart it.

Replace `YOUR_DOMAIN` with your own domain. Your DNS must send the subdomain to your server. See [Run a second copy of an app](/using-deployrr/second-app-instances/) for the same prompts in more detail and for what the rules file looks like.

To see the same idea done by hand with a rules file for an app on another machine, watch [Traefik guide: external HTTP apps behind Traefik at 9:03](https://youtu.be/6S9PwhAlZUs?t=543) (manual Docker Compose setup; Deployrr does this for you). For background on how it works, read [UDMS part 18: adding non-Docker or external apps behind Traefik](https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Adding_non-Docker_or_External_Apps_Behind_Traefik) (manual setup).

:::note
Use `http` and port `8123` unless you turned on SSL inside Home Assistant. You shouldn't. Traefik handles the certificate for you.
:::

### Part 2: Trust Traefik in Home Assistant

1. Find the address Home Assistant sees the request from. Open the Home Assistant log and look for the `A request from a reverse proxy was received from` line. The address after `from` is the one to trust.

   If you see no such line yet, use the local IP address of the machine that runs Deployrr and Traefik. If Home Assistant runs as a container on that same machine, it sees a Docker address instead, in `192.168.90.0/24` or `192.168.91.0/24`, the two networks Traefik is on. See [Run Home Assistant as a container](/apps/home-assistant-container/#put-it-behind-traefik).

2. In Home Assistant 2026.8 and later, go to **Settings** > **System** > **Network**, to the **HTTP server** section.
3. Turn on **Trust X-Forwarded-For**.
4. Under **Trusted proxies**, add the address from step 1, for example `192.168.1.100`.
5. Save. Home Assistant restarts. Confirm the new settings when asked, or it goes back to the old ones after 5 minutes.

On versions before 2026.8, add an `http:` section to `configuration.yaml` instead, then restart Home Assistant. If you already have one, add the two new lines inside it. Keep the indentation exactly as shown.

```yaml
http:
  use_x_forwarded_for: true
  trusted_proxies:
    - 192.168.1.100
```

When you update to 2026.8 or later, Home Assistant moves this block into the UI by itself and then ignores it.

:::caution
Do not enable SSL in Home Assistant when you use it behind Traefik. Traefik ends the HTTPS connection for you.
:::

## Check it worked

1. Open `https://homeassistant.YOUR_DOMAIN` in your browser.
2. You should see the Home Assistant login page, not `400: Bad Request`.
3. Log in. The dashboard should load.

If you still get the error, look at the Home Assistant log again. The address in the new `A request from a reverse proxy was received from` line may differ from the one you trusted. Add that address to the trusted proxies and save again. If the page does not load at all, [read the Traefik logs](/reverse-proxy/check-traefik-logs/).
