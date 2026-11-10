---
title: Set up and maintain the Deployrr Dashboard
description: Install the Deployrr Dashboard, open it, add apps with Dashify and Traefikify, and rebuild it with ReDash when it is out of date.
type: how-to
tags:
  - docker
  - traefik
  - remote-access
applies_to: v6.0+
apps:
  - deployrr-dashboard
  - traefik
related:
  - reverse-proxy/traefik-setup
  - using-deployrr/stack-manager
  - reverse-proxy/multi-server-same-domain
  - reverse-proxy/point-root-domain-to-a-dashboard
  - getting-started/move-from-v5
further_reading:
  - title: Homepage documentation
    url: https://gethomepage.dev/
last_reviewed: 2026-11-10
status: current
old_paths: []
sources: []
---

The Deployrr Dashboard is one web page with a link to each of your apps. Deployrr adds new apps to it for you. This page shows how to install it, open it, add apps by hand, and fix it when it no longer matches what you have installed.

The dashboard is based on Homepage. The install box says "Based on Homepage". In general, Homepage is an open source dashboard.

## Before you start

- You finished all **Prerequisites** steps. If a step is missing, **Dashify**, **ReDash** and **Traefikify** show a **Requirements Not Met (N)** box that says "Prerequisites - All steps must be completed". See the [Quick start](/getting-started/quick-start/).
- You have a Basic, Plus or Pro license. On a Free license, installing the dashboard shows a **License Required** box with "ACCESS DENIED" and "This app requires a Basic, Plus, or Pro license". **Tools** > **Dashify** and **Tools** > **ReDash** need the same license.
- Socket Proxy is installed and running. Open **Docker** > **Socket Proxy** to set it up. It needs a Basic, Plus or Pro license too. Without it, Deployrr says "Required app not running" and "socket-proxy must be installed and running first".
- **Traefikify** needs a Plus or Pro license, Socket Proxy running, Traefik Production done and Traefik running.

## Install the dashboard

1. In Deployrr, open **Docker** from the main menu.
2. Select **Deployrr Dashboard** ("Auto-populating Dashboard"). The status next to it shows **RECOMMENDED** if it is not installed yet.
3. Read the **Deployrr Dashboard Installation** box. Select **Yes** to continue.
4. If the dashboard is already installed, Deployrr asks "Already Installed" and says reinstalling stops the container and recreates it with the latest image. Select **Yes** only if you want that.
5. At **Port Configuration**, read "Enter the port for Deployrr Dashboard". Deployrr suggests the first free port from 3050. Press Enter to accept it, or type a port from 1024 to 65535.
6. If Traefik is running (Staging or Production), Deployrr also shows a **Traefik Subdomain** box. See [Open the dashboard through your domain](#open-the-dashboard-through-your-domain) below.
7. Wait for "Deployrr Dashboard installed successfully!"

Deployrr adds Socket Proxy and Traefik (if Traefik runs) to the new dashboard. It then prints:

- "Access your Dashboard: http://SERVER_IP:PORT"
- "Moving forward, the Dashboard will automatically populate when apps are installed."

:::note
Deployrr only adds apps that you install after the dashboard exists. The **Docker** menu says "not retroactive!" for this reason. Use **ReDash** below to add the apps you installed earlier.
:::

## Open the dashboard

Use the address that Deployrr printed at the end of the install. It has your server's local IP address and the port you picked. The default port is 3050. Replace `SERVER_IP` and `PORT` with your values:

```text
http://SERVER_IP:PORT
```

### Open the dashboard through your domain

There are two ways to get a domain address. Which one applies depends on the order you did things.

**You set up Traefik Production while the dashboard was running.** Deployrr gives the dashboard the address below. Replace `YOUR_DOMAIN` with your domain. See [Set up Traefik](/reverse-proxy/traefik-setup/).

```text
https://deployrr.YOUR_DOMAIN
```

**You installed the dashboard while Traefik was running** (Staging or Production). During the install, Deployrr shows a **Traefik Subdomain** box:

1. Read "Enter a subdomain for Deployrr Dashboard". The default is `deployrrdashboard`. Press Enter to accept it, or type another subdomain.
2. At the authentication picker, pick a login method. [Choose a login method](/reverse-proxy/choose-login-method/) helps you pick.
3. In Traefik Advanced mode, Deployrr also shows **Pick an Exposure Method**. Pick how you reach the dashboard.

The dashboard then opens at your subdomain, for example `https://deployrrdashboard.YOUR_DOMAIN` with the default.

## What you see on the dashboard

Apps are grouped in three sections:

- **Apps (Local)**: web apps on this server, with a link to their local address (`http://SERVER_IP:PORT`).
- **Apps (Remote)**: the same apps through your domain (`https://SUBDOMAIN.YOUR_DOMAIN`). They show up here only when Traefik runs. Apps on other servers also go here.
- **Apps (Others)**: core services and apps without a web page, such as Socket Proxy.

Each entry has a name, a description, an icon, and a link. Many entries also show the container's CPU and memory use.

In Traefik Advanced mode, the exposure method decides where an app shows. An Internal app appears only under **Apps (Local)**. An External app appears only under **Apps (Remote)**. A Both app appears in both.

## Keep the dashboard in sync

Deployrr keeps the dashboard in step with your apps in these ways:

- When you install an app, Deployrr adds it, as long as the dashboard is running.
- When you reinstall an app, Deployrr removes its old entry and adds a new one, so you don't get duplicates.
- When you delete an app in [Stack Manager](/using-deployrr/stack-manager/), Deployrr removes its dashboard entry.
- When you run **Un-Traefikify** for an app that has a matching dashboard entry, Deployrr asks "Remove from Dashboard?". Say yes, then look for "Dashboard Updated".
- When your server's IP address changes, run **Tools** > **Change Server IP**. It updates the IP address in your dashboard entries, and in your Traefik routes.

If the dashboard is stopped when you install an app, the app is not added. Start the dashboard, then use **ReDash**.

## Add an app by hand with Dashify

Use Dashify for an app that Deployrr did not add. For example, an app that runs on another server or a container you set up yourself.

1. In Deployrr, open **Tools** from the main menu.
2. Select **Dashify** ("Manually Add Apps to Dashboard"). The status next to it shows **Available** when the dashboard is installed.
3. Answer the prompts:
   - **Dashify - App Name**: the name to show, for example `Portainer`.
   - **Dashify - Description**: a short text shown under the name.
   - **Dashify - Icon**: an icon name. Homepage supports `mdi-` icons (Material Design), `si-` icons (Simple Icons) and `sh-` icons (self-hosted icons), for example `mdi-docker` or `si-radarr`. If you leave it empty, Deployrr uses `mdi-application`.
   - **Dashify - Docker Host**: the default is your server's name followed by `-Docker`. It turns on CPU and memory stats. The stats work when the container name is the app name in lowercase with spaces turned into hyphens, for example `home-assistant`. Empty the field if the app is not a Docker container on this server or if you don't want stats.
   - **Dashify - Web UI**: select **Yes** if the app has a web page. Select **No** if you want the app in **Apps (Others)**.
   - **Dashify - Service URL**: shown only for a web app. Type the full address, for example `http://192.168.1.50:8123` or `https://portainer.YOUR_DOMAIN`. Replace `YOUR_DOMAIN` with your domain. A URL is required ("A URL is required for apps with a Web UI.").
   - **Dashify - Dashboard Location**: pick `local` (**Apps (Local)**), `remote` (**Apps (Remote)**) or `core` (**Apps (Others)**).
4. Read the **Dashify - Confirm** box and select **Yes**. **No** shows "Dashify operation cancelled. No changes were made."
5. Look for "Success!" and "Refresh your Dashboard to see the new entry."

:::note
The `core` entry reads "Apps (Others) - Core services or non-web apps". But an app with **Web UI** set to **Yes** goes to **Apps (Local)**, even when you pick `core`. Only an app with **Web UI** set to **No** lands in **Apps (Others)**.
:::

If you add the same app name to the same location twice, Deployrr shows "Success!" but changes nothing. To change an entry, edit `services.yaml` (see below).

If you see "Failed to add", check that the dashboard runs and that its `services.yaml` file exists. If the dashboard is stopped, Deployrr says "The Deployrr Dashboard is not running."

## Add a remote app with Traefikify

When you put an app that runs on another server behind Traefik, Deployrr offers to add it to the dashboard.

1. Run **Proxy** > **Traefik** > **Traefikify** and answer its prompts. The steps are in [Run several servers on one domain](/reverse-proxy/multi-server-same-domain/).
2. When the "Traefikify - Success" box closes, Deployrr asks "Add to Deployrr Dashboard?" if the dashboard is running. Select **Yes**.
3. At **Dashboard - App Name**, type the name to show. The default is your subdomain with a capital first letter.
4. At **Dashboard - Icon**, type an icon name or leave it empty. The default is `si-` followed by your subdomain. If no icon with that name exists, change it.
5. At **Dashboard - Description**, type a description. The default is the app's address, `https://SUBDOMAIN.YOUR_DOMAIN`.
6. Look for "Added NAME to Deployrr Dashboard".

The question says the app will appear in the **Remote Apps** section. On the dashboard, that section is named **Apps (Remote)**.

If you see "Could not add to Dashboard (Dashboard may not be running)", start the dashboard and add the app with **Dashify** instead. Pick `remote` as the location.

## Fix a dashboard that is out of date

Use ReDash when apps are missing, when you installed apps before the dashboard, or when the file got messy.

:::caution
ReDash replaces your dashboard's app list with a fresh one. Any change you made by hand in the `services.yaml` file is lost. Deployrr saves the old file first, so you can get your edits back. Make a [backup](/using-deployrr/backups/) of your Docker folder before you start.
:::

1. In Deployrr, open **Tools** from the main menu.
2. Select **ReDash** ("Auto-rebuild Dashboard from Installed Apps").
3. Read the **ReDash - Rebuild Dashboard** box. It says your current `services.yaml` is backed up, a fresh one is created, and all installed apps are added. Select **Yes**.
4. Wait. Deployrr stops the dashboard, rebuilds the list, adds one app at a time, and starts the dashboard again. With many apps this takes a while.
5. Read the summary. It shows how many apps were added as local, remote and other entries, and the name of the backup file.
6. Wait for "Dashboard services.yaml rebuilt successfully".

Deployrr says "Traefik is running - remote entries will be added" or "Traefik is not running - only local entries will be added". Without Traefik running, **Apps (Remote)** stays empty.

The old file is saved as `services.DATE_TIME.yaml` in the same folder as `services.yaml`.

ReDash also puts back the apps you added with Dashify, and the remote apps you added with Traefikify.

ReDash leaves some apps out:

- It never adds helper containers that belong to another app. It does this without any message.
- It skips apps that have their dashboard entry turned off. Examples are Gluetun, Tailscale, ZeroTier, Cloudflare Tunnel and Node Exporter. The summary shows a **Skipped** line for these, only when the number is above 0. The helper containers are not counted there.
- It may also leave out some apps without a web page that Deployrr added to **Apps (Others)** when you installed them. If one is missing, add it with **Dashify** and answer **No** at **Dashify - Web UI**.

If you see "No installed apps found", there is nothing to add yet. If you see "The Deployrr Dashboard is not installed", install it first.

## Edit the dashboard files

Dashboard settings live in your Docker folder, in `appdata/deployrr-dashboard/config/`:

| File | What it holds |
| --- | --- |
| `services.yaml` | The app entries and the three sections. |
| `settings.yaml` | Title, theme, colors and section icons. |
| `bookmarks.yaml` | Bookmarks. |
| `widgets.yaml` | Widgets at the top of the page. |
| `docker.yaml` | The Docker connection used for container stats. |

Icons you add yourself go in `appdata/deployrr-dashboard/images/` in the same Docker folder. This is general Homepage knowledge. Its [documentation](https://gethomepage.dev/) explains what you can put in these files.

In general, Homepage picks up file changes on its own. If the page does not change, refresh it, or restart the container.

To restart the container, use **Tools** > **Stack Manager** or run this command:

```bash
sudo docker restart deployrr-dashboard
```

If you installed the [bash aliases](/using-deployrr/bash-aliases/), `dcrestart` restarts it and `dstop` only stops it:

```bash
dcrestart deployrr-dashboard
```

```bash
dstop deployrr-dashboard
```

:::caution
Leave the comment lines in `services.yaml` alone, such as the ones ending in `PLACEHOLDER` and the `START` and `END` markers. Deployrr uses them to add and remove entries. Edits to `services.yaml` are lost when you run ReDash, but `settings.yaml` and the other files are not rebuilt by it.
:::

## Check it worked

1. Open the dashboard in your browser.
2. Look for **Apps (Local)**, **Apps (Remote)** and **Apps (Others)**.
3. Find the app you added. Click it and check that it opens.
4. If an app is missing, refresh the page. If it is still missing, run **ReDash**.

## If it does not work

| What you see | What to do |
| --- | --- |
| "ACCESS DENIED" in a **License Required** box | The dashboard and Socket Proxy need a Basic, Plus or Pro license. |
| **Requirements Not Met (N)** | Finish the steps the box lists, then try again. |
| The page does not load at `http://SERVER_IP:PORT` | Check that the container runs. See [Stack Manager](/using-deployrr/stack-manager/), or run `sudo docker ps -a` (`dps` with the aliases). |
| The page does not load at your domain address | Check that the local address works first. Then see [Check Traefik logs](/reverse-proxy/check-traefik-logs/). |
| An app is missing | Start the dashboard if it is stopped, then run **ReDash**. |
| A hand edit disappeared | Find the saved file in `appdata/deployrr-dashboard/config/`. It is named `services.DATE_TIME.yaml`. Copy your lines from it. |
| Entries show an old server IP address | Run **Tools** > **Change Server IP**. |

## Related

- [Set up Traefik](/reverse-proxy/traefik-setup/): Traefik Production adds Traefik and the dashboard to the dashboard.
- [Stack Manager](/using-deployrr/stack-manager/): delete an app and its dashboard entry, or restart the dashboard.
- [Run several servers on one domain](/reverse-proxy/multi-server-same-domain/): the Traefikify steps for remote apps.
- [Open a dashboard at your root domain](/reverse-proxy/point-root-domain-to-a-dashboard/): show the dashboard at `example.com`.
- [Move from v5](/getting-started/move-from-v5/): the dashboard is one of the core setup steps.
