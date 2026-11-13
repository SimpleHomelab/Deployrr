---
title: "Setup Mode: Local or Hybrid"
description: Choose between Local and Hybrid Setup Mode in Deployrr v6, see what each needs, and learn how it differs from Traefik Mode and Proxy Type.
type: guide
tags:
  - install
  - domain
  - traefik
  - remote-access
applies_to: v6.0+
related:
  - getting-started/licenses
  - reverse-proxy/traefik-setup
  - reverse-proxy/simple-vs-advanced-mode
  - reverse-proxy/nginx-proxy-manager
  - reverse-proxy/multi-server-same-domain
further_reading:
  - title: "UDMS part 18: Requirements for a Traefik setup"
    url: "https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Requirements_for_Docker_Traefik_Setup"
videos:
  - id: rdqbAr0TFnQ
    start: 421
    title: "Deployrr 5 walkthrough: Local vs Hybrid mode"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: KMZIyoZ3jWM
    start: 455
    title: "Traefik 3 guide: Cloudflare A and CNAME DNS records"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
last_reviewed: 2026-11-13
status: current
old_paths: []
sources: []
sidebar:
  order: 6
---

Setup Mode tells Deployrr whether your apps are for your home network only (Local) or can also be reached from the internet (Hybrid). This guide helps you pick one, lists what Hybrid needs, and explains how Setup Mode differs from the Traefik and proxy settings.

## Overview

**Setup Mode** is an item in the **Prerequisites** menu. Its description reads `Toggle how Apps are setup - Local` or `Toggle how Apps are setup - Hybrid`. If you never set it, it shows Local.

It is a toggle. Each time you select it, it switches to the other mode and shows a **Server Setup Mode** box that says which mode is now enabled.

You can switch with any license. What each mode needs depends on your license. See [Licenses](/getting-started/licenses/).

## Local or Hybrid

| | Local | Hybrid |
|---|---|---|
| Who can reach your apps | Your internal network only | Some or all apps can be reached from the internet through a reverse proxy |
| Domain name | Not required | Required |
| Reverse proxy, port forwarding, Cloudflare DNS, SSL mode, DNS records | Not required | Required |
| License | Basic, Plus or Pro | Plus or Pro (login apps need Pro) |

Pick **Local** if you only use your apps at home. Pick **Hybrid** if you want addresses such as `https://app.YOUR_DOMAIN` that also work from outside.

To see the two modes toggled on screen, watch [Deployrr 5 walkthrough: Local vs Hybrid mode at 7:01](https://youtu.be/rdqbAr0TFnQ?t=421) (shows Deployrr v5; menus differ in v6).

:::note
With a Free license, the **Server Setup Mode** box says `NOTE: With Free license, this setting has no effect.` The toggle still works, but Socket Proxy, the Deployrr Dashboard and apps show a **License Required** box.
:::

## What Hybrid needs

When you switch to Hybrid, the box lists eight requirements:

1. A domain name. It can come from any registrar.
2. Deployrr Plus or Pro.
3. A reverse proxy (Traefik).
4. Port forwarding from your gateway, firewall or router to the Docker host, for ports 80 and 443.
5. Cloudflare for DNS.
6. A DNS A record for the domain that points to your WAN IP.
7. A DNS CNAME record for `*` that points to `@`.
8. Cloudflare SSL mode set to FULL.

Set the SSL mode to **Full** even though your DNS records stay gray cloud. See [Orange cloud or gray cloud](/networking/cloudflare/#orange-cloud-or-gray-cloud).

Meet these before you set up Traefik. See [Set up Traefik](/reverse-proxy/traefik-setup/). If **Domain Checks** fails, see [Domain Checks failed](/getting-started/domain-checks-failed/).

To see the DNS records made by hand, watch [Traefik 3 guide: Cloudflare A and CNAME DNS records at 7:35](https://youtu.be/KMZIyoZ3jWM?t=455) (manual Docker Compose setup). To understand the same requirements in a manual setup, read [UDMS part 18: Requirements for a Traefik setup](https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Requirements_for_Docker_Traefik_Setup) (manual setup).

## What Local needs

The **Server Setup Mode** box for Local says apps are exposed on the internal network only. You need no reverse proxy, domain name, port forwarding, Cloudflare DNS, SSL mode or DNS records. It lists one requirement: Deployrr Basic, Plus or Pro.

In Local mode, these **Prerequisites** items show `NOT-REQUIRED`:

- **Domain 1**
- **Domain Checks**

## Set the mode

Do **Disclaimers** in **Prerequisites** first. If you did not, you see a **Requirements Not Met** box.

1. From the main menu, select **Prerequisites**.
2. Check the mode shown next to **Setup Mode**.
3. Select **Setup Mode**.
4. Read the **Server Setup Mode** box. It says `Hybrid mode ENABLED` or `Local mode ENABLED`.
5. If you landed on the wrong mode, select **Setup Mode** again.

### Recommended order of steps

**Help** > **Usage** shows the order Deployrr recommends. Deployrr tells you about any missing requirement at each step.

Local mode:

1. Prerequisites.
2. Make sure Local mode is enabled.
3. Socket Proxy.
4. Deployrr Dashboard.
5. Apps.

Hybrid mode:

1. Prerequisites.
2. Make sure Hybrid mode is enabled.
3. Socket Proxy.
4. Traefik.
5. Deployrr Dashboard.
6. Google OAuth or Authelia.
7. Apps.

## What you see in Local mode

- **Domain 1**: a **Domain Configuration** box says `Domain is NOT REQUIRED in Local mode.` You can still set a domain if you plan to use Hybrid later.
- After you add a domain in Local mode, a **Setup Mode Warning** asks `Switch to Hybrid mode?` Answer yes to switch. You then see a **Setup Mode Changed** box. Answer no to stay in Local.
- **Domain Checks**: a **Domain Checks Not Required** box says `Domain checks are not required in Local mode.`
- **Proxy** > **Proxy Type**: a **Proxy Type - Local Mode Warning** box says no reverse proxy is used and changes have no effect until you switch to Hybrid. You can still continue.

In Hybrid mode, the **Prerequisites** status needs a domain and finished **Domain Checks**. In Local mode it does not.

## Features that need Hybrid

If Setup Mode is not Hybrid, these items show a **Requirements Not Met** box:

```txt
Hybrid Mode - Setup Mode must be Hybrid. Current: Local (Prerequisites menu)
```

The items are:

- Traefik **Preparation**, **Staging**, **Production** and **Manage Exposure**
- **NPM** > **Install** (Nginx Proxy Manager)
- **Security** > **Authelia**, **Authentik**, **Google OAuth**, **TinyAuth** and **Manage Auth**

The box lists every missing item at once, so you may see the Hybrid line next to others, such as a license or Traefik not running. Switch to Hybrid in **Prerequisites** > **Setup Mode**, fix the other items, then try again. [Deployrr shows "Requirements Not Met"](/getting-started/requirements-not-met/) explains every line the box can list.

**Traefikify**, **Un-Traefikify** and **Traefik Mode** don't check Setup Mode. They have their own requirements.

## Setup Mode, Traefik Mode and Proxy Type

These are three separate settings.

| Setting | Where | What it decides |
|---|---|---|
| **Setup Mode** | **Prerequisites** | Local (home network only) or Hybrid (internet access through a reverse proxy) |
| **Proxy Type** | **Proxy** | Which reverse proxy you use: Traefik or Nginx Proxy Manager |
| **Traefik Mode** | **Proxy** > **Traefik** | Simple or Advanced: which ports you forward, and whether you can set each app to Internal, External or Both |

Set Setup Mode to Hybrid first. Then pick a proxy. Traefik Mode needs **Proxy Type** set to Traefik first.

- To use Traefik, follow [Set up Traefik](/reverse-proxy/traefik-setup/). Then choose a Traefik Mode with [Simple vs Advanced Traefik mode](/reverse-proxy/simple-vs-advanced-mode/).
- To use Nginx Proxy Manager instead, follow [Use Nginx Proxy Manager instead of Traefik](/reverse-proxy/nginx-proxy-manager/).
- Traefik needs a Plus or Pro license. The login apps need Pro. See [Choose a login method](/reverse-proxy/choose-login-method/).

## Switch modes later

1. Go to **Prerequisites** > **Setup Mode**.
2. Select it once to switch.
3. Read the **Server Setup Mode** box.

When you switch to Local, Deployrr clears your **Proxy Type** without a message. If you switch back to Hybrid, pick your proxy again in **Proxy** > **Proxy Type**.

You can also run more than one server on one domain. The main server runs Hybrid and the others run Local. See [Use one domain across several servers](/reverse-proxy/multi-server-same-domain/).

## Next steps

- Picked Hybrid? [Set up Traefik](/reverse-proxy/traefik-setup/).
- Check what your license unlocks in [Licenses](/getting-started/licenses/).
