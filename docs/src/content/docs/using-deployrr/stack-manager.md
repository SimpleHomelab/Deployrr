---
title: Stack Manager
sidebar:
  order: 5
  label: Stack Manager
description: Look up every option in Tools > Stack Manager, what it does, and when to use it to start, stop, update, recreate, disable or delete your apps.
type: reference
tags:
  - docker
  - compose
applies_to: v6.0+
related:
  - using-deployrr/update-apps
  - using-deployrr/bash-aliases
  - using-deployrr/custom-yml
  - using-deployrr/backups
  - docker/waiting-for-container
further_reading:
  - title: "UDMS part 13: Starting and stopping services with Docker Compose"
    url: https://www.simplehomelab.com/udms-13-docker-and-docker-compose-commands/#Starting_and_Stopping_Services
videos:
  - id: rdqbAr0TFnQ
    start: 4527
    title: "Deployrr 5 walkthrough: Stack Manager options"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: rdqbAr0TFnQ
    start: 1954
    title: "Deployrr 5 walkthrough: Stack Manager Delete (Safe and Full)"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: Ux9khKhqhcg
    start: 523
    title: "Bash aliases: bring a whole Docker Compose stack down and back up"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
last_reviewed: 2026-11-13
status: current
old_paths: []
sources: []
---

Use **Tools** > **Stack Manager** to start, stop, update, recreate, disable and delete the apps Deployrr installed. This page lists every option and tells you when to use it.

## Which option do I need?

| You want to | Use |
| --- | --- |
| Start all your apps | **Up** |
| Stop all your apps and remove their containers | **Down** |
| Update every app | **Update Stack** |
| Update one app | **Update App** |
| See which version pins are behind the recommended ones | **Check Pins** |
| See every container and its version, ports and IP | **Containers Status** |
| Start one app that is stopped | **Start Container** |
| Stop one app and keep its container | **Stop Container** |
| Apply changes after you edit an app's compose file or `.env` values | **Recreate** (see [Restart, Recreate or Reinstall](/using-deployrr/restart-recreate-reinstall/)) |
| See which apps are on or off in your stack | **Services Status** |
| Keep an app installed but stop it from starting with the stack | **Disable** |
| Turn a disabled app back on | **Enable** |
| Remove an app, and optionally its data | **Delete** |

## Before you start

- You finished **Prerequisites**. See the [Quick start](/getting-started/quick-start/).
- You have a Basic, Plus or Pro license. Every option needs it. Without it you see "License - Basic, Plus, or Pro required." If Prerequisites are not done, you see "Prerequisites - All steps must be completed". **Delete** asks Safe or Full first and shows these messages after that.
- Optional: turn on the [Deployrr bash aliases](/using-deployrr/bash-aliases/). Many options have an alias you can use from the terminal.

:::caution
The Stack Manager screen starts with a red **IMPORTANT!** and this note: "The options below depend on patterns, spacing, and indentation adhering to Deployrr standards. Manual changes/deviations may cause unexpected behaviors."
:::

## How to use it

1. In Deployrr, go to **Tools** > **Stack Manager**.
2. Choose an option from the menu.

Some options ask you to pick an app. Those lists are plain numbered lists in the terminal, not menus. Type the number and press Enter.

To see the menu in use, watch [Deployrr 5 walkthrough: Stack Manager options at 1:15:27](https://youtu.be/rdqbAr0TFnQ?t=4527) (shows Deployrr v5; menus and steps differ in v6).

## Stack

These options act on all your apps at once.

### Up

"Docker Stack Up". Starts every app in your stack. You see "Bringing up Docker stack..." and then "Docker stack is up". Use it after **Down**, or after you enable an app. It also removes the containers of apps you disabled (see [What happens to a disabled app's container](#what-happens-to-a-disabled-apps-container)).

With the [Deployrr bash aliases](/using-deployrr/bash-aliases/): `dcup`. Unlike **Up**, it also rebuilds apps that are built locally.

### Down

"Docker Stack Down". Stops every app and removes its containers. You see "Stopping Docker stack..." and then "Docker stack is down". Your app data stays in place.

With the [Deployrr bash aliases](/using-deployrr/bash-aliases/): `dcdown`.

To see a whole stack brought down and up with aliases, watch [Bash aliases: bring a whole Docker Compose stack down and back up at 8:43](https://youtu.be/Ux9khKhqhcg?t=523) (manual Docker Compose setup; Deployrr does these steps for you, and some of its alias names differ from the video).

For the matching commands, see [UDMS part 13: Starting and stopping services with Docker Compose](https://www.simplehomelab.com/udms-13-docker-and-docker-compose-commands/#Starting_and_Stopping_Services) (manual setup, to understand how it works).

### Update Stack

"Pull updates and recreate entire stack". Use it to update every app. See [Update your apps](/using-deployrr/update-apps/) for the update modes and what the messages mean.

### Check Pins

"Compare app version pins with recommended". It only reports and changes nothing. See [Update your apps](/using-deployrr/update-apps/) for how to read the result.

## Containers

These options act on containers that already exist.

### Containers Status

Shows a table of every container, running or not. The columns are **Container**, **Version**, **Status**, **Port(s)** and **IP(s)**. The menu line shows how many containers you have. Use it to see what runs and what does not.

With the [Deployrr bash aliases](/using-deployrr/bash-aliases/): `dps` lists all containers. `dpss` gives a sorted table of name, state, status and image. Neither shows ports or IP addresses.

### Start Container

Starts an app that is not running. The menu line shows how many are not running.

1. Choose **Start Container**.
2. At "Select an app to start:", type the number of the app and press Enter. Type `all` to start every one of them, or `exit` to leave. If you leave you see "No changes made."
3. Look for "APP started", or "All containers started".

If every container is running, you see "No exited containers found."

With the [Deployrr bash aliases](/using-deployrr/bash-aliases/): `dcstart APP`. Replace `APP` with the app's name. Without a name, it starts all.

### Stop Container

Stops a running app and keeps its container. The menu line shows how many are running.

1. Choose **Stop Container**.
2. At "Select an app to stop:", type the number of the app and press Enter. Type `all` to stop every one of them, or `exit` to leave.
3. Look for "APP stopped", or "All containers stopped".

If nothing is running, you see "No apps running."

With the [Deployrr bash aliases](/using-deployrr/bash-aliases/): `dcstop APP`. Replace `APP` with the app's name. Without a name, it stops every app in the stack. `dstop NAME` also stops one container by its name.

## Services

These options act on apps as entries in your main compose file.

### Services Status

Shows "Status of services in docker-compose-HOSTNAME.yml..." and a table with **Service** and **Status**. Status is **Enabled** or **Disabled**. It tells you whether the app is switched on in your stack, not whether it is running. For that, use **Containers Status**. The number in the menu line includes disabled apps.

### Update App

"Update a single app (smart pull or rebuild)". Use it to update one app. See [Update your apps](/using-deployrr/update-apps/).

### Recreate

"Force recreate an app". Use it after you edit an app's compose file or its `.env` values, so the app picks up the change. To change a value or a secret first, see [Edit .env values and secrets](/using-deployrr/edit-env-and-secrets/).

1. Choose **Recreate**.
2. At "Select an app to recreate:", type the number of the app and press Enter. The list shows all your containers. Type `all` to recreate every one of them, or `exit` to leave.
3. For one app, you see "Stopping APP..." (step 1/2). This takes the app down and removes its container. Then you see "Recreating APP with force..." (step 2/2). If an image must be downloaded, you also see "This may take a few minutes if image needs to be pulled...".
4. Look for "APP recreated".

If you pick `all`, Deployrr takes the whole stack down and recreates everything. You see "All containers recreated".

If you have no containers, you see "No running or exited containers found."

With the [Deployrr bash aliases](/using-deployrr/bash-aliases/): `dcrec APP`. Replace `APP` with the app's name. Without a name, it recreates all containers. Unlike the menu option, it does not take the app down first.

### Disable

"N enabled apps". Keeps an app installed with its data, but stops it from starting with the stack. Use it for an app you want to pause for a while.

1. Choose **Disable**.
2. At "Enter the number of the service to disable:", type the number of the app and press Enter. Type `exit` to leave.
3. If the app is running, answer "Do you want to stop APP container?". Press `Y` to stop it. Press any other key to leave it running. You see "Container left running (will not start on next stack up)".
4. Look for "APP disabled successfully". Then open **Services Status** and check that the app shows **Disabled**. If it shows **Enabled**, open `docker-compose-HOSTNAME.yml` in your Docker folder (see [Docker folder layout](/using-deployrr/docker-folder-layout/)), find the line `- compose/$HOSTNAME/APP.yml` and put `# ` in front of the dash, so it reads `# - compose/$HOSTNAME/APP.yml`. Change only that line.

If no app is enabled, you see "No enabled services found in" followed by your compose file name. If you type `exit`, you see "No changes made."

Some apps have helper containers, such as a database. For these you see "Multicontainer app detected" and the question "Do you want to also disable dependency containers?". Press `Y` to disable the helpers too. Deployrr stops them, even if you left the app running at step 3. Press any other key and the helpers stay enabled, as they are, and start with the stack.

You can't disable a helper on its own. Deployrr says "Cannot disable dependency directly" and tells you to disable the parent app.

#### What happens to a disabled app's container

Disable only turns off the app's line in your main compose file. The container stays, stopped or running, until the next time your stack is started as a whole. **Up**, **Update Stack** (Full or Standard) and the `dcup` alias remove containers of apps that are no longer in the compose file. Installing an app and the "restart the Docker stack" question after a backup or restore can do the same. So after one of them runs, a disabled app's container is gone, even one you left running at step 3. Its `appdata` folder, `.env` values and compose file stay.

This is also what happens to the proxy you switch away from in **Proxy** > **Proxy Type**: its line is disabled, and the next **Up** removes its stopped container. See [Switch between Traefik and Nginx Proxy Manager](/reverse-proxy/switch-traefik-npm/).

Nothing is lost. When you enable the app again, **Up** creates a new container from the same settings and data.

#### Stop or Disable?

Both pause an app and keep its data. They differ in what brings it back.

| | **Stop Container** | **Disable** |
| --- | --- | --- |
| Server reboot | Stays stopped | Stays stopped if you stopped it at step 3. A container you left running starts again. |
| **Up** or **Update Stack** | Starts again | Container removed, app stays off |
| To bring it back | **Start Container** or **Up** | **Enable**, then **Up** |

The reboot row is for apps with the usual restart setting (`unless-stopped` in the app's compose file). Many media apps (Plex, Jellyfin, Sonarr, Radarr and others) are set not to restart on their own, so after a reboot they stay stopped whichever option you used. Use **Stop Container** for a short pause. Use **Disable** when the app should stay off through stack updates.

### Enable

"N disabled apps". The reverse of **Disable**. The app starts with the stack again.

1. Choose **Enable**.
2. At "Enter the number of the service to enable:", type the number of the app and press Enter. Type `exit` to leave.
3. For an app with helper containers, answer "Do you want to also enable dependency containers?". If you disabled the helpers with the app, press `Y`. The app needs them, and Docker Compose can refuse to start the stack when an app points to a helper that is turned off.
4. If the app is not running, answer "Do you want to start APP container?". Press `Y` to start it now. Press any other key to leave it stopped. You see "Container left stopped (will start on next stack up)". If you enabled helpers and start the app, Deployrr also asks "Do you want to also start the dependency containers?".
5. Look for "APP enabled successfully".

If no app is disabled, you see "No disabled services found in" followed by your compose file name.

Step 4 can only start a container that still exists. If **Up** or **Update Stack** ran while the app was disabled, its container was removed, and answering `Y` does not bring it back. Run **Up** after **Enable** instead, or `dcup APP` with the [bash aliases](/using-deployrr/bash-aliases/). Whatever step 4 shows, check **Containers Status** to confirm the app runs.

You can't enable a helper on its own. Deployrr says "Cannot enable dependency directly". Enable the parent app instead.

### Delete

"Full or safe delete an app and its data". Use it to remove an app, or to reinstall one from a clean start. To see it done, watch [Deployrr 5 walkthrough: Stack Manager Delete (Safe and Full) at 32:34](https://youtu.be/rdqbAr0TFnQ?t=1954) (shows Deployrr v5; menus and steps differ in v6).

1. Choose **Delete**.
2. In the **Delete a Service** box ("How do you want to delete the app?"), pick how to delete:
   - **Safe** ("Retain App's data") keeps the app's `appdata` folder and its secrets. An app can use that data and those settings when you install it again.
   - **Full** ("Remove Everything, including App's data") also deletes the app's `appdata` folder, its secrets and unused Docker volumes.
3. Deployrr asks "Do you want to create a live backup before proceeding (a cold backup from the 'Tools' menu is recommended)?". Press `Y` to make one. Press any other key to skip it. The cold backup in **Tools** > **Backups** needs a Pro license. See [Back up and restore your Docker folder](/using-deployrr/backups/).
4. At "Enter the number of the service to delete:", type the number of the app. Type `exit` to leave.
5. For an app with helper containers, Deployrr says "Multicontainer app detected" and shows the **Multicontainer App Deletion** window. The choices are **Delete APP only**, **Delete APP + all dependencies** and **Cancel deletion**. Pick the one with all dependencies, or the helpers stay behind.
6. At "Press Y/y to proceed with deletion or any other key to exit:", press `Y`. Any other key leaves with "No changes made."
7. Look for "APP deleted successfully", followed by "(safe delete - data preserved)" or "(full delete - all data removed)".

Both kinds of delete also remove the app's compose file, its settings in `.env` (such as its version pin), its Traefik rules file and its [Deployrr Dashboard](/using-deployrr/dashboard/) entry.

You can't delete a helper on its own. Deployrr says "Cannot delete dependency directly" and tells you to delete the parent app.

:::caution
A **Full** delete removes the app's data and settings for good. Back up first.
:::

For a full walk-through with two real apps, see [Pi-hole will not start because port 53 is already in use](/apps/pi-hole-port-53-conflict/) and [Remove Authentik](/reverse-proxy/authentik-removal/). The Authentik page also lists what **Safe** and **Full** remove.

To bring an app back after a **Safe** delete and reuse its data, see [Reinstall an app and keep its data](/using-deployrr/reinstall-app/).

**Apps** > **Manage Apps** > **Remove** is a different path with different questions. See [Install and manage apps from the Apps menu](/using-deployrr/manage-apps/) for how the two compare.

## Your own compose files

Apps you add with [custom.yml](/using-deployrr/custom-yml/) are in your main compose file too. `custom.yml` itself is not listed in these options. Extra files you add next to it are listed as apps.

:::caution
Don't use **Disable**, **Enable** or **Delete** on those extra files. **Delete** removes the line and deletes the file.
:::

## If an app does not start

If **Up**, **Start Container** or an install seems stuck, see [Deployrr times out waiting for a container to start](/docker/waiting-for-container/). If an app that ran before keeps restarting, is unhealthy or has exited, see [A container keeps restarting, is unhealthy or has exited](/docker/container-keeps-restarting/). If your media apps are stopped after a reboot, see [Apps are stopped or show empty folders after a reboot](/docker/apps-not-starting-after-reboot/).

## Related

- [Update your apps](/using-deployrr/update-apps/): update one app or the whole stack, and read the version pin check.
- [Bash aliases](/using-deployrr/bash-aliases/): terminal shortcuts for most of these options.
- [Add your own containers with custom.yml](/using-deployrr/custom-yml/): run your own services next to your apps.
- [Back up and restore your Docker folder](/using-deployrr/backups/): make a backup before a big change or a delete.
- [Deployrr times out waiting for a container to start](/docker/waiting-for-container/): fix an app that will not start.
