---
title: What can overwrite or delete your changes
sidebar:
  order: 11
  label: What overwrites your changes
description: Check which Deployrr actions overwrite or delete your edited files and app data, what each one keeps, and how to protect your change first.
type: guide
tags:
  - backups
  - compose
  - docker
applies_to: v6.0+
related:
  - using-deployrr/docker-folder-layout
  - using-deployrr/backups
  - using-deployrr/restart-recreate-reinstall
  - using-deployrr/stack-manager
  - docker/free-disk-space
further_reading:
  - title: "UDMS part 13: Docker system cleanup commands"
    url: https://www.simplehomelab.com/udms-13-docker-and-docker-compose-commands/#System_Cleanup
videos:
  - id: rdqbAr0TFnQ
    start: 1655
    title: "Deployrr 5 walkthrough: Docker disk usage and cleanup"
    note: Shows Deployrr v5. Menus and steps differ in v6.
last_reviewed: 2026-11-13
status: current
old_paths: []
sources: []
---

You edited a file or you have data you care about. Before you run a Deployrr action, check this page. It lists what each action overwrites or deletes, what it keeps, and how to protect your change.

## Overview

This page is the action view: you pick an action and see what it touches. For the file view, where you pick a file and see who writes it, see [What you can edit and what Deployrr writes](/using-deployrr/docker-folder-layout/#what-you-can-edit-and-what-deployrr-writes).

## Before any of these

:::caution
Make a backup first. A deleted file or folder is gone. A rewritten file loses your edits.
:::

1. For the whole Docker folder, go to **Tools** > **Backups** > **Backup** (Pro). A backup stops your running containers while it runs. See [Back up and restore your Docker folder](/using-deployrr/backups/).
2. For one file, copy it to your home folder. Keep the copy outside the Docker folder and outside the Traefik rules folder, so Traefik does not read it. Replace `YOUR_DOCKER_FOLDER`, `HOSTNAME` and `APP` with your own values:

   ```bash
   sudo cp YOUR_DOCKER_FOLDER/compose/HOSTNAME/APP.yml ~/APP.yml.bak
   ```

## Apps and containers

| Action | Overwrites or deletes | Keeps | Protect your change | Details |
| --- | --- | --- | --- | --- |
| **Apps** > **Manage Apps** > the app > **Reinstall** (shown only for a stopped app), or **Install** then **Yes** in **Already Installed** | The app's compose file, the compose files of its database containers, and every config file Deployrr ships for the app. Secrets that Deployrr makes without asking you get new values. | `appdata/APP` data, an existing Traefik rules file, secrets you typed in (the prompt offers to keep them) | Copy the files you changed and, for an app with a database, its files in `secrets/`. Put edits back, then **Recreate**. | [Reinstall](/using-deployrr/docker-folder-layout/#reinstall), [Reinstall an app](/using-deployrr/reinstall-app/) |
| **Apps** > **Manage Apps** > the app > **Remove** | The container, the compose file and the app's secret files, also when you keep app data | `appdata/APP`, if you answer **No** to removing app data | Copy the app's files in `secrets/` first. | [Manage your apps](/using-deployrr/manage-apps/) |
| **Tools** > **Stack Manager** > **Delete** > **Safe** | The container, compose file, the app's entries in `.env`, its Traefik rules file and Dashboard entry | `appdata/APP` and secrets | Copy the compose file and rules file first. | [Stack Manager](/using-deployrr/stack-manager/#delete) |
| **Stack Manager** > **Delete** > **Full** | All of the above, plus `appdata/APP` and the app's secrets. It can also remove unused Docker volumes. You can't undo it. | Nothing of that app | Back up the Docker folder first. | [Stack Manager](/using-deployrr/stack-manager/#delete) |
| **Docker** > **Cleanup** | Stopped containers, unused networks, dangling images and build cache | Running containers, volumes, your Docker folder | Nothing to copy. See [Stopped apps](#stopped-apps-after-a-cleanup). | [Free up disk space](/docker/free-disk-space/#clean-up-with-the-docker-menu) |
| Aliases `dprunevol`, `dprune`, `derase` | All three remove unused volumes. `dprune` also removes stopped containers, unused networks and unused images. `derase` stops and removes every container, then removes all images. | Your Docker folder | Back up first. Docker asks you to confirm each prune. | [Pick a cleanup alias](/docker/free-disk-space/#pick-a-cleanup-alias) |
| **Docker Garbage Collection** app (daily at midnight) | Containers that exited over 7 days ago, unused images and unused volumes. A reinstall rewrites `docker-gc.yml` and the exclude file. | Running containers, your Docker folder | List images to keep in `appdata/docker-gc/docker-gc-exclude`. Copy your edits to both files before a reinstall. | [Free up disk space](/docker/free-disk-space/#install-docker-garbage-collection) |

## Setup steps you run again

| Action | Overwrites or deletes | Keeps | Protect your change | Details |
| --- | --- | --- | --- | --- |
| **Prerequisites** > **Environment** > **Recreate** | Everything in the Docker folder. It first copies the folder to `docker_backup_DATE` in your Backups Folder, but only if a Backups Folder is set. | The copy, if one was made | Make your own backup first. The copy is a plain folder, so **Tools** > **Backups** > **Restore** does not list it. | [Docker folder layout](/using-deployrr/docker-folder-layout/#before-you-edit-or-delete-anything) |
| **Prerequisites** > **Environment** > **Reuse** | The main compose file (written fresh, with no apps), every app compose file, `logs`, `scripts` and other folders it does not keep. It writes a fresh `custom.yml` and resets some `.env` values, such as hostname, server IP and timezone. | `appdata`, `.env` and `secrets` | Copy `custom.yml` first. Needs a Backups Folder. Choose **Exit** to change nothing. | [Docker folder layout](/using-deployrr/docker-folder-layout/#before-you-edit-or-delete-anything) |
| **Proxy** > **Traefik** > **Preparation** | After one Y/y confirmation: `tls-opts.yml`, `middlewares-basic-auth.yml`, `middlewares-buffering.yml`, `middlewares-rate-limit.yml`, `middlewares-secure-headers.yml`, `chain-basic-auth.yml` and `chain-no-auth.yml`. A CrowdSec line you added to those two chain files is lost. It also asks again for the Basic Auth login and Cloudflare token. | `app-APP.yml` and the other rules files | Copy those files first. While Traefik runs, Preparation stops with "Port N is occupied" before it rewrites the rules files. | [Traefik rules files](/using-deployrr/docker-folder-layout/#traefik-rules-files) |
| **Proxy** > **Traefik** > **Staging** or **Production** | Your certificates (`acme.json`), unless you press `Y` at "Reuse existing ... SSL certificate?". Staging clears `traefik.log`. Production renames it to `traefik_staging.log` and starts a new one. Traefik is recreated. | Your other edits in `traefik.yml`, rules files | Press `Y` to keep your certificates. | [Set up Traefik](/reverse-proxy/traefik-setup/) |
| **Security** setups (Authelia, TinyAuth, Google OAuth, Authentik, CrowdSec) | Their `middlewares-NAME.yml` and `chain-NAME.yml` files and their config. See [Login setups](#login-setups). Authentik also replaces `authentik.yml`, `authentik-worker.yml` and `authentik-postgresql.yml`. CrowdSec replaces `crowdsec.yml`. Authelia replaces `authelia-redis.yml`. | The compose files of Authelia, TinyAuth and Google OAuth, with your label edits. See [Edit labels in a compose file](/reverse-proxy/edit-traefik-rules-files/#edit-labels-in-a-compose-file). Other rules files. | Copy the setup's files and your user files first. | [Change passwords and add users](/reverse-proxy/manage-login-users/) |
| **Proxy** > **Traefik** > **Traefikify** with a name you used before | `app-NAME.yml`, only if you answer **Yes** at **File Provider Exists** | The file, if you answer **No** | Copy the file first. | [Traefikify](/reverse-proxy/traefikify/) |
| **Tools** > **ReDash** | The Dashboard's `services.yaml`. Your hand edits in it are lost. It restarts the Dashboard. | The old file, saved as `services.DATE_TIME.yaml`. Dashify entries come back. | Copy your lines from the saved file. | [Dashboard](/using-deployrr/dashboard/#fix-a-dashboard-that-is-out-of-date) |
| **Prerequisites** > **Packages** (Debian) | `/etc/systemd/resolved.conf`, set to Cloudflare and Google DNS on every run. A second run replaces the `.bak` copy with the changed file. | Nothing of your DNS settings | Copy `/etc/systemd/resolved.conf` before the first run. | [Prerequisites](/getting-started/prerequisites/) |
| **System** > **Mounts** > **SMB Mount** | `/etc/samba/credentials`, early in each run, even if you cancel later. This changes the login of your earlier SMB mounts. | Your other mount entries. It copies `/etc/fstab` first. | Use the same NAS user every time. | [SMB and NFS mounts](/storage/smb-nfs-mounts/) |

## Restore and reset

| Action | Overwrites or deletes | Keeps | Protect your change | Details |
| --- | --- | --- | --- | --- |
| **Tools** > **Backups** > **Restore** (Pro) | Your whole Docker folder, replaced by the backup. Running containers stop. | The backup file | At "Do you want to create a current backup before restoring...", any key but `n` makes one in your Backups Folder. | [Backups](/using-deployrr/backups/#restore-a-backup) |
| **Tools** > **Backups** > **MP Restore** (Pro) | All Deployrr settings on this server, and Docker folder files that are also in the package | Docker folder files not in the package | Use it on a new server only. | [Move to a new server](/using-deployrr/move-to-new-server/) |
| **Settings** > **Reset** | Stops and removes your app containers, then deletes unused images, volumes and networks. Clears Deployrr's status, logs and downloaded data, and the cache. | Docker folder, app data, saved settings | Back up first. | [Refresh, Reset or Remove](/getting-started/reset-or-remove-deployrr/#reset-deployrr-status) |
| **Settings** > **Remove** | Deployrr's configuration, saved settings, cache, scripts and logs | Your apps, images and Docker folder | Back up first. | [Refresh, Reset or Remove](/getting-started/reset-or-remove-deployrr/#remove-deployrr) |

## Notes the tables can't hold

### Login setups

- **TinyAuth:** after a rerun, `users_file` holds only the user you typed, and that user sets up two-factor again. No copy is kept. Copy `users_file` before the rerun.
- **Authelia:** a rerun moves `users.yml` and `configuration.yml` to copies with the date and time in their names. It writes new files with one user, makes new secrets and empties `notifications.txt`. Your extra users are only in the dated copy. The run also removes all stopped containers, unused images and unused networks on the server.
- **Google OAuth:** a rerun writes `secrets/oauth_secrets` again. Lines you added by hand are lost. Emails you entered in earlier runs come back.
- **CrowdSec:** a rerun also rewrites `acquis.yaml` and `custom-whitelists.yaml`. Copy them if you edited them. It also moves CrowdSec to a new port and replaces its compose file, so run both bouncers again. See [After you reinstall CrowdSec](/reverse-proxy/crowdsec/#after-you-reinstall-crowdsec).
- **Traefik Bouncer:** a login setup rerun and a **Proxy** > **Traefik** > **Preparation** rerun write chain files without the CrowdSec bouncer. See [A chain file lost the bouncer](/reverse-proxy/crowdsec/#a-chain-file-lost-the-bouncer).

To keep your own Traefik middleware safe from a Preparation rerun, put it in a file with your own name. See [Edit Traefik rules files safely](/reverse-proxy/edit-traefik-rules-files/#add-your-own-middleware).

To avoid most of this, add users by hand. See [Change passwords and add users](/reverse-proxy/manage-login-users/).

### Stopped apps after a cleanup

A cleanup, **Docker Garbage Collection** or an Authelia rerun can remove the container of an app you stopped. Its settings and data stay in the Docker folder. **Start Container** does not list removed containers. **Tools** > **Stack Manager** > **Up** creates them again. Up starts the whole stack, including apps you stopped on purpose, so stop those again afterwards.

To see the Docker cleanup option in use, watch [Deployrr 5 walkthrough: Docker disk usage and cleanup at 27:35](https://youtu.be/rdqbAr0TFnQ?t=1655) (shows Deployrr v5; menus differ in v6). To understand what the prune commands behind the cleanup aliases remove, read [UDMS part 13: Docker system cleanup commands](https://www.simplehomelab.com/udms-13-docker-and-docker-compose-commands/#System_Cleanup) (manual setup).

## Check it worked

1. Before the action, check your copy is there:

   ```bash
   ls -l ~/APP.yml.bak
   ```

2. Run the action.
3. Open the file you protected and check whether your edit is still there.
4. If it is gone, copy your file back. Then use **Tools** > **Stack Manager** > **Recreate** for that app.

## Next steps

- Learn which action applies a change: [Restart, Recreate or Reinstall an app after a change](/using-deployrr/restart-recreate-reinstall/).
- Add your own containers: [Add your own containers with custom.yml](/using-deployrr/custom-yml/).
