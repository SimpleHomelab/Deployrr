---
title: Restart, Recreate or Reinstall an app after a change
sidebar:
  label: Restart vs Recreate vs Reinstall
description: Pick Restart, Recreate or Reinstall after you change a port, folder, .env value or compose file, and see which one applies your change.
type: how-to
tags:
  - compose
  - docker
  - shell
applies_to: v6.0+
related:
  - using-deployrr/stack-manager
  - apps/reinstall-app
  - using-deployrr/folders
  - apps/manage-apps
  - using-deployrr/bash-aliases
last_reviewed: 2026-11-12
status: current
old_paths: []
sources: []
further_reading:
  - title: "UDMS part 13: Managing specific services with Docker Compose"
    url: https://www.simplehomelab.com/udms-13-docker-and-docker-compose-commands/#Managing_Specific_Services
videos:
  - id: Ux9khKhqhcg
    start: 120
    title: "Bash aliases guide: restart and recreate a container by hand"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
---

You changed a port, a folder or a setting, and the app still behaves the old way. This page tells you which action applies your change: Restart, Recreate or Reinstall.

## Before you start

- The app is installed.
- For **Recreate** in Stack Manager, you have a Basic, Plus or Pro license. The `dcrec` alias works with any license. See [Stack Manager](/using-deployrr/stack-manager/).
- For **Reinstall**, you need a Basic, Plus or Pro license. See [Licenses](/getting-started/licenses/).

## What each action does

| Action | Where | What it does | Picks up changes to `.env` or the compose file? |
| --- | --- | --- | --- |
| **Restart** | **Apps** > **Manage Apps** > the app > **Restart**. Alias: `dcrestart APP`. Command: `sudo docker restart NAME`. | Restarts the same container. | No |
| **Stop** then **Start** in Manage Apps | **Apps** > **Manage Apps** > the app | Stops the app, then starts it with the app's compose file. | Can apply compose or `.env` changes. Use **Recreate** to be sure. |
| **Start Container** and **Stop Container** in Stack Manager | **Tools** > **Stack Manager** | Plain start and stop of the container. | No |
| **Recreate** | **Tools** > **Stack Manager** > **Recreate**. Alias: `dcrec APP`. | Builds a new container from the app's compose file and your `.env` values. | Yes, always |
| **Up** | **Tools** > **Stack Manager** > **Up** ("Docker Stack Up"). Alias: `dcup`. | Starts the whole stack. | Applies changed compose or `.env` values for the services that changed. It does not pick up a changed secret file, a config file you edited in place, or a re-pulled image under the same tag. Use **Recreate** to be sure. |
| **Reinstall** | **Apps** > **Browse Apps** > the app > **Install**, or **Manage Apps** > the app > **Reinstall** (stopped apps only) | Writes the app's compose file again and asks the install questions again. | Yes, and it also turns on lines that are only switched on at install. |

In the aliases and commands, replace `APP` with the app's name, such as `sonarr`. Replace `NAME` with the app's container name, which is usually the same.

:::note
**Restart** does not read your `.env` file or compose file again. If you restart an app after editing either one, nothing changes.
:::

To see the difference between restart and recreate on the command line, watch [Bash aliases guide: restart and recreate at 2:00](https://youtu.be/Ux9khKhqhcg?t=120) (manual Docker Compose setup; Deployrr does these steps for you). For the matching Docker Compose commands, see [UDMS part 13: Managing specific services](https://www.simplehomelab.com/udms-13-docker-and-docker-compose-commands/#Managing_Specific_Services) (manual setup, to understand how it works).

## Steps

Use this list to choose.

1. If you only want the app to start fresh, with the same settings, use **Restart**. In Deployrr, go to **Apps** > **Manage Apps**, select the app, choose **Manage**, then **Restart**. Look for the app's name followed by "restarted successfully", for example "Sonarr restarted successfully". In a terminal, run:

   ```bash
   sudo docker restart NAME
   ```

   With the Deployrr bash aliases: `dcrestart APP`.

2. If you changed a value in `.env`, or edited the app's compose file, use **Recreate**. Go to **Tools** > **Stack Manager** > **Recreate**. The list also offers `all` and `exit`. Type the number of the app and press Enter. Deployrr stops the app first, then builds it again. Look for "APP recreated". With the Deployrr bash aliases:

   ```bash
   dcrec APP
   ```

   Without the aliases, run this. Replace `YOUR_DOCKER_FOLDER` with the path to your Docker folder, `HOSTNAME` with your server's hostname and `APP` with the app's name:

   ```bash
   sudo docker compose --profile all -f YOUR_DOCKER_FOLDER/docker-compose-HOSTNAME.yml up -d --force-recreate APP
   ```

3. If you set a media folder after you installed an app that uses media folders, use **Reinstall**. Recreate does not add the folder. Back up first, as [Reinstall an app and keep its data](/apps/reinstall-app/) says.

   To reinstall a running app, go to **Apps** > **Browse Apps**, select the app and choose **Install**. At "Do you want to install this app?", choose **Yes**. Then read the **Already Installed** box and choose **Yes**. To reinstall a stopped app, go to **Apps** > **Manage Apps**, select the app, choose **Manage**, then **Reinstall**. This route asks no confirmation.

4. If you changed only the app's Traefik rules file, do nothing. See the table below.

## Which one after which change

| You did this | Use | Notes |
| --- | --- | --- |
| Changed a port in `.env` | **Recreate** | See [Port already in use](/apps/port-already-in-use/) if the new port is taken. If the app sits behind Traefik, also change the port in the `url:` line of its rules file. A reinstall keeps the old rules file with the old port. The port question on a reinstall suggests the first free port counting up from the app's default, not your custom port. Type your own. |
| Changed a folder in **System** > **Folders** | **Recreate** | Needed for each app that uses the folder, when the app already had that folder. See [Set your media, downloads and other folders](/using-deployrr/folders/). |
| Set Media Folder 2 or 3 (or any media folder) after installing an app that uses media folders | **Reinstall** | The app's compose file has the media folder lines switched off. Recreate does not switch them on. This only affects apps that use media folders. Those apps can't be installed with no media folder set. |
| Edited the app's compose file, `compose/HOSTNAME/APP.yml` in your Docker folder | **Recreate** | Don't reinstall. A reinstall replaces that file with the default one and your edits are lost. |
| Edited your own file from [custom.yml](/using-deployrr/custom-yml/) | `dcup SERVICE_NAME` or `dcrec SERVICE_NAME` | Replace `SERVICE_NAME` with your service's name. |
| Edited the app's Traefik rules file | Nothing | Traefik watches the rules folder and loads the change by itself. Open the app's address to check. |
| Changed a secret or password stored in `.env` | **Recreate** | Edit it in **Tools** > **.env Editor** (Pro) or in the file. See [Edit .env values and secrets](/using-deployrr/edit-env-and-secrets/). The app reads it when the container is built. |
| Changed a secret file in the `secrets` folder | **Recreate** | Recreate the app to be sure. Edit secrets in **Tools** > **Secrets Editor** (Pro). See [Edit .env values and secrets](/using-deployrr/edit-env-and-secrets/). |
| Changed the version pin or want a newer image | **Update App** | See [Update your apps](/using-deployrr/update-apps/). It pulls the image and recreates the app. |
| Want a different subdomain, login or exposure | Edit the rules file, or use **Manage Auth** | A reinstall keeps the old rules file. See [Change the subdomain of an app you already installed](/reverse-proxy/change-app-subdomain/). |
| Want the GPU or other install answers changed | **Reinstall** | |

## What Reinstall keeps and resets

- It keeps the app's own data in its `appdata` folder. It overwrites the config files Deployrr ships for that app, for example Dashy's `conf.yml` or Mosquitto's `mosquitto.conf` and `passwd`.
- It keeps an existing Traefik rules file, including its old port.
- It keeps values Deployrr generated in `.env`. A password the install asks you for is replaced by what you enter. The default shown is a new random one, so type your old password to keep it.
- Some apps' generated secret files can get new values. Back up `appdata` and `secrets` first. See [Reinstall an app and keep its data](/apps/reinstall-app/) and [Back up and restore your Docker folder](/using-deployrr/backups/).
- It replaces the app's compose file with the default one.
- It asks the install questions again, such as the port, and writes your answers to `.env`.
- It switches on the media folder lines for the media folders you have set at that time.

The subdomain, login and exposure questions appear only when Traefik is running and the app supports it. The subdomain question is skipped if your `.env` already has a value like `NAME_SUBDOMAIN`. The exposure question appears only in Advanced Traefik mode.

## Check it worked

1. Look at the container's status. It should show `Up`:

   ```bash
   sudo docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
   ```

   With the Deployrr bash aliases, `dpss` shows the state and status of every container. It does not show ports, so use the command above for a port change.

2. For a port change, the new port shows in the **Ports** column. Open `http://YOUR_SERVER_IP:NEW_PORT`. Replace `YOUR_SERVER_IP` with your server's local IP address and `NEW_PORT` with your port.
3. For a folder change on an app that uses `/data`, such as Sonarr, list the folder inside the container. Replace `APP` with the app's name:

   ```bash
   sudo docker exec APP ls /data
   ```

   With the Deployrr bash aliases: `dexec APP ls /data`.

4. For a Traefik rules file edit, open the app's `https://` address.
5. If the app shows `Restarting` or `Exited`, see [A container keeps restarting, is unhealthy or has exited](/docker/container-keeps-restarting/).

## Related

- [Stack Manager](/using-deployrr/stack-manager/): every option, including **Recreate** and **Up**.
- [Reinstall an app and keep its data](/apps/reinstall-app/): back up first, then reinstall.
- [Set your media, downloads and other folders](/using-deployrr/folders/): what to do after a folder change.
- [Install and manage apps from the Apps menu](/apps/manage-apps/): Start, Stop, Restart and Reinstall in Manage Apps.
- [Bash aliases](/using-deployrr/bash-aliases/): `dcrec`, `dcrestart`, `dcup` and more.
