---
title: Move from Deployrr v5 to v6
sidebar:
  label: Move from v5 to v6
description: See what changes in Deployrr v6, choose between staying on v5 and moving, and follow the steps to move while you try to keep your app data.
type: guide
tags:
  - migration
  - install
  - backups
applies_to: v6.0+
related:
  - getting-started/quick-start
  - using-deployrr/backups
  - docker/compose-malformed
  - archive/v4-to-v5-migration
  - support/discord
further_reading: []
last_reviewed: 2026-11-09
status: needs-review
old_paths: []
sources: []
---

This guide is for you if you run Deployrr v5 and want to know whether to move to v6, and how.

:::caution
Deployrr v6 is not backward compatible with v5. Moving to v6 needs a full reinstall from scratch. You can try to keep your app data, but you must reinstall your apps.
:::

## Overview

You have two choices:

- Stay on v5. Nothing changes and you do not reinstall anything.
- Move to v6. You install v6 fresh, point it at your old Docker folder, and install your apps again.

Some steps in this guide are not confirmed yet. They are marked in the text. Keep a copy of your v5 setup until you have checked every app in v6.

## What changes in v6

v6 is a rewrite. Two changes matter most when you move:

- Each app gets its own database and supporting services. In v5, apps could share them.
- Nginx Proxy Manager is available as an alternative to Traefik.

The menus are different too. Take a look at the [Quick start](/getting-started/quick-start/) to see the v6 setup.

## Stay on v5 for now

v5.11.2 is the latest and last version of v5. If v5 stopped working for you, you are probably on a version older than v5.11.2.

To keep using v5, download v5.11.2 by hand from the v5 branch of the GitHub repository:

1. Download the file:

   ```bash
   wget https://github.com/SimpleHomelab/Deployrr/raw/refs/heads/v5/deployrr_v5.11.2.app
   ```

2. Make it runnable:

   ```bash
   chmod +x deployrr_v5.11.2.app
   ```

3. Start it:

   ```bash
   ./deployrr_v5.11.2.app
   ```

On an ARM machine, use `deployrr_v5.11.2-arm.app` in all three commands.

## Before you start

Do these before you touch anything else.

1. Copy your whole v5 Docker folder somewhere safe. Replace `USERNAME` with your Linux user:

   ```bash
   sudo cp -a /home/USERNAME/docker /home/USERNAME/docker-v5-backup
   ```

   Keep this copy until v6 works for all your apps.

2. List the apps you run now:

   ```bash
   ls /home/USERNAME/docker/appdata
   ```

3. Write down your domain and the other settings you use, such as your Cloudflare details.
4. Decide if you want a second backup. A cold backup from the v5 Tools menu also works if you know how to make one. The [v4 to v5 page](/archive/v4-to-v5-migration/) mentions one.

:::note
In v6, the backup options in **Tools** > **Backups** need a Pro license. You do not need it for this move. The copy from step 1 is enough. After you are on v6, see [Back up and restore your Docker folder](/using-deployrr/backups/).
:::

## Move to v6, step by step

1. Stop your v5 apps and remove their containers. Use the v5 Stack Manager or Docker Compose. Your app data stays in the Docker folder.
2. Install Deployrr v6. Follow the [Quick start](/getting-started/quick-start/).
3. In Deployrr, open **Prerequisites** and work through the steps in order, up to **Docker Folder**. Do **Username** before **Environment**.
4. In **Docker Folder**, pick the same folder v5 used in the folder browser. You can type the path. Deployrr recommends `/home/USERNAME/docker`. It may already show as set to a path. Check that the path is right before you go on.
5. In **Backups Folder**, pick a folder outside your Docker folder. Deployrr recommends `/home/USERNAME/docker_backups`. If the folder does not exist, Deployrr creates it when you confirm.
6. Open **Prerequisites** > **Environment** ("Setup Docker Environment").

   If you see "It appears that Docker Environment is already setup...", move to **Yes** to go on. In that box **No** is on the left and selected by default, and **Yes** is on the right.

7. If there are files (other than `.env`) directly inside the Docker folder, Deployrr shows **Create Docker Root Folder**:

   ```txt
   Docker Root Folder (PATH) already exists.

   What would you like to do?
   ```

   Choose **Reuse** ("Keep appdata, .env, secrets, and custom.yml").

   If the box does not appear, nothing is deleted. Deployrr still writes fresh starter compose files.

8. Finish the rest of **Prerequisites**.
9. Go to **Apps** > **Browse Apps** and install your first app again.
10. Check that app before you install the next one. See [Check each app](#check-each-app).
11. Repeat steps 9 and 10 for each app on your list.
12. Set up the **Proxy** and **Security** menus again for Traefik and login protection. In v6, Traefik needs Hybrid setup mode, a Plus or Pro license, and Socket Proxy running. In Hybrid mode you can pick Nginx Proxy Manager instead of Traefik.

### What the Reuse choice does

You see three choices at step 7:

- **Recreate** deletes everything in the Docker folder. If a Backups Folder is set and exists, Deployrr copies the folder there first. Without one, nothing is kept.
- **Reuse** keeps `appdata`, `.env` and `secrets`. It removes everything else in the folder, including the app compose files. Your `custom.yml` is replaced with the starter file, so keep your own copy.
- **Exit** makes no changes.

**Reuse** needs a Backups Folder that is set and exists on disk. If it does not, Deployrr says "Cannot preserve data - BACKUP_FOLDER not set" and stops without changes. Set the folder in **Prerequisites** > **Backups Folder** and try again.

While Reuse runs, `appdata`, `.env` and `secrets` are moved into the Backups Folder for a moment and then back. If the step is cut off, look for them in the Backups Folder.

Deployrr also updates some values in the kept `.env`, such as your Linux user IDs and your domain, and adds any missing version pins. App passwords already in it are kept.

For more on these choices, see [Compose file is malformed](/docker/compose-malformed/#option-2-rebuild-the-file-with-the-environment-step).

### Reinstalling an app

If v6 already knows the app as installed, or a container with its name is running, you see **Already Installed**. It says reinstalling will stop the existing container, recreate it with the latest image and preserve data volumes. Confirm to go on.

On a server where you stopped and removed the v5 containers, you may not see this box at all. That is fine.

### Check each app

:::caution
These points are not confirmed. Check each app after you reinstall it.
:::

- Your v5 `.env` file and `appdata` should work with v6 after **Reuse**. This is not confirmed.
- A reinstalled app should pick up its old data from `appdata/APPNAME`. This is not confirmed.
- An app that used a shared database in v5 may not carry its data over. v6 gives each app its own database.

For each app, open it and look for your old settings, users and content. If something is missing, stop and do not delete your v5 copy. If an app's data matters a lot to you, ask on [Discord](/support/discord/) before you move.

## Check it worked

1. Each app you reinstalled starts and opens in your browser.
2. Your old settings and data are there.
3. If you use a domain, your apps open at their usual addresses.
4. Only then, delete `/home/USERNAME/docker-v5-backup` if you no longer need it.

If an app comes up empty, keep your v5 copy and ask for help on [Discord](/support/discord/).

## Next steps

- Make your first v6 backup. See [Back up and restore your Docker folder](/using-deployrr/backups/).
- Put your own containers back in `custom.yml` from your v5 copy.

## Related

- [Quick start](/getting-started/quick-start/): install v6 and work through Prerequisites.
- [Back up and restore your Docker folder](/using-deployrr/backups/): back up in v6 from Tools > Backups.
- [Compose file is malformed](/docker/compose-malformed/): more on the Reuse, Recreate and Exit choices.
- [Move from v4 to v5](/archive/v4-to-v5-migration/): the older move, for reference.
- [Get help on Discord](/support/discord/): ask before you move if an app's data matters.
