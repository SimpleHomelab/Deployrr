---
title: "Home Assistant behind Traefik: fix 400 Bad Request"
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
  - using-deployrr/second-app-instances
  - using-deployrr/custom-yml
  - reverse-proxy/check-traefik-logs
  - reverse-proxy/setup-auth-bypass-using-file-provider
  - reverse-proxy/multi-server-same-domain
further_reading:
  - title: Home Assistant HTTP integration (trusted_proxies)
    url: https://www.home-assistant.io/integrations/http/#trusted_proxies
last_reviewed: 2026-11-08
status: current
old_paths: ["/apps/home-assistant-behind-traefik"]
sources:
  - { type: discord, ref: "https://discord.com/channels/974306760171073556/1380094049729380462" }
---

Home Assistant is not an app you install from the Deployrr menu in v6. You run it somewhere else, for example as a Home Assistant OS VM, on another machine, or as a container you add yourself with [custom.yml](/using-deployrr/custom-yml/). This page shows how to put that Home Assistant behind the Traefik that Deployrr runs. It also fixes the `400: Bad Request` error that appears when you skip the Home Assistant side.

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

## Cause

Traefik forwards your request to Home Assistant. Home Assistant sees a request from Traefik's side, not from your browser. By default it refuses requests that arrive through a proxy. You must tell it which address to trust.

## Before you start

- You have a Plus or Pro license.
- Socket Proxy and Traefik Production are set up, and Traefik is running.
- Home Assistant is running and you can open it on your network at `http://HOME_ASSISTANT_IP:8123`.
- The machine that runs Deployrr can reach Home Assistant on that IP and port.
- You can edit Home Assistant's `configuration.yaml`.

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

:::note
Use `http` and port `8123` unless you turned on SSL inside Home Assistant. You shouldn't. Traefik handles the certificate for you.
:::

### Part 2: Trust Traefik in Home Assistant

1. Find the address Home Assistant sees the request from. Open the Home Assistant log and look for the `A request from a reverse proxy was received from` line. The address after `from` is the one to trust.

   If you see no such line yet, use the local IP address of the machine that runs Deployrr and Traefik. If Home Assistant runs as a container on that same machine, it may see a Docker address instead, such as one in `192.168.90.0/24`, the network Traefik uses. The log line tells you which.

2. Open `configuration.yaml` in Home Assistant.
3. Add an `http:` section. If you already have one, add the two new lines inside it. Replace `192.168.1.100` with the address from step 1.

   ```yaml
   http:
     use_x_forwarded_for: true
     trusted_proxies:
       - 192.168.1.100
   ```

   Keep the indentation exactly as shown. YAML is strict about spaces.

4. Save the file.
5. Restart Home Assistant. A full restart is needed for `http:` changes.

:::caution
Do not enable SSL in Home Assistant when you use it behind Traefik. Traefik ends the HTTPS connection for you.
:::

## Check it worked

1. Open `https://homeassistant.YOUR_DOMAIN` in your browser.
2. You should see the Home Assistant login page, not `400: Bad Request`.
3. Log in. The dashboard should load.

If you still get the error, look at the Home Assistant log again. The address in the new `A request from a reverse proxy was received from` line may differ from the one you trusted. Add that address to `trusted_proxies` and restart Home Assistant. If the page does not load at all, [read the Traefik logs](/reverse-proxy/check-traefik-logs/).

## Related

- [Run a second copy of an app](/using-deployrr/second-app-instances/): the Traefikify prompts and the rules file explained.
- [Add your own containers with custom.yml](/using-deployrr/custom-yml/): run Home Assistant as a container next to your Deployrr apps.
