---
title: Install and manage apps from the Apps menu
description: Install apps, read their status, start, stop, restart, view logs, remove or reinstall them, and refresh the app list from the Deployrr Apps menu.
type: guide
tags:
  - docker
  - logs
  - compose
applies_to: v6.0.42+
related:
  - apps/reinstall-app
  - using-deployrr/stack-manager
  - docker/container-keeps-restarting
  - getting-started/licenses
  - using-deployrr/requirements-not-met
further_reading:
  - title: "UDMS part 13: Container logs with Docker commands"
    url: https://www.simplehomelab.com/udms-13-docker-and-docker-compose-commands/#Container_Logs
videos:
  - id: OnoKy73b-w4
    start: 780
    title: "Deployrr 5 intro: the Apps menu shows running, exposure and login"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: rdqbAr0TFnQ
    start: 1728
    title: "Deployrr 5 walkthrough: install an app from the Apps menu"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: rdqbAr0TFnQ
    start: 1954
    title: "Deployrr 5 walkthrough: Stack Manager Safe and Full delete"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
last_reviewed: 2026-11-11
status: current
old_paths: []
sources: []
---

The **Apps** menu is where you install apps and look after the ones you have. This guide covers **Browse Apps**, **Manage Apps** and **Refresh Cache**, and tells you when to use Stack Manager or an alias instead.

## Overview

Go to **Apps** in the main menu. The **Apps Menu** has three entries you use for apps:

| Entry | What it does |
| --- | --- |
| **Browse Apps** | Lists the official apps and installs the one you pick. The line reads "Browse and install from N official apps". |
| **Manage Apps** | Lists the apps you installed and lets you start, stop, restart, read logs, remove or reinstall one. The line reads "Manage installed apps (N running, M stopped)". |
| **Refresh Cache** | "Sync manifests and rebuild registry". Reloads the list of apps. |

Core apps such as Traefik are in neither list. They have their own menus.

You need a Basic, Plus or Pro license to install or reinstall an app. Without one you see "License Required" and "Official apps require a paid license." Start, Stop, Restart, Logs and Remove in **Manage Apps** have no license or requirements check. See [Licenses](/getting-started/licenses/).

The **Apps Menu** also lists **ShellInABox** under SYSTEM APPS. It is a web-based SSH terminal. It needs Traefik in production, a login method and a paid license. This page doesn't cover it.

## Install an app with Browse Apps

1. Go to **Apps** > **Browse Apps**. The title shows how many apps you can pick, in the form "Browse Apps (N apps)".
2. Find the app in the list. It is sorted by name. Each line has the app name and a short description.
3. Select the app and choose **Install**.
4. At "Do you want to install this app?", choose **Yes**.
5. Answer the questions that follow. See [The install questions](#the-install-questions).
6. Look for "APP installation complete!". If it fails, you see "APP installation failed". Read the messages above it.

To see an install from start to finish, watch [Deployrr 5 walkthrough: install an app at 28:48](https://youtu.be/rdqbAr0TFnQ?t=1728) (shows Deployrr v5; menus and steps differ in v6).

After the list loads, a marker after the description tells you the state of each app:

| Marker | Meaning |
| --- | --- |
| **[Running]** (green) | The app is installed and running. |
| **[Installed]** (yellow) | The app is installed but not running. |
| No marker | The app is not installed. |

If the list is empty, you see "No apps found in registry." and "Please check that the apps registry is properly configured." Try **Refresh Cache** (see below).

### The install questions

Which questions you see depends on the app. You may see some or all of these:

- **Already Installed.** This shows when you pick an app that is already installed or running. It says "plex is already running." or "plex is already installed." The name is the app's short name in lowercase. It lists what a reinstall does: stop the existing container, recreate it with the latest image and keep data volumes. Choose **Yes** to go on or **No** to cancel. **Yes** also removes the app's entry from the [Deployrr Dashboard](/using-deployrr/dashboard/). It is added again at the end of the install. See [Reinstall an app and keep its data](/apps/reinstall-app/).
- **Port Configuration.** "Enter the port for APP". Deployrr suggests the first free port. If you type a port that is not a number in the allowed range, you see "Invalid Port" and Deployrr uses the suggestion. If your port is taken, you see "Port In Use" and Deployrr uses the suggestion. For a clash you can't fix, see [Port is already in use](/apps/port-already-in-use/).
- **Password Configuration.** Deployrr suggests a password. Keep it or type your own. Leave the box empty to use the suggestion.
- **GPU Selection.** For apps that can use a GPU. Pick a GPU, or choose the CPU. If you cancel, the app uses the CPU. See [GPU hardware transcoding](/apps/gpu-transcoding/).
- **Traefik Subdomain.** "Enter a subdomain for APP". It shows when Traefik is running and the app supports it. Use lowercase letters and no spaces. If you cancel or leave it empty, Deployrr uses the default.
- **Pick an Authentication Method.** The login for the app. **Skip** leaves the app with no Traefik login. See [Choose a login method for your apps](/reverse-proxy/choose-login-method/).
- **Pick an Exposure Method.** **Both**, **Internal** or **External**. You see it only in Advanced mode. **Default (Internal)** keeps the app on your LAN. In Simple mode there is no prompt, and the app is exposed on both. See [Simple vs Advanced Traefik mode](/reverse-proxy/simple-vs-advanced-mode/).

:::note
If you see **License Required**, see [Licenses](/getting-started/licenses/). If you see a **Requirements Not Met** box, finish the items it lists first. See [Requirements Not Met](/using-deployrr/requirements-not-met/).
:::

## See your installed apps with Manage Apps

1. Go to **Apps** > **Manage Apps**.
2. Read the list. The title shows the count, for example "Manage Apps (3 installed)".

If you have no apps, you see "No apps installed." Use **Browse Apps** to install one.

Each line shows the app name and a marker in brackets:

| Marker | Meaning |
| --- | --- |
| **[Installed]** (yellow) | The app is stopped. |
| **[Running]** (green) | The app is running, and Deployrr found no Traefik details for it. |
| **[Running; EXPOSURE; LOGIN]** | The app is running. After the first semicolon you see where it is reachable, then its login. For example, **[Running; Int; Authelia]**. Either part can be missing. |

For a running app that has a Traefik rules file, the marker can show:

- Exposure: **Ext** (external only), **Int** (internal only) or **Int & Ext** (both).
- Login: **Authelia**, **Authentik**, **Google OAuth**, **TinyAuth**, **Basic Auth** or **No Auth**.

The text above the list gives a colour legend: green is running or secure, yellow is stopped or basic, and red is no auth. Login names are green for the strong methods, yellow for **Basic Auth** and red for **No Auth**.

For the same idea in an earlier version, watch [Deployrr 5 intro: the Apps menu at 13:00](https://youtu.be/OnoKy73b-w4?t=780) (shows Deployrr v5; menus and steps differ in v6).

:::note
A container that keeps crashing and restarting can still show as **Running**. If an app shows **Running** but doesn't work, see [A container keeps restarting, is unhealthy or has exited](/docker/container-keeps-restarting/).
:::

## Manage one app

1. In **Manage Apps**, select the app and choose **Manage**.
2. In the **Manage: APP** box, check the status line. It says Running or Stopped.
3. Pick an action.

The actions you see depend on the status:

| App status | Actions |
| --- | --- |
| Running | **Logs**, **Restart**, **Stop**, **Remove** |
| Stopped | **Start**, **Logs**, **Remove**, **Reinstall** |

### Start, Stop and Restart

Each one shows a title such as "Starting APP", then one step, then a result:

| Action | Success message | Failure message |
| --- | --- | --- |
| **Start** | "APP started successfully" | "Failed to start APP" |
| **Stop** | "APP stopped successfully" | "Failed to stop APP" |
| **Restart** | "APP restarted successfully" | "Failed to restart APP" |

On failure you see only that one line. It doesn't say why. Check the app's logs with **Logs**. Or run this in a terminal. Replace `NAME` with the app's container name, which is the app's short name such as `plex`:

```bash
sudo docker logs NAME
```

With the Deployrr bash aliases: `dlogs NAME`. See [Bash aliases](/using-deployrr/bash-aliases/).

To understand how container logs work, read [UDMS part 13: Container logs with Docker commands](https://www.simplehomelab.com/udms-13-docker-and-docker-compose-commands/#Container_Logs) (manual setup, background only).

### Logs

**Logs** shows "Logs: APP" and "Showing last 50 lines (Ctrl+C to exit)". It then keeps following new lines. Press Ctrl+C once to stop following the log and go back to the menu. Deployrr keeps running. Pressing Ctrl+C twice closes Deployrr.

### Remove

**Remove** takes the app out of your setup. It asks two questions, then prints each step as it goes.

1. Choose **Remove**.
2. In the **Remove APP** box, read "This will remove the APP container". It asks "Remove app data as well?":
   - **No** keeps the app's data in the `appdata` folder, so you can reinstall later.
   - **Yes** removes the container and all of the app's data. If the app was built on your server, it also deletes that built image.
3. In the **Confirm Removal** box, check "Remove Data: Yes" or "Remove Data: No". Choose **Yes** to proceed with the removal, or **No** to cancel.
4. If the app has linked containers, such as a database, the **Multicontainer App Removal** box asks how to go on. Pick **Remove APP only**, **Remove APP + all dependencies** or **Cancel removal**.
5. Wait for the steps to finish. Look for "APP removed successfully".

The steps stop the container and remove it. They also remove the app's compose configuration, its Traefik configuration, its [Deployrr Dashboard](/using-deployrr/dashboard/) entry, its saved settings and its secrets. The last step, "Cleaning up...", removes the `appdata` folder only if you answered **Yes** to removing app data.

**Remove** has no backup prompt and doesn't clean up unused Docker volumes. Stack Manager **Delete** > **Full** does clean them up.

:::caution
Answering **No** to "Remove app data as well?" keeps the `appdata` folder, but **Remove** currently still deletes the app's secrets. A **Safe** delete in Stack Manager keeps them. To remove an app and reuse its data and secrets later, use **Tools** > **Stack Manager** > **Delete** > **Safe**. See [Reinstall an app and keep its data](/apps/reinstall-app/).
:::

:::caution
By the time the **Multicontainer App Removal** box appears, Deployrr has already stopped and removed the app's container. **Cancel removal** currently does not bring it back. Its compose file and settings are still in place, so if you cancel, bring the app back with **Tools** > **Stack Manager** > **Up**.
:::

If you ever see "Cannot remove dependency directly", Deployrr names the app to remove instead. Remove that app.

### Reinstall

**Reinstall** shows only when the app is stopped. It prints "Reinstalling APP", runs the install questions again and ends with "APP reinstalled successfully", or "APP reinstallation failed". It skips the **Already Installed** box.

:::caution
Reinstall replaces the app's compose file with the default one. Any edits you made to it by hand are lost.
:::

See [Reinstall an app and keep its data](/apps/reinstall-app/) for what it keeps and resets.

## Refresh the app list

**Refresh Cache** reloads the list of apps that **Browse Apps** and **Manage Apps** show. Use it when:

- An app you expect is missing from **Browse Apps**.
- You see "No apps found in registry."
- You see "App Not Found" with the advice to try refreshing the apps cache.

1. Go to **Apps** > **Refresh Cache**.
2. In the **Build App Cache** box, read "This will sync all app manifests and rebuild the cache". Choose **Yes**.
3. Watch the sync steps, ending with "Building app registry...".
4. Look for "Registry built (N apps)" and "Cache marker created".

If you see "Cache build incomplete", the sync of the apps you can install failed. The sync downloads app files, so check that your server is online, then run it again. Other "sync failed" lines are warnings and don't stop the build.

The only requirement is the Disclaimers step. If you see a **Requirements Not Met** box, see [Requirements Not Met](/using-deployrr/requirements-not-met/).

### The cache expires after 7 days

When the cache expires, **Prerequisites** shows **Build Cache** as EXPIRED. Installs then show "Prerequisites - All steps must be completed" until you refresh it. **Prerequisites** > **Build Cache** does the same thing as **Apps** > **Refresh Cache**. Run either one. See [Prerequisites](/getting-started/prerequisites/).

## Which tool to use

| You want to | Use |
| --- | --- |
| Install an app | **Apps** > **Browse Apps** |
| Start, stop or restart one app and see if it worked | **Apps** > **Manage Apps** > the app |
| Read the last 50 log lines and follow new ones | **Apps** > **Manage Apps** > the app > **Logs**, or `dlogs NAME` |
| Start or stop one app by number, or all at once | **Tools** > **Stack Manager** > **Start Container** (lists only apps that are not running) or **Stop Container** (lists only running apps) |
| Apply a change after you edit an app's compose file | **Tools** > **Stack Manager** > **Recreate**, or `dcrec APP` |
| Restart one app from the terminal | `dcrestart APP` |
| Remove an app and its container but keep its data | **Tools** > **Stack Manager** > **Delete** > **Safe** |
| Remove an app and all its data | **Manage Apps** > **Remove** with **Yes**, or **Stack Manager** > **Delete** > **Full** |
| Install an app again with default settings | [Reinstall an app and keep its data](/apps/reinstall-app/) |

In the aliases, replace `APP` with the app's name. See [Bash aliases](/using-deployrr/bash-aliases/).

**Remove** and Stack Manager **Delete** both remove the container, compose file, Traefik rules file, Dashboard entry and saved settings. They differ in what they ask and what they keep:

| | Manage Apps > Remove | Stack Manager > Delete |
| --- | --- | --- |
| You choose | Remove app data: Yes or No | **Safe** or **Full** |
| App data | Kept on No, deleted on Yes | Kept on **Safe**, deleted on **Full** |
| Secrets | Deleted either way | Kept on **Safe**, deleted on **Full** |
| Unused Docker volumes | Not cleaned | Removed on **Full** |
| Offers a backup first | No | Yes |
| License and Prerequisites check | None | Every Stack Manager option checks for a Basic, Plus or Pro license and finished Prerequisites |

See [Stack Manager](/using-deployrr/stack-manager/) for every option.

## Next steps

- Fix an app that shows **Running** but keeps failing: [A container keeps restarting, is unhealthy or has exited](/docker/container-keeps-restarting/).
- Update your apps: [Update your apps](/using-deployrr/update-apps/).
- Open your apps from one page: [Deployrr Dashboard](/using-deployrr/dashboard/).

## Related

- [Reinstall an app and keep its data](/apps/reinstall-app/): the reinstall routes and what they keep.
- [Stack Manager](/using-deployrr/stack-manager/): start, stop, recreate, disable and delete apps.
- [A container keeps restarting, is unhealthy or has exited](/docker/container-keeps-restarting/): find out why an app fails.
- [Licenses](/getting-started/licenses/): what each license lets you install.
- [Requirements Not Met](/using-deployrr/requirements-not-met/): finish what an app or menu needs first.
