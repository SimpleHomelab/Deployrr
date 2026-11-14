---
title: What is in your Docker folder
sidebar:
  order: 11
  label: Docker folder layout
description: See what each file and folder in your Docker folder does, which ones you can edit, how to apply a change, and why one backup covers your app data.
type: guide
tags:
  - compose
  - backups
  - docker
applies_to: v6.0+
related:
  - using-deployrr/restart-recreate-reinstall
  - using-deployrr/custom-yml
  - using-deployrr/edit-env-and-secrets
  - using-deployrr/backups
  - storage/folders
further_reading:
  - title: "UDMS part 14: folders, files and permissions for a Docker server"
    url: https://www.simplehomelab.com/udms-14-docker-media-server/
  - title: "UDMS part 18: preparing the Traefik folders"
    url: https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Prepare_Traefik_Folders
videos:
  - id: THuLgGwq0vg
    start: 335
    title: "Ultimate Docker Server: the Docker folder, .env, appdata and compose files"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
  - id: KMZIyoZ3jWM
    start: 1493
    title: "Traefik 3 guide: Traefik appdata, rules, acme.json and logs folders"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
  - id: KMZIyoZ3jWM
    start: 2898
    title: "Traefik 3 guide: switching from staging to production and emptying acme.json"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
last_reviewed: 2026-11-14
status: current
old_paths: []
sources: []
---

Deployrr keeps everything it sets up for your apps in one folder, called the Docker folder. This page is a map of that folder. It shows what each file and subfolder is for, which ones you can edit, which ones Deployrr writes again, and which action applies a change.

## Overview

You pick the Docker folder in **Prerequisites** > **Docker Folder**. The box suggests `/home/YOUR_USER/docker`. You can choose another path. The **Environment** step then fills the folder.

In this page, `HOSTNAME` is the hostname of your server. The folder names below use your real hostname. For example, if your server is called `homelab`, you have `compose/homelab`. If you rename the server later, see [Change the hostname](/host/change-hostname/). **Tools** > **Change Hostname** does not update `scripts/HOSTNAME`. If you use **Delay Media Apps**, run it again afterwards.

Your backups are not in this folder. **Prerequisites** has a separate **Backups Folder** step. It suggests `/home/YOUR_USER/docker_backups`.

## The folder map

This is what you see after Prerequisites and an install of Traefik and one app. Your list of apps will differ.

```txt
docker/
├── .env
├── docker-compose-HOSTNAME.yml
├── appdata/
│   ├── APP/
│   └── traefik3/
│       ├── acme/
│       │   └── acme.json
│       └── rules/
│           └── HOSTNAME/
│               ├── app-APP.yml
│               ├── chain-no-auth.yml
│               ├── middlewares-secure-headers.yml
│               └── tls-opts.yml
├── compose/
│   └── HOSTNAME/
│       ├── APP.yml
│       └── custom.yml
├── logs/
│   └── HOSTNAME/
│       └── traefik/
│           ├── access.log
│           └── traefik.log
├── scripts/
│   └── HOSTNAME/
│       └── start-media-after-boot.sh
└── secrets/
```

The `scripts` folder only exists if you ran **System** > **Mounts** > **Rclone** > **Delay Media Apps**. See [Apps are stopped or show empty folders after a reboot](/docker/apps-not-starting-after-reboot/). The Traefik rules folder holds a few more files than the tree shows, such as more `middlewares-*.yml` and `chain-*.yml` files.

To see a similar folder layout built by hand, watch [Ultimate Docker Server in 52 min: folders and files at 5:35](https://youtu.be/THuLgGwq0vg?t=335) (manual Docker Compose setup; names and permissions differ from Deployrr v6). You can also read [UDMS part 14: folders, files and permissions](https://www.simplehomelab.com/udms-14-docker-media-server/) (manual setup).

## What each part is for

| Path | What it is |
| --- | --- |
| `.env` | Your settings and values: ports, folders, hostname, domain, passwords and keys. |
| `docker-compose-HOSTNAME.yml` | The main compose file. It lists the compose file of each app you installed. |
| `compose/HOSTNAME/APP.yml` | The compose file of one app. |
| `compose/HOSTNAME/custom.yml` | A file for your own containers. |
| `appdata/APP/` | The data and config of one app. |
| `appdata/traefik3/rules/HOSTNAME/` | Traefik rules files. Each app behind Traefik has an `app-APP.yml` file here. |
| `appdata/traefik3/acme/acme.json` | Where Traefik keeps your certificates. |
| `logs/HOSTNAME/` | Logs. Traefik logs are in `traefik/`. Rclone logs, such as `rclone-REMOTE.log` and `rclone-REMOTE-timer.log`, sit next to it. |
| `scripts/HOSTNAME/` | The script that starts your media apps after a reboot (`start-media-after-boot.sh`). |
| `secrets/` | Secret files, such as passwords and keys, one file each. |

`.env` and `secrets/` belong to root. Use `sudo` to read them in a terminal. See [Edit .env values and secrets](/using-deployrr/edit-env-and-secrets/). **Tools** > **Diagnostics** checks that `.env` has the permissions it should (600) and can fix them. See [Diagnostics](/support/diagnostics/).

### Common names in .env

The compose files use these names, for example `$DOCKERDIR/appdata/sonarr:/config`. This table shows where each value comes from.

| Name | What it holds | Set by |
| --- | --- | --- |
| `PUID`, `PGID`, `PRIMARY_USERNAME`, `USERDIR` | Your Linux user, its IDs and its home folder | **Prerequisites** > **Environment** |
| `TZ` | Your time zone, taken from the server (UTC if Deployrr can't detect it) | **Prerequisites** > **Environment** |
| `DOCKERDIR` | The path of your Docker folder | **Prerequisites** > **Environment** |
| `HOSTNAME` | The server's hostname | **Prerequisites** > **Environment**, and **Tools** > **Change Hostname** |
| `SERVER_LAN_IP` | The server's IP address | **Prerequisites** > **Server IP** (Environment copies it if set), and **Tools** > **Change Server IP** |
| `DOMAINNAME_1` | Your domain | **Prerequisites** > **Domain 1** (Environment copies it if set). An empty entry removes it. |
| `LOCAL_IPS`, `CLOUDFLARE_IPS` | IP ranges Traefik trusts | **Prerequisites** > **Environment** |
| `MEDIADIR1`, `DOWNLOADSDIR`, `BOOKSDIR` and the other folder names | Your media, downloads and other folders | **System** > **Folders**. See the [full list of folder names](/storage/folders/). |
| `APP_PORT`, for example `SONARR_PORT` | The port of one app | The app's install. See [Port already in use](/docker/port-already-in-use/). |
| `APP_VERSION_PIN`, for example `TRAEFIK_VERSION_PIN` | The image version of one app | **Prerequisites** > **Environment** for all apps, and the app's install if its pin is missing. See [Update apps](/using-deployrr/update-apps/). |
| `APP_SUBDOMAIN`, for example `NEXTCLOUD_SUBDOMAIN` | The subdomain, for the few apps that need it inside the app | The app's install |

`APP` is the app's name in capitals without dashes, so `open-webui` becomes `OPENWEBUI`. Most apps get their subdomain from their Traefik rules file, not from `.env`. Apps with a database or login also add their own values, such as passwords and keys.

For the server IP, the domain and the hostname, use the menu, not a hand edit. **Prerequisites** > **Server IP** and **Domain 1** update `.env` and the copy Deployrr keeps for itself. The **Tools** entries (Pro) do more than change `.env`. **Change Hostname** renames the folders and files named after the host. **Change Server IP** writes the new IP into your Traefik rules files and the Dashboard. See [Change the hostname](/host/change-hostname/) and [Change the server IP](/host/change-server-ip/).

## What you can edit and what Deployrr writes

Use this table before you change a file by hand. To start from an action instead, such as a cleanup or a setup you run again, see [What can overwrite or delete your changes](/using-deployrr/what-overwrites-your-changes/).

| File or folder | Can you edit it? | What Deployrr does with it | Apply a change with |
| --- | --- | --- | --- |
| `.env` | Yes. Use **Tools** > **.env Editor** (Pro) or edit it by hand. | Adds and changes values when you install apps or use **System** > **Folders**. | **Recreate** |
| `docker-compose-HOSTNAME.yml` | Rarely. Leave the lines that say `DO-NOT-DELETE` alone. | Adds one line for each app you install. | **Recreate** |
| `compose/HOSTNAME/APP.yml` | Yes, but a **Reinstall** replaces it with the default file and your edits are lost. | Writes it when you install or reinstall the app. | **Recreate** |
| `compose/HOSTNAME/custom.yml` | Yes. This is the place for your own changes. | Creates it when you run **Prerequisites** > **Environment**. Running Environment again replaces it with a fresh file. | `dcup SERVICE_NAME` or `dcrec SERVICE_NAME` |
| `appdata/APP/` | Yes, for the app's own settings. | On a **Reinstall**, keeps your data but writes again every config file Deployrr ships for that app. | **Recreate**, or the app's own reload |
| `appdata/traefik3/rules/HOSTNAME/app-APP.yml` | Yes. | Writes it when you install an app behind Traefik. Keeps an existing one on a reinstall. **Traefikify** asks before it overwrites one. | Nothing. Traefik loads the change by itself. |
| Other files in `appdata/traefik3/rules/HOSTNAME/` | Yes, but keep a copy. | Writes the base files when you run Traefik **Preparation**. See [Traefik rules base files](#traefik-rules-files). | Nothing. Traefik loads the change by itself. |
| `secrets/` files | Yes. Use **Tools** > **Secrets Editor** (Pro). | Writes a secret file when an app needs one. | **Recreate** |
| `logs/` | Read only. | Traefik and Rclone write their logs here. | Not needed |
| `scripts/HOSTNAME/` | No. | Writes the script when you run **Delay Media Apps**. | Not needed |

In the table, replace `SERVICE_NAME` with the name of your own service. To pick between Recreate, Reinstall and the rest, see [Restart, Recreate or Reinstall an app after a change](/using-deployrr/restart-recreate-reinstall/#which-one-after-which-change).

**Recreate** is **Tools** > **Stack Manager** > **Recreate**. It needs a Basic, Plus or Pro license and lists only containers that already exist. For a new service in `custom.yml`, use `dcup` or `dcrec`. These aliases come from **System** > **Bash Aliases**.

### Reinstall

You reach **Reinstall** in **Apps** > **Manage Apps** > the app > **Reinstall**. It shows only when the app is stopped. For a running app, use **Apps** > **Browse Apps** > the app > **Install**, then **Yes** in the **Already Installed** box. For the full steps, see [Reinstall an app and keep its data](/using-deployrr/reinstall-app/).

Reinstall replaces `compose/HOSTNAME/APP.yml`. It also writes again every config file the app ships in `appdata/APP`, so your edits to those files are lost. See [which apps and files](/using-deployrr/what-overwrites-your-changes/#config-files-a-reinstall-writes-again). Other files in `appdata/APP` stay. An existing `app-APP.yml` rules file stays too. Deployrr still asks for the subdomain, login and exposure, but your answers do not change that file. Edit the rules file yourself instead.

:::caution
Some apps get passwords and keys that Deployrr makes for you, such as the database password of Nextcloud or n8n. A reinstall writes new values into those files in `secrets/`, while the app's database in `appdata` keeps the old password. Before you reinstall an app that has its own database, copy its secret files. For example, for n8n:

```bash
sudo cp YOUR_DOCKER_FOLDER/secrets/n8n_postgresql_password ~/n8n_postgresql_password.bak
```

If the app can't reach its database after the reinstall, ask for help on [Discord](/support/discord/) and keep that copy. To change a database password on purpose, see [Change a database password safely](/apps/change-database-password/).
:::

### The main compose file

`docker-compose-HOSTNAME.yml` has comment lines that end in `DO-NOT-DELETE`. Deployrr uses them to add apps. If you delete one, you may see an error that the file is malformed. See [Docker environment setup fails with: docker-compose file is malformed](/docker/compose-malformed/).

### Your own containers

`custom.yml` is off at first. Its line in the main compose file starts with `#`. Turn it on and add your services as shown in [Add your own containers with custom.yml](/using-deployrr/custom-yml/). The file's first line says Auto-Traefik will not change it. Running **Prerequisites** > **Environment** again replaces it with a fresh file, so copy it somewhere safe first.

### Traefik rules files

Each `app-APP.yml` file tells Traefik where to find one app. If an app behind Traefik shows a 404 or 502, check the address on the `url:` line in this file. See [One app behind Traefik shows 404, 502 or Gateway Timeout](/reverse-proxy/app-404-or-502/). To edit a file, add your own middleware or restore a copy, see [Edit Traefik rules files safely](/reverse-proxy/edit-traefik-rules-files/).

To make a file again from the menu, run **Traefikify** with the same name. Deployrr shows **File Provider Exists** and asks if you want to overwrite it. See [Put any app behind Traefik with Traefikify](/reverse-proxy/traefikify/).

The other files in the rules folder (`tls-opts.yml`, `middlewares-*.yml` and `chain-*.yml`) come from Traefik **Preparation** and from the login setups. Don't rename or delete them.

If you run Preparation again, Deployrr says it was already done and asks you to press Y to go on. After a Y, it writes fresh copies of seven files: `tls-opts.yml`, `middlewares-basic-auth.yml`, `middlewares-buffering.yml`, `middlewares-rate-limit.yml`, `middlewares-secure-headers.yml`, `chain-basic-auth.yml` and `chain-no-auth.yml`. Your hand edits to these seven are lost, including a line CrowdSec added to one of the chain files. Keep a copy. A rerun only works while Traefik is stopped, because Preparation stops with "Port N is occupied" while Traefik runs. That check comes after the **Traefik Secrets** box, so a rerun that stops there has already saved the Basic Auth and Cloudflare values you typed. A Basic Auth Password left blank keeps the old one.

To understand how the Traefik folders fit together, watch [Master Traefik 3 in 60 min: Traefik folders at 24:53](https://youtu.be/KMZIyoZ3jWM?t=1493) (manual Docker Compose setup). You can also read [UDMS part 18: preparing the Traefik folders](https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Prepare_Traefik_Folders) (manual setup).

The setups for Authelia, Authentik, Google OAuth, TinyAuth and CrowdSec write their own rules files each time you run them.

Traefik **Staging** and **Production** do not touch rules files. In `compose/HOSTNAME/traefik.yml` they only turn the Let's Encrypt staging server line on (Staging) or off (Production). Staging deletes the old `traefik.log` and starts an empty one. Production moves the old one to `traefik_staging.log`, then starts an empty one.

When you run Staging or Production again, Deployrr first says it was already done and asks you to press Y to go on. Any other key goes back and changes nothing. After a Y, if `acme.json` holds a certificate of the same kind, Deployrr asks "Reuse existing staging SSL certificate?" or "Reuse existing production SSL certificate?". Press Y to keep it. Any other key empties `acme.json`, and Traefik asks for new certificates. In every other case, Staging and Production start with an empty `acme.json`. See [Set up Traefik](/reverse-proxy/traefik-setup/).

## Before you edit or delete anything

:::caution
Make a backup first. A wrong edit can stop an app or all your apps from starting. A deleted file or folder is gone.

Back up the whole Docker folder from **Tools** > **Backups** (Pro). See [Back up and restore your Docker folder](/using-deployrr/backups/). A backup stops your running containers while it runs.
:::

For a quick copy of one file, save it in your home folder, outside the Docker folder. Use a bare file name as the target. Replace `YOUR_DOCKER_FOLDER` with the path to your Docker folder and the rest with your own names. For example, for a rules file:

```bash
sudo cp YOUR_DOCKER_FOLDER/appdata/traefik3/rules/HOSTNAME/app-NAME.yml ~/app-NAME.yml.bak
```

For `custom.yml`:

```bash
sudo cp YOUR_DOCKER_FOLDER/compose/HOSTNAME/custom.yml ~/custom.yml.bak
```

Keep the copy outside the rules folder, so Traefik does not read it.

:::caution
Do not run **Prerequisites** > **Environment** again on a server with apps. First set a Backups Folder and make your own backup. Keep the Backups Folder outside the Docker folder: with a Backups Folder such as `docker/backups`, Recreate and Reuse delete it, together with your backups and, for Reuse, your app data.

Deployrr first warns "It appears that Docker Environment is already setup..." and asks if you want to proceed. If the Docker folder already has files, the **Create Docker Root Folder** box then asks you to pick one of three options.

- **Recreate** ("Delete existing and create new folder") copies the whole Docker folder to `docker_backup_DATE` in your Backups Folder, then deletes everything in it except hidden files such as `.env`. If no Backups Folder is set, nothing is copied before the delete. The copy is a plain folder, not a `.tar.gz` backup, so **Tools** > **Backups** > **Restore** can't use it. Copy files back from it by hand.
- **Reuse** keeps `appdata` (including the Traefik rules), `.env` and `secrets`. It deletes everything else: `docker-compose-HOSTNAME.yml`, every `compose/HOSTNAME/APP.yml`, `logs` and `scripts`. Your installed apps drop out of the stack until you reinstall them. It writes a fresh `custom.yml`, so copy yours somewhere safe first. Reuse needs a Backups Folder. Without one you see "Cannot preserve data - BACKUP_FOLDER not set".

Choose **Exit** to make no changes. See [Prerequisites, step by step](/getting-started/prerequisites/).
:::

## Where your app data lives

Deployrr apps keep their data in `appdata/APP/`. They use folders on your disk, not Docker volumes. None of the app compose files that Deployrr ships declares a named volume.

This means:

- A backup of the Docker folder holds each app's settings and data, plus `.env`, `secrets`, your compose files and your Traefik rules.
- Restoring that backup brings an app back with its data.
- Deleting an app's folder in `appdata` deletes its data. Do not do this to free space. See [Free up disk space used by Docker](/docker/free-disk-space/).
- In **Tools** > **Stack Manager**, a safe **Delete** keeps the app's data ("Retain App's data"). A full **Delete** removes it. See [Stack Manager](/using-deployrr/stack-manager/). If **Delete** can't remove an app, see [Remove an app by hand](/using-deployrr/remove-app-by-hand/).

Some things sit outside the Docker folder, so a backup does not cover them:

- Your media, downloads and other folders from **System** > **Folders**. See [Set your media, downloads and other folders](/storage/folders/).
- Any container you added yourself in `custom.yml` that stores its data somewhere else.
- Docker's own images and volumes.

## Check it worked

1. List the top of your Docker folder. Replace `YOUR_DOCKER_FOLDER` with your path:

   ```bash
   sudo ls -a YOUR_DOCKER_FOLDER
   ```

2. You see `.env`, `docker-compose-HOSTNAME.yml`, `appdata`, `compose` and `logs`. You also see `secrets`.
3. List the app compose files:

   ```bash
   sudo ls YOUR_DOCKER_FOLDER/compose/*
   ```

4. You see `custom.yml` and one file for each app you installed.

## Next steps

- Make a backup before your next change: [Back up and restore your Docker folder](/using-deployrr/backups/).
- Apply a change you made: [Restart, Recreate or Reinstall an app after a change](/using-deployrr/restart-recreate-reinstall/).
- Add your own containers: [Add your own containers with custom.yml](/using-deployrr/custom-yml/).
