---
title: Reinstall an app and keep its data
description: Reinstall an app from Apps or Manage Apps, see what Deployrr keeps and resets, and reuse the app's data after a Safe delete.
type: guide
tags:
  - compose
  - backups
  - traefik
applies_to: v6.0.42+
related:
  - using-deployrr/stack-manager
  - using-deployrr/backups
  - apps/gpu-transcoding
  - reverse-proxy/choose-login-method
  - apps/qbittorrent-webui-troubleshooting
further_reading: []
videos:
  - id: rdqbAr0TFnQ
    start: 1949
    title: "Deployrr 5 walkthrough: delete an app with Stack Manager and install it again"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
last_reviewed: 2026-11-13
status: current
old_paths: ["/apps/reinstall-app"]
sources: []
sidebar:
  order: 4
---

Reinstalling puts an app back with Deployrr's default settings and keeps the app's data folder. This guide shows the ways to do it, what is kept, what is reset, and how to back up first.

## Overview

There are three ways to reinstall an app:

| Way | Use it when |
| --- | --- |
| Install it again from **Apps** > **Browse Apps** | The app is installed and you want to redo its install questions, such as the GPU. |
| **Apps** > **Manage Apps** > the app > **Reinstall** | The app is stopped and you want to reinstall it without the Already Installed box. |
| **Tools** > **Stack Manager** > **Delete** > **Safe**, then install it again | You want a clean start for the app's compose file, rules file and `.env` values, and you want to keep its data. |

All three keep the app's `appdata` folder. All three replace the app's compose file with the default one.

You need a Basic, Plus or Pro license to install, reinstall or delete apps. With a Free license you see "License Required". See [Licenses](/getting-started/licenses/).

## Before you reinstall

:::caution
Reinstalling replaces the app's compose file and can overwrite config files the app ships. A **Full** delete removes the app's data for good. Make a copy first.
:::

1. Stop the app if you can. A copy of a running app's data may be incomplete.
2. Open a terminal on the server and go to your Docker folder. Replace `YOUR_DOCKER_FOLDER` with the path to it:

   ```bash
   cd YOUR_DOCKER_FOLDER
   ```

3. Copy the app's data folder. Replace `APP` with the app's name, such as `plex`:

   ```bash
   sudo cp -a appdata/APP ~/APP-appdata-backup
   ```

4. Copy the app's compose file. Replace `HOSTNAME` with your server's hostname and `APP` with the app's name:

   ```bash
   sudo cp compose/HOSTNAME/APP.yml ~/APP.yml.backup
   ```

If you have a Pro license, you can also back up the whole Docker folder with **Tools** > **Backups** > **Backup**. See [Back up and restore your Docker folder](/using-deployrr/backups/).

## When to reinstall

- To pick a GPU for an app that is already installed. See [GPU hardware transcoding](/apps/gpu-transcoding/).
- To answer the install questions again, such as the app's port.
- To replace a broken or hand-edited app compose file with the default one. This is the app's own file in `compose/HOSTNAME`, not your main compose file. For the main file, see [Docker environment setup fails with: docker-compose file is malformed](/docker/compose-malformed/).
- To get a new rules file and answer the login and exposure questions again. See [Change login or exposure](#change-login-or-exposure).

If you only edited the app's compose file or `.env` values, you don't need a reinstall. Use **Recreate** in [Stack Manager](/using-deployrr/stack-manager/) so the app picks up your change and keeps your edits.

## Reinstall from the Apps menu

1. Go to **Apps** > **Browse Apps**. Apps that are installed show **[Running]** or **[Installed]**.
2. Select the app and choose **Install**.
3. At "Do you want to install this app?", choose **Yes**.
4. Read the **Already Installed** box. It says the app is already installed or running. It lists what reinstalling does:
   - Stop the existing container.
   - Recreate with latest image.
   - Preserve data volumes.
5. Choose **Yes** to go on. Choose **No** to cancel and change nothing.
6. Answer the install questions that follow.

Choosing **Yes** stops and removes the app's container if it is running, then installs it again. Deployrr also takes the app off the [Deployrr Dashboard](/using-deployrr/dashboard/) and adds it again at the end of the install.

## Reinstall from Manage Apps

1. Go to **Apps** > **Manage Apps**. The title shows how many apps are installed, for example "Manage Apps (3 installed)". If none are, you see "No apps installed."
2. Select the app and choose **Manage**.
3. In the **Manage: APP** box, check the status line. The menu you get depends on it.
4. If the app is running, choose **Stop**. Then go back to **Apps** > **Manage Apps** and open the app again.
5. Choose **Reinstall**.
6. Look for "APP reinstalled successfully".

**Reinstall** is only in the menu when the app is stopped. This route skips the **Already Installed** box.

For context, the other actions in this box are below. See [Install and manage apps from the Apps menu](/using-deployrr/manage-apps/) for each one.

| App status | Actions |
| --- | --- |
| Running | **Logs**, **Restart**, **Stop**, **Remove** |
| Stopped | **Start**, **Logs**, **Remove**, **Reinstall** |

Core apps such as Traefik are not in the Manage Apps list. They have their own menus.

:::note
**Remove** in Manage Apps asks "Remove app data as well?". It is a separate path from Stack Manager **Delete**. To remove an app and reuse its data later, use the Safe delete below.
:::

## What a reinstall keeps and what it resets

A reinstall keeps the app's `appdata` folder and an existing Traefik rules file. It replaces the app's compose file, and those of linked containers such as a database, with the defaults, and asks the install questions again. For `.env` values, passwords and secret files, see [What Reinstall keeps and resets](/using-deployrr/restart-recreate-reinstall/#what-reinstall-keeps-and-resets).

### Config files

During the install you see "Copying configuration files..." and then "Files copied successfully". For some apps, this writes a config file into the app's `appdata` folder.

qBittorrent and qBittorrent VPN are two examples. Reinstalling qBittorrent replaces `appdata/qbittorrent/qBittorrent/qBittorrent.conf`, and the web UI login goes back to `admin` and `adminadmin`. Reinstalling qBittorrent VPN deletes `appdata/qbittorrent-vpn/qBittorrent/qBittorrent.conf`, and the login becomes `admin` with a temporary password from its log. Either way your qBittorrent settings are reset. See [Reset to the default login and settings](/apps/qbittorrent-webui-troubleshooting/#reset-to-the-default-login-and-settings).

Copy any config file you changed before you reinstall. For other apps, check the config file after the reinstall.

## Safe delete, then reinstall

Use this to start the app clean and keep its data.

1. Make the copies in [Before you reinstall](#before-you-reinstall).
2. Go to **Tools** > **Stack Manager** > **Delete**.
3. Pick **Safe**. It keeps the app's `appdata` folder and its secrets.
4. Follow the prompts. See [Stack Manager](/using-deployrr/stack-manager/) for each one.
5. Look for "(safe delete - data preserved)".
6. Go to **Apps** > **Browse Apps**, select the app and choose **Install**.
7. At "Do you want to install this app?", choose **Yes**. You don't see **Already Installed**, because the app is gone.
8. Answer the install questions again.
9. Open the app and check that your data is there.

Both **Safe** and **Full** delete remove the app's compose file, its `.env` settings, its Traefik rules file and its Dashboard entry. Only **Full** deletes the `appdata` folder, secrets and unused Docker volumes. Never pick **Full** if you want to reuse the data.

Because the rules file is gone, the install makes a new one.

To see Stack Manager delete and a reinstall, watch [Deployrr 5 walkthrough: Uninstall App at 32:29](https://youtu.be/rdqbAr0TFnQ?t=1949) (shows Deployrr v5; menus and steps differ in v6).

## Change login or exposure

When Traefik is running and the app supports it, the install asks for a subdomain, a login method and, in Advanced mode, an exposure choice. See [Choose a login method for your apps](/reverse-proxy/choose-login-method/) and [Simple vs Advanced Traefik mode](/reverse-proxy/simple-vs-advanced-mode/).

If the app already has a rules file, a plain reinstall keeps that file. You still see the questions, but Traefik keeps the old subdomain, login and exposure. The Dashboard link may show your new answers while Traefik uses the old ones. Do one of these:

- Use **Security** > **Manage Auth** for the login method. The login page covers it.
- Do a Safe delete, then install the app again. The new rules file uses your new answers.
- To change only the subdomain, edit the rules file. See [Change the subdomain of an app you already installed](/reverse-proxy/change-app-subdomain/).

## If something goes wrong

- The app starts but its data looks empty. Check that `appdata/APP` still exists in your Docker folder. If you did a **Full** delete, restore your copy of the folder.
- Your compose edits are gone. Put the changes back from `~/APP.yml.backup`, then use **Recreate** in Stack Manager.
- The install stops at a question or error. Read the message, fix it, and run the install again.

## Next steps

- Check the app's logs from **Apps** > **Manage Apps** > the app > **Logs**.
- Add your edits back into the compose file, then use **Recreate** in [Stack Manager](/using-deployrr/stack-manager/).

## Related

- [Stack Manager](/using-deployrr/stack-manager/): the Safe and Full delete steps, and Recreate.
- [Back up and restore your Docker folder](/using-deployrr/backups/): a full backup before a big change.
- [GPU hardware transcoding](/apps/gpu-transcoding/): reinstall an app to give it a GPU.
- [Choose a login method for your apps](/reverse-proxy/choose-login-method/): change an app's login with Manage Auth.
- [qBittorrent web UI says Unauthorized or won't open](/apps/qbittorrent-webui-troubleshooting/): what a reinstall resets for qBittorrent.
