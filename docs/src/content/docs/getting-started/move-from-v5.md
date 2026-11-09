---
title: Move from Deployrr v5 to v6
sidebar:
  label: Move from v5 to v6
description: Move from Deployrr v5 to v6 step by step. Set up the core apps fresh, then copy your app data over one app at a time.
type: guide
tags:
  - migration
  - install
  - backups
applies_to: v6.0+
related:
  - getting-started/quick-start
  - using-deployrr/backups
  - using-deployrr/bash-aliases
  - reverse-proxy/check-traefik-logs
  - support/discord
further_reading: []
last_reviewed: 2026-11-09
status: current
old_paths: []
sources: []
---

This guide is for you if you run Deployrr v5 and want to move to v6. It walks you through a fresh v6 setup and shows how to bring your app data across.

:::caution
There is no automatic move from v5 to v6. You install v6 fresh and set up your apps again. Do the steps in order, and keep your v5 copy until every app works in v6.
:::

## Overview

You have two choices:

- Stay on v5. Nothing changes. See [Stay on v5 for now](#stay-on-v5-for-now).
- Move to v6. You stop v5, back up, rename your v5 Docker folder, install v6 and set up the core apps fresh. Then you move your apps over one at a time.

## Why you set up fresh

v6 connects apps to Traefik with Traefik's file provider. Each app gets one small rules file. v5 used Docker labels instead.

Because of this, every app's compose file changed, and so did Traefik's own compose file. A few other things changed too.

v6 also gives each database app its own database service. v5 used shared database services.

## What you need

- Your Linux user name and your server's host name. You fill these in below.
- A license that fits what you want to do. In v6, Traefik needs a Plus or Pro license. Stack Manager needs a Basic, Plus or Pro license. Backups, authentication (Authelia, Authentik, Google OAuth, TinyAuth) and CrowdSec need a Pro license.
- Time to go app by app. Your apps are offline while you work.

In the commands on this page, replace these placeholders with your own values:

- `USERNAME`: your Linux user name.
- `HOSTNAME`: your server's host name. Bash fills `$HOSTNAME` for you if you prefer to type that.
- `APP`: the name of one app, for example `sonarr`. The service name, the container name and the app name are the same.

The commands also assume your Docker folder is `/home/USERNAME/docker`. Change the path if yours is somewhere else.

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

## Move to v6, step by step

### Step 1: Stop the whole v5 stack

Stop everything before you copy or rename anything. This keeps your app data from changing while you work.

In Deployrr v5:

1. Open the main menu.
2. Choose **Tools**.
3. Choose **Stack Manager**.
4. Choose **Down** ("Docker Stack Down").

Or run this command. Change the path and `HOSTNAME` to match your setup:

```bash
sudo docker compose --profile all -f /home/USERNAME/docker/docker-compose-HOSTNAME.yml down --remove-orphans
```

With the [Deployrr bash aliases](/using-deployrr/bash-aliases/): `dcdown`.

### Step 2: Back up

Make two backups. You need them only if something goes wrong, but you cannot make them later.

1. If your server is a Proxmox VM or LXC, take a Proxmox snapshot or backup of it.
2. In Deployrr v5, open **Tools** > **Backups** > **Backup** ("Backup Docker Folder"). This needs a Pro license. Without Pro, copy the folder yourself instead: `sudo cp -a /home/USERNAME/docker /home/USERNAME/docker-v5-backup`.
3. At the end, Deployrr asks "Do you want to restart the Docker stack?". Press any key other than `Y`, so the stack stays down.
4. Open **Tools** > **Backups** > **View** and check that the new backup is listed.

For backups in v6, see [Back up and restore your Docker folder](/using-deployrr/backups/).

### Step 3: Rename your Docker folder

With the stack down, rename the v5 Docker folder. This keeps all your v5 data in one safe place.

```bash
mv /home/USERNAME/docker /home/USERNAME/docker-v5
```

The v6 setup creates a new `docker` folder. Your old data stays in `docker-v5`.

### Step 4: Delete the v5 program folder

Delete `/opt/deployrr`:

```bash
sudo rm -rf /opt/deployrr
```

:::caution
Check the path before you press Enter. `rm -rf` deletes without asking.
:::

This also removes your saved Deployrr settings. In v6 you go through **Prerequisites** again, including **Verify**.

### Step 5: Install and run v6

Follow the [Quick start](/getting-started/quick-start/) to install and start Deployrr v6.

### Step 6: Set up the core apps fresh

Set up these in order:

1. **Prerequisites**. Do all the steps. **Prerequisites** > **Usage** shows the recommended order.
2. **Socket Proxy**. Open **Docker** > **Socket Proxy**.
3. **Deployrr Dashboard**. Open **Docker** > **Deployrr Dashboard**.
4. **Traefik**. Open **Proxy** > **Traefik**. Run **Preparation**, then **Staging**, then **Production**. See [Set up Traefik](/reverse-proxy/traefik-setup/).
5. Authentication. Open the **Security** menu and pick **Authelia**, **Authentik**, **Google OAuth** or **TinyAuth**.
6. CrowdSec, if you want it. Open **Security** > **CrowdSec**. The **Firewall Bouncer** and **Traefik Bouncer** are in the same menu.

Traefik in v6 needs three things:

- Hybrid setup mode.
- A Plus or Pro license.
- Socket Proxy running.

Authentication needs a Pro license, Hybrid mode, and Socket Proxy and Traefik running. CrowdSec needs a Pro license.

Do not try to port the settings of these core apps from v5. It needs Docker and Traefik knowledge and a lot of manual work. A fresh setup is faster and safer.

Before you go on, open the Deployrr Dashboard in your browser to check that the core setup works. If it does not load through your domain, see [Check Traefik logs](/reverse-proxy/check-traefik-logs/).

### Step 7: Copy your own Traefik rules (optional)

Skip this step if you did not add your own Traefik rules in v5. Do it only if you know Docker and Traefik well.

The Traefik rules folder is the same in v5 and v6. It is `appdata/traefik3/rules/HOSTNAME/` inside the Docker folder.

In v6, each app has a rules file named `app-APP.yml` in that folder. Deployrr creates these files. Do not copy the v5 app files.

1. Look in the old folder for your own extra rules files:

   ```bash
   ls /home/USERNAME/docker-v5/appdata/traefik3/rules/HOSTNAME/
   ```

2. Open each file you wrote yourself and review it. Make sure it still fits your v6 setup.
3. Copy the file into the new rules folder:

   ```bash
   sudo cp -a /home/USERNAME/docker-v5/appdata/traefik3/rules/HOSTNAME/YOUR_FILE.yml /home/USERNAME/docker/appdata/traefik3/rules/HOSTNAME/
   ```

   Replace `YOUR_FILE.yml` with the file name.

Traefik picks up files in that folder on its own. You do not restart it. Put each file directly in the folder, not in a subfolder.

### Step 8: Move your apps one at a time

Work on one app, finish it, then start the next. Do this for each app on your list.

:::note
Database apps are different. See [Database apps](#database-apps) before you do them.
:::

1. Install the app in v6. Open **Apps** > **Browse Apps**, pick the app and install it.
2. Wait until the app is running. Open it once to check.
3. Stop the app:

   ```bash
   sudo docker stop APP
   ```

   With the [Deployrr bash aliases](/using-deployrr/bash-aliases/): `dstop APP`.

   In the Deployrr menu: **Tools** > **Stack Manager** > **Stop Container**.

4. Delete the new, empty app data:

   ```bash
   sudo rm -rf /home/USERNAME/docker/appdata/APP
   ```

5. Copy the app data from your renamed folder. The `-a` option keeps owners and permissions:

   ```bash
   sudo cp -a /home/USERNAME/docker-v5/appdata/APP /home/USERNAME/docker/appdata/APP
   ```

6. Recreate the app:

   ```bash
   sudo docker compose --profile all -f /home/USERNAME/docker/docker-compose-HOSTNAME.yml up -d --force-recreate --remove-orphans APP
   ```

   With the [Deployrr bash aliases](/using-deployrr/bash-aliases/): `dcrec APP`.

   In the Deployrr menu: **Tools** > **Stack Manager** > **Recreate** ("Force recreate an app"). See [Stack Manager](/using-deployrr/stack-manager/) for every option.

7. Follow the app's logs until it starts without errors:

   ```bash
   sudo docker logs -f APP
   ```

   With the [Deployrr bash aliases](/using-deployrr/bash-aliases/): `dlogs APP`. It shows the last 50 lines and keeps following. Press Ctrl+C to stop.

   In the Deployrr menu: open the **Apps** menu, choose **Manage Apps**, pick the app and choose **Logs** ("View container logs").

8. Open the app in your browser. Check that your old settings and data are there.
9. Go to the next app.

### Database apps

You can move a database app by hand, but it needs Docker and database knowledge. This guide does not cover it.

We suggest a fresh setup for these apps. v6 gives each app its own database service, where v5 used shared ones.

These v6 apps come with their own database service:

- Authentik
- Autobrr
- Bookstack
- Dockhand
- Flowise
- GameVault
- Guacamole
- Immich
- Langfuse
- n8n
- Nextcloud
- Paperless-NGX
- PdfDing
- Scrutiny
- Speedtest Tracker
- Supabase
- Vikunja

If an app holds data you cannot lose, such as photos or documents, export it from v5 first if the app allows it. You can ask on [Discord](/support/discord/) before you move.

## Check it worked

1. Deployrr v6 opens and shows your installed apps.
2. The Deployrr Dashboard and Traefik run.
3. Each app you moved starts and opens at its usual address.
4. Your old settings, users and content are in each app.
5. Only then, when you are sure you do not need v5, delete the old folder:

   ```bash
   sudo rm -rf /home/USERNAME/docker-v5
   ```

## Troubleshooting

### An app does not start after you copy its data

1. Read the logs with `sudo docker logs -f APP`. With the [Deployrr bash aliases](/using-deployrr/bash-aliases/): `dlogs APP`.
2. Check the owner of the new folder:

   ```bash
   ls -ln /home/USERNAME/docker/appdata/APP
   ```

3. Check the owner of the same folder in your v5 copy:

   ```bash
   ls -ln /home/USERNAME/docker-v5/appdata/APP
   ```

4. If the owners differ, stop the app, delete the new folder and copy it again with `sudo cp -a`. Then recreate the app.

### An app starts empty

There are two common causes:

- You copied the data into a folder with the wrong name. The folder name must match the app name exactly.
- The app keeps its data in a database, not in its app folder. Put the fresh v6 folder back and set the app up fresh. See [Database apps](#database-apps).

To put the fresh folder back, stop the app, delete `appdata/APP`, then run the install again from **Apps** > **Browse Apps**. Deployrr shows **Already Installed** and says it will stop the existing container and recreate it. Confirm to go on.

### My own containers from v5 are gone

Containers you added in v5's `custom.yml` do not carry over. Add them again by hand. See [Add your own containers with custom.yml](/using-deployrr/custom-yml/).

### Can I go back to v5?

Yes. Your v5 folder is untouched, so you can go back.

1. Stop the v6 stack.
2. Rename the folders back. Move the v6 `docker` folder aside, then rename `docker-v5` to `docker`.
3. Run v5.11.2. Use the steps in [Stay on v5 for now](#stay-on-v5-for-now). Because you deleted `/opt/deployrr` in step 4, v5 asks you to go through its setup steps again.

## Next steps

- Learn the v6 backup tools in [Back up and restore your Docker folder](/using-deployrr/backups/).
- Set up the [Deployrr bash aliases](/using-deployrr/bash-aliases/) if you have not yet.
- If a site does not load through Traefik, see [Check Traefik logs](/reverse-proxy/check-traefik-logs/).

## Related

- [Quick start](/getting-started/quick-start/): install v6 and work through Prerequisites.
- [Back up and restore your Docker folder](/using-deployrr/backups/): back up in v6.
- [Deployrr bash aliases](/using-deployrr/bash-aliases/): the shortcuts used in this guide.
- [Check Traefik logs](/reverse-proxy/check-traefik-logs/): find out why a site does not load.
- [Get help on Discord](/support/discord/): ask before you move if an app's data matters.
