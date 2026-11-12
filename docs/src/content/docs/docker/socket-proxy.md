---
title: "Socket Proxy: what it is, which apps need it and what to do when it stops"
description: Install Socket Proxy from the Docker menu, see which apps need it, and fix it when it shows STOPPED or apps can't see your containers.
type: guide
tags:
  - docker
  - install
  - app-networking
  - logs
applies_to: v6.0+
apps: [socket-proxy]
related:
  - getting-started/requirements-not-met
  - getting-started/licenses
  - reverse-proxy/traefik-setup
  - using-deployrr/stack-manager
  - using-deployrr/bash-aliases
further_reading:
  - title: "UDMS part 14: Socket Proxy and how apps reach the Docker socket"
    url: https://www.simplehomelab.com/udms-14-docker-media-server/
videos:
  - id: rdqbAr0TFnQ
    start: 1573
    title: "Deployrr 5 walkthrough: Socket Proxy setup"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: THuLgGwq0vg
    start: 940
    title: "Ultimate Docker Server: Docker Socket Proxy with Docker Compose"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
last_reviewed: 2026-11-11
status: current
old_paths: []
sources: []
sidebar:
  order: 1
---

Socket Proxy is a small helper app that Deployrr installs from the **Docker** menu. Traefik, the Deployrr Dashboard and many other apps need it. This guide shows what it does, how to install it, which apps need it and what to do when it is not running.

## Overview

Docker apps that watch or manage other containers need to talk to Docker. Many guides give each of those apps full access to Docker by mounting the Docker socket into it.

Deployrr does it another way for its core apps and most dashboard and monitoring apps. Socket Proxy is the container that touches the Docker socket. Those apps ask Socket Proxy for what they need. Socket Proxy only answers the requests it allows, so each app gets less power than direct access. A few apps still mount the Docker socket themselves.

To see what Socket Proxy does and how it is built by hand, watch [Ultimate Docker Server: Docker Socket Proxy at 15:40](https://youtu.be/THuLgGwq0vg?t=940) (manual setup, Deployrr does these steps for you). For background on how apps reach the Docker socket, read [UDMS part 14: Socket Proxy and how apps reach the Docker socket](https://www.simplehomelab.com/udms-14-docker-media-server/) (manual setup).

You install it once. After that, the apps that need it find it on their own. There is no web page for it and nothing to log in to.

## Install Socket Proxy

### Before you start

- You finished **Prerequisites**. See the [Quick start](/getting-started/quick-start/) and [Prerequisites, step by step](/getting-started/prerequisites/).
- You have a Basic, Plus or Pro license. See [Licenses](/getting-started/licenses/).

### Steps

1. Start Deployrr.
2. Choose **Docker** from the main menu.
3. Look at the **Socket Proxy** line. It ends with one of these:
   - `NOT INSTALLED`: you have not installed it yet.
   - `RUNNING`: it is installed and running.
   - `STOPPED`: it is installed but not running. See [When Socket Proxy is not running](#when-socket-proxy-is-not-running).
4. Choose **Socket Proxy**. The line reads `Setup Socket Proxy`.
5. In the **Socket Proxy Installation** box, read the text. Choose **Yes** to install.
6. Wait while Deployrr works. You see these steps in the terminal:
   - `Checking requirements...`, then `All requirements met`
   - `Copying configuration files...`
   - `Starting Socket Proxy container...`
   - `Waiting for Socket Proxy to initialize...`, then `Socket Proxy is running`
7. Look for `Socket Proxy installed successfully!`.

To see the older Deployrr 5 install, watch [Deployrr 5 walkthrough: Socket Proxy setup at 26:13](https://youtu.be/rdqbAr0TFnQ?t=1573) (Deployrr v5, menus and steps differ in v6).

If Socket Proxy is already installed, Deployrr asks first. The box is titled **Already Installed**. It says `socket-proxy is already running` or `socket-proxy is already installed`. It tells you that reinstalling stops the existing container, recreates it with the latest image and keeps your data volumes. Choose **Yes** only if you want that.

:::note
If you choose **No** in the **Already Installed** box, the terminal still shows `Socket Proxy deployment failed`. Deployrr treats the cancel as a failed install. If you meant to cancel, you can ignore the message.
:::

### Check it worked

1. Go back to the **Docker** menu.
2. The **Socket Proxy** line ends with `RUNNING`.

The main menu also shows a status next to **Docker**. It reads `DONE` when both Socket Proxy and the Deployrr Dashboard are running. It reads `PARTIAL` when only one is running. It reads `INCOMPLETE` when one is installed but neither is running. It shows nothing before you install either one.

### If Deployrr stops with a box

- **License Required**: you see `This app requires a Basic, Plus, or Pro license.` Upgrade, run **Prerequisites** > **Verify**, then try again. See [Licenses](/getting-started/licenses/).
- **Requirements Not Met**: finish what the box lists, then try again. See [Deployrr shows "Requirements Not Met"](/getting-started/requirements-not-met/).
- `Socket Proxy deployment failed`: the install did not finish. Read the messages above it in the terminal. For a timeout, see [Deployrr times out waiting for a container to start](/docker/waiting-for-container/).
- `is malformed (missing placeholders)`: your main compose file is damaged. See [Docker environment setup fails with: docker-compose file is malformed](/docker/compose-malformed/).

## Which apps need Socket Proxy

Deployrr checks for Socket Proxy before it installs these. If it is missing, you see a box or a message instead of an install.

### Traefik and login apps

These show a **Requirements Not Met** box with this line:

```txt
Socket Proxy - Must be running (Docker menu)
```

- **Proxy** > **Traefik** > **Preparation**, **Staging** and **Production**
- **Proxy** > **Traefik** > **Manage Exposure**, **Traefikify**, **Un-Traefikify**, **Domain Passthrough** and **Auth Bypass**
- **Security** > **Authelia**, **Authentik**, **Google OAuth** and **TinyAuth** (these also need a Pro license)

See [Set up Traefik](/reverse-proxy/traefik-setup/) for the full Traefik order.

### Deployrr Dashboard and apps from Browse Apps

These show a message in the terminal:

```txt
Required app not running
[REQUIRED] socket-proxy must be installed and running first
```

- Deployrr Dashboard. See [Set up and maintain the Deployrr Dashboard](/using-deployrr/dashboard/).
- Portainer
- Dozzle and Dozzle Agent
- Homepage, Homarr, Homer, Dashy and Flame
- Glances
- Dockwatch, Dockpeek, Dockhand and DweebUI
- [DeUnhealth](/apps/deunhealth/)
- Docker Garbage Collection

Install Socket Proxy, then start the install again.

### Apps that do not need it

Uptime Kuma and What's Up Docker (WUD) do not require Socket Proxy to install. They still join its network.

## When Socket Proxy is not running

Signs that Socket Proxy is down:

- The **Docker** menu shows `STOPPED` on the **Socket Proxy** line.
- A box says `Socket Proxy - Must be running (Docker menu)`.
- The terminal says `socket-proxy must be installed and running first`.
- Traefik, Portainer, Dozzle or another app can't see your containers.

### Start it

Stack Manager needs a Basic, Plus or Pro license.

1. Choose **Tools** > **Stack Manager** > **Start Container**. See [Stack Manager](/using-deployrr/stack-manager/).
2. At `Select an app to start:`, type the number of `socket-proxy` and press Enter. The list also offers `all` and `exit`. If it says `No exited containers found.`, Socket Proxy is not stopped.
3. Look for `socket-proxy started`.

If it does not stay up, use **Recreate** in the same menu. Pick `socket-proxy` from the list. Or run **Docker** > **Socket Proxy** again and choose **Yes** in the **Already Installed** box.

### Read its logs

With the [Deployrr bash aliases](/using-deployrr/bash-aliases/): `dlogs socket-proxy`. Press `Ctrl+C` to stop following.

Without the aliases:

```bash
sudo docker logs --tail 50 -f socket-proxy
```

### Check the state of your containers

With the Deployrr bash aliases: `dpss`. Without them:

```bash
sudo docker ps -a
```

Look for `socket-proxy` and its status.

### Restart the apps that use it

After Socket Proxy is back, an app that lost contact may still show an error. Use **Tools** > **Stack Manager** > **Recreate** on that app. Pick it from the list.

If Traefik is the app, see [Read the Traefik logs](/reverse-proxy/check-traefik-logs/).

## Where its files are

Deployrr keeps the Socket Proxy compose file in the `compose/HOSTNAME` folder inside your Docker folder. `HOSTNAME` is your server's hostname. The file is named `socket-proxy.yml`.

You do not need to edit it. [Stack Manager](/using-deployrr/stack-manager/) can start, stop and recreate it.

## Next steps

- Set up Traefik with [Set up Traefik](/reverse-proxy/traefik-setup/).
- Install the [Deployrr Dashboard](/using-deployrr/dashboard/). The **Docker** menu shows it right under Socket Proxy.

## Related

- [Deployrr shows "Requirements Not Met"](/getting-started/requirements-not-met/): every line the box can show and where to clear it.
- [Licenses](/getting-started/licenses/): which license you need for Socket Proxy.
- [Set up Traefik](/reverse-proxy/traefik-setup/): Traefik needs Socket Proxy first.
- [Stack Manager](/using-deployrr/stack-manager/): start, stop and recreate Socket Proxy.
- [Bash aliases](/using-deployrr/bash-aliases/): `dlogs` and `dpss` for checking containers.
