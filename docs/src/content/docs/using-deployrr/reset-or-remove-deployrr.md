---
title: "Refresh, Reset or Remove Deployrr (Settings menu)"
sidebar:
  label: Refresh, Reset or Remove
description: Learn what Refresh, Reset and Remove do in the Deployrr Settings menu, which one to pick, and what each leaves behind on your server.
type: guide
tags:
  - install
  - docker
  - backups
  - host
applies_to: v6.0+
related:
  - using-deployrr/backups
  - getting-started/prerequisites
  - using-deployrr/stack-manager
  - getting-started/updating-deployrr
  - apps/manage-apps
further_reading:
  - title: "UDMS part 13: Docker Compose commands and Bash aliases to stop and start a stack"
    url: https://www.simplehomelab.com/udms-13-docker-and-docker-compose-commands/
videos:
  - id: rdqbAr0TFnQ
    start: 5059
    title: "Deployrr 5 walkthrough: Settings menu Refresh, Reset and Remove"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: Ux9khKhqhcg
    start: 523
    title: "Bash aliases: bring a whole Docker Compose stack down and back up"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
last_reviewed: 2026-11-11
status: current
old_paths: []
sources: []
---

The **Settings** menu has three items that clear things out: **Refresh**, **Reset** and **Remove**. This guide shows what each one does, which one you need, and what to do afterwards.

## Overview

Start with **Refresh**. It is safe and fixes most odd behaviour. **Reset** and **Remove** are last resorts.

| | Refresh | Reset | Remove |
| --- | --- | --- | --- |
| Menu line | `Clear Deployrr Cache` | `Reset Deployrr Status` | `Remove Deployrr` |
| Asks you to confirm | No | Yes (`Y`) | Yes (`Y`) |
| Stops your apps | No | Yes, currently | No |
| Deletes Docker images | No | Yes, currently | No |
| Deletes saved settings (Docker folder, username, domain, Mode) | No | No | Yes |
| Deletes setup status (what shows as DONE) | No | Yes | Yes |
| Deletes the Deployrr program and its logs | No | Yes, currently | Yes |
| Touches your Docker folder and app data | No | No | No |
| What you do next | Start Deployrr again | Run the installer, then redo some Prerequisites | Nothing, or clean up by hand |

:::caution
Reset currently stops and removes your app containers. Read [Reset](#reset-deployrr-status) before you press `Y`.
:::

## Which one do I need?

- **Deployrr acts oddly after an update, or a run was cut off.** Use [Refresh](#refresh-deployrr).
- **You want a clean start for Deployrr, and you accept that your apps stop.** Use [Reset](#reset-deployrr-status). Try Refresh first.
- **You want Deployrr gone but your apps to keep running.** Use [Remove](#remove-deployrr).
- **You want to update Deployrr.** None of these. See [Updating Deployrr](/getting-started/updating-deployrr/).
- **You want to refresh the list of apps.** That is a different command. See [Apps > Refresh Cache](/apps/manage-apps/).

## Other items in Settings

The **Settings** menu is titled **Deployrr Settings**. You do not need a license to open it or to use Refresh, Reset or Remove. It holds these items:

- **Intro**: turns the intro messages on the main menu on or off.
- **Mode**: switches between NORMAL and EXPERT. See [EXPERT mode](/using-deployrr/expert-mode/).
- **Version Pins**: edits Docker image version pins. It needs a Pro license.
- **Status**: shows the Deployrr status.
- **Logs**: makes a sanitized log you can share. Type `Y` and press Enter to start. The log is saved in the folder you ran Deployrr from, and the screen ends with "Sanitized log ready for sharing". Read the log before you share it.
- **Refresh**, **Reset** and **Remove**: covered below.

To see these three items on screen, watch [Deployrr 5 walkthrough: Settings menu at 1:24:19](https://youtu.be/rdqbAr0TFnQ?t=5059) (shows Deployrr v5; menus and steps differ in v6). It says Reset leaves your Docker apps alone. In v6, Reset currently stops your apps, so follow this page for Reset.

## Refresh Deployrr

Refresh clears a cached copy of Deployrr's own files. Deployrr gets a fresh copy the next time it starts. Refresh does not touch your apps, settings or status.

1. Open **Settings**.
2. Select **Refresh**.

There is no confirmation. You see `1/1 Clearing Deployrr cache`, then `Cache cleared`, then:

```txt
Refresh complete. Please re-run Deployrr to continue
```

Deployrr exits. Start it again to continue.

## Reset Deployrr status

Reset deletes Deployrr's setup status, program and logs. It keeps your saved settings, such as the Docker folder, username, server IP, domain, Intro and Mode. Use it only when Refresh did not help.

### What the screen tells you

The screen is titled **Reset Deployrr Status**. It warns that the operation deletes all user-supplied and status information. It says:

- All Deployrr configuration and status files will be removed.
- You will need to complete setup steps again.
- Deployrr will auto-detect current status upon restart.
- Docker containers will remain running.
- Application data will not be deleted.

### What actually happens

Currently, Reset keeps your app data but stops your apps.

After you press `Y`, you see four steps:

1. `1/4 Stopping Docker services`. This stops and removes your app containers.
2. `2/4 Cleaning unused Docker data`. This deletes every Docker image that no running container uses. Because your apps are now down, that means all of your app images. It also deletes unused networks, build cache and unused volumes. A named volume that no container uses can be deleted too.
3. `3/4 Resetting Deployrr configuration`. This deletes Deployrr's setup status, logs and the Deployrr program in `/opt/deployrr`. The one thing kept is the file with your saved settings: Docker folder, username, server IP, domain, setup mode, Intro, Mode and similar values.
4. `4/4 Clearing cache files`, then `Reset complete. Please re-run Deployrr to continue`.

Reset does not touch your Docker folder. Your `.env` file, compose files, app data, secrets and rules files stay.

Containers you started outside Deployrr that are still running keep their images.

:::note
Reset currently also deletes the Deployrr program. The `deployrr` command (`/usr/local/bin/deployrr`) then points to a file that no longer exists, so it will not start until you run the installer again.
:::

### Before you reset

1. Run **Settings** > **Logs** if you may need help later. Reset deletes Deployrr's logs. See [Support on Discord](/support/discord/) for where to share the log.
2. Back up your Docker folder. See [Back up and restore](/using-deployrr/backups/).
3. Make sure you can wait for every app image to download again. Docker Hub limits can slow this. See [Docker Hub rate limit](/docker/rate-limit/).

### Reset step by step

1. Open **Settings**.
2. Select **Reset**.
3. Read the warning.
4. Type `Y` and press Enter to continue. Any other key goes back.
5. Wait for `Reset complete. Please re-run Deployrr to continue`.

### After a reset

1. Run the install command again. See [Run the installer again](/getting-started/updating-deployrr/#run-the-installer-again) for the command and [Install errors](/getting-started/install-errors/) if you see `command not found`.
2. Start Deployrr and open **Prerequisites**. Your saved settings (Docker folder, username, server IP, domain, setup mode) are still set. **Environment** shows DONE again if your Docker folder is intact, so you don't need to redo it. Redo **Disclaimers**, **Packages**, **Build Cache**, **System Checks** and **Domain Checks**, and verify your license again if it shows as not done. See [Prerequisites](/getting-started/prerequisites/).
3. **System** > **Bash Aliases** shows DONE again if the Deployrr block is still in `~/.bashrc` and the alias file is still in your Docker folder.
4. Bring your apps back. **Tools** > **Stack Manager** > **Up** works once every Prerequisite is DONE and needs a Basic, Plus or Pro license. See [Stack Manager](/using-deployrr/stack-manager/). Or, with the [Bash aliases](/using-deployrr/bash-aliases/), run:

   ```bash
   dcup
   ```

   Without the aliases, run this. Replace `YOUR_DOCKER_FOLDER` with the path to your Docker folder and `HOSTNAME` with your server's hostname.

   ```bash
   sudo docker compose --profile all -f YOUR_DOCKER_FOLDER/docker-compose-HOSTNAME.yml up -d
   ```

Docker downloads all app images again, so this can take a while.

To see how an alias brings a whole stack down and back up, watch [Bash aliases: dc down and dc up at 8:43](https://youtu.be/Ux9khKhqhcg?t=523) (manual Docker Compose setup; Deployrr does these steps for you).

## Remove Deployrr

Remove uninstalls Deployrr. Your apps keep running.

### What the screen tells you

The screen is titled **Remove Deployrr**. It warns that the operation permanently removes Deployrr from your system. It says:

- Deployrr configuration files will be deleted.
- Cache files will be cleared.
- Deployrr scripts will be removed.
- Docker containers will remain running.
- Application data will not be deleted.

### Remove step by step

1. Run **Settings** > **Logs** if you may need help later. Remove deletes Deployrr's logs.
2. Back up your Docker folder. See [Back up and restore](/using-deployrr/backups/).
3. Open **Settings**.
4. Select **Remove**.
5. Read the warning.
6. Type `Y` and press Enter to continue. Any other key goes back.

You see `1/3 Removing Deployrr configuration`, `2/3 Clearing cache files`, `3/3 Removing Deployrr scripts`, then `Deployrr removal complete`. Deployrr exits.

### What Remove leaves behind

- All app containers and images. Your apps keep running.
- Your Docker folder, with compose files, `.env`, app data, secrets and Traefik rules.
- The lines Deployrr added to `~/.bashrc` and `~/.bash_profile`. They sit in blocks marked `Bash Aliases added by Deployrr` and `Sourcing .bashrc (added by Deployrr)`.
- Possibly the `/usr/local/bin/deployrr` link, which now points to nothing. Check with `ls -l /usr/local/bin/deployrr`.
- Docker itself and the packages Deployrr installed.
- Mounts you added. To remove them, see [SMB and NFS mounts](/host/smb-nfs-mounts/) or [Rclone SMB setup](/host/rclone-smb-setup/).

You can still manage your apps with `docker compose` or the [Bash aliases](/using-deployrr/bash-aliases/). To understand what these commands do, read [UDMS part 13: Docker Compose commands and Bash aliases](https://www.simplehomelab.com/udms-13-docker-and-docker-compose-commands/) (manual setup).

### Clean up by hand (optional)

Do this only if you want every trace gone.

:::caution
These steps delete files and stop your apps. Back up your Docker folder first. See [Back up and restore](/using-deployrr/backups/). Deleting the Docker folder deletes your app data.
:::

1. Stop your apps. Replace `YOUR_DOCKER_FOLDER` and `HOSTNAME` as in the earlier command.

   ```bash
   sudo docker compose --profile all -f YOUR_DOCKER_FOLDER/docker-compose-HOSTNAME.yml down
   ```

2. If the link is still there, delete it.

   ```bash
   sudo rm /usr/local/bin/deployrr
   ```

3. Open `~/.bashrc` in a text editor and delete the lines Deployrr added.
4. Open `~/.bash_profile` and delete the lines Deployrr added.
5. Delete the Docker folder only when your backup is safe and you no longer need the app data.

### Install Deployrr again later

Run the [install command](/getting-started/updating-deployrr/#run-the-installer-again) again. Deployrr starts fresh, and you redo the [Prerequisites](/getting-started/prerequisites/).

:::caution
**Prerequisites** > **Environment** offers **Reuse** for an old Docker folder, but Reuse keeps only `appdata`, `.env` and `secrets`. It removes everything else, including your app compose files, Traefik rules and the alias file, and writes a fresh `custom.yml`. Back up the Docker folder and copy `custom.yml` first. Read the Reuse and Recreate table on [Prerequisites](/getting-started/prerequisites/) before you pick one.
:::

## Check it worked

- After **Refresh**: Deployrr exited with `Refresh complete`. Start it again and the main menu opens.
- After **Reset**: `Reset complete` appeared. After you reinstall and start Deployrr, your saved settings and **Environment** still show, and Disclaimers, Packages, Build Cache, System Checks and Domain Checks show as not done.
- After **Remove**: `Deployrr removal complete` appeared. Running `deployrr` fails, and `sudo docker ps` still lists your apps.

## Next steps

- If you reset, reinstall with the [Quick start](/getting-started/quick-start/) and redo [Prerequisites](/getting-started/prerequisites/).
- If you are not sure a backup is current, read [Back up and restore](/using-deployrr/backups/).

## Related

- [Back up and restore](/using-deployrr/backups/): make a copy of your Docker folder before Reset or Remove.
- [Prerequisites, step by step](/getting-started/prerequisites/): the steps you redo after a Reset.
- [Stack Manager](/using-deployrr/stack-manager/): bring your apps back up after a Reset.
- [Updating Deployrr](/getting-started/updating-deployrr/): update instead of resetting.
- [Install and manage apps](/apps/manage-apps/): the Apps menu, including Refresh Cache for the app list.
