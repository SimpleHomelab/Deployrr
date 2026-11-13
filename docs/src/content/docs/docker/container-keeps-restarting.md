---
title: A container keeps restarting, is unhealthy or has exited
sidebar:
  order: 2
  label: Container keeps restarting
description: Find out why an app that ran before now shows Restarting, unhealthy or Exited. Read its log, match the cause to a fix, then start or recreate it.
type: troubleshooting
tags:
  - docker
  - logs
  - compose
applies_to: v6.0+
symptoms:
  - Restarting (1) 12 seconds ago
  - Up 2 minutes (unhealthy)
  - Exited (1) 3 minutes ago
  - Exited (137)
  - My container keeps restarting
  - The app's web page does not open or keeps going away
related:
  - docker/waiting-for-container
  - using-deployrr/stack-manager
  - using-deployrr/bash-aliases
  - support/diagnostics
  - using-deployrr/reinstall-app
further_reading:
  - title: "UDMS part 13: Scenario 1, troubleshooting a container issue"
    url: https://www.simplehomelab.com/udms-13-docker-and-docker-compose-commands/#Scenario_1_Troubleshooting_a_Container_Issue
videos:
  - id: Ux9khKhqhcg
    start: 236
    title: "Bash aliases video: reading container logs with docker logs"
    note: Manual Docker Compose setup. The docker logs commands work the same on a Deployrr server; folder names differ from Deployrr v6.
  - id: oY1U_Htes9A
    start: 171
    title: "DeUnhealth video: health check and automatic restart of an unhealthy container"
    note: Manual Docker Compose setup. In Deployrr v6, install DeUnhealth from the Apps menu; only qBittorrent VPN has the label already.
last_reviewed: 2026-11-13
status: current
old_paths: []
sources: []
---

An app that was installed and worked now does not stay up. Its container restarts again and again, reports as unhealthy, or has stopped. This page shows how to see the status, read the log, match the cause to a fix and bring the app back.

If the problem happens while Deployrr installs the app, see [Deployrr times out waiting for a container to start](/docker/waiting-for-container/) instead.

## Symptoms

The status of the container shows one of these. `N` is a number, and the time will differ.

```txt
Restarting (N) 12 seconds ago
Up 2 minutes (unhealthy)
Exited (N) 3 minutes ago
```

You may also notice that the app's web page does not open, or that it opens and then goes away for a while.

## Cause

Most Deployrr apps are set up so Docker starts them again if they stop. If such an app crashes right after it starts, Docker starts it again, it crashes again, and you see `Restarting`. This is called a crash loop.

Some apps are set up not to start on their own. These are mostly media apps, such as Plex, Jellyfin, Emby, Sonarr, Radarr, Lidarr, Bazarr, Tautulli, Kavita, Komga, Navidrome and Calibre. They often use files from a NAS, so Deployrr does not start them before the share is mounted. After a crash or a server reboot, they show `Exited` instead of `Restarting`. To start them after a reboot once your Rclone mount is up, see **Delay Media Apps** in [Mount a NAS share with Rclone](/storage/rclone-smb-setup/). For every way to start them after a reboot, see [Apps are stopped or show empty folders after a reboot](/docker/apps-not-starting-after-reboot/).

`Up ... (unhealthy)` means the container runs but its own health check fails. `Exited` means the container stopped.

Common reasons:

- A port the app needs is used by something else.
- A folder is missing, or the app has no permission to use it.
- A NAS share or Rclone mount the app needs is not mounted.
- A helper container, such as a database, is not running or is unhealthy.
- You edited the app's compose file or `.env` values and made a mistake, or you edited them and did not recreate the app.
- The container has no DNS or internet.
- Socket Proxy or Traefik is stopped.

## Fix

### 1. See the status

Use the terminal. This is a general Docker command:

```bash
sudo docker ps -a
```

Find your app in the `NAMES` column and read its `STATUS`. With the [Deployrr bash aliases](/using-deployrr/bash-aliases/): `dps` lists all containers, and `dpss` gives a table with name, state, status and image. To understand how the check, log and restart steps fit together, read [UDMS part 13: Scenario 1, troubleshooting a container issue](https://www.simplehomelab.com/udms-13-docker-and-docker-compose-commands/#Scenario_1_Troubleshooting_a_Container_Issue) (manual setup).

You can also go to **Tools** > **Stack Manager** > **Containers Status** in Deployrr. Its **Status** column shows only one word, such as running, restarting or exited. It does not show `unhealthy` or the exit code: an unhealthy container shows as running. Stack Manager needs completed Prerequisites and a Basic, Plus or Pro license.

### 2. Stop the crash loop while you fix it

A container that restarts every few seconds fills its log and can use a lot of CPU. Stop it first.

1. In Deployrr, go to **Apps** > **Manage Apps** and pick the app. A restarting app usually shows "Status: Running" here. See [Install and manage apps from the Apps menu](/using-deployrr/manage-apps/) for the markers.
2. Choose **Stop**.
3. Look for "APP stopped successfully".

The same menu has **Restart**. One restart sometimes clears a short problem. If the app goes back to `Restarting` or `unhealthy`, stop it and read on.

Core apps such as Traefik are not in Manage Apps. **Tools** > **Stack Manager** > **Stop Container** lists only containers that are running at that moment, so a container in a crash loop is often missing from it. In both cases, use the terminal. This is a general Docker command. Replace `CONTAINER` with the container name. This is a value you fill in.

```bash
sudo docker stop CONTAINER
```

With the aliases: `dcstop APP`. Replace `APP` with the app's name.

If you want the app to stay off after a restart of the whole stack, use **Tools** > **Stack Manager** > **Disable**. The app stays installed with its data. If the container is running, Disable asks if you want to stop it: press `Y`, or it keeps running until the next stack restart. Use **Enable** to turn it back on. To choose between the two, see [Stop or Disable?](/using-deployrr/stack-manager/#stop-or-disable) in Stack Manager.

The log is still there after you stop the container.

### 3. Read the log

The quickest way in Deployrr: go to **Apps** > **Manage Apps**, pick the app and choose **Logs**. It shows the last 50 lines and keeps following. Press Ctrl+C once to stop following the log and go back to the menu. Deployrr keeps running. Pressing Ctrl+C twice closes Deployrr.

In the terminal:

1. Find the container name in the `NAMES` column of `sudo docker ps -a`.
2. Read the last lines of its log. Replace `CONTAINER` with that name. This is a value you fill in.

   ```bash
   sudo docker logs --tail 100 CONTAINER
   ```

   With the aliases: `dlogs CONTAINER`. It shows the last 50 lines and keeps following. Press Ctrl+C to stop. To see `docker logs` used on a container, watch [Bash aliases video: reading container logs at 3:56](https://youtu.be/Ux9khKhqhcg?t=236) (manual Docker Compose setup).

3. Look at the last lines before the container stopped. They usually name the problem, such as a port, a missing file, a permission error or a database that is not reachable.

Two other ways to read logs:

- Dozzle is an official app that shows Docker logs live in your browser.
- Lazydocker is in the **Tools** menu ("Terminal UI for Docker Management"). Use the arrow keys to pick a container and open its logs. Press `q` to quit. These keys are general Lazydocker behaviour.

:::note
Before Lazydocker starts, Deployrr shows a box saying Lazydocker is currently incompatible with Docker v29 and newer, and that you may see errors. If Lazydocker fails, see [Lazydocker shows "client version 1.25 is too old"](/docker/lazydocker/) or use **Manage Apps** > **Logs** or the Docker commands on this page instead. Lazydocker needs completed Prerequisites and a Basic, Plus or Pro license.
:::

### 4. Read the health check

Do this if the status says `unhealthy`. Deployrr's **Containers Status** shows such a container as running, so use the terminal. These are general Docker commands.

To list every container that is unhealthy right now:

```bash
sudo docker ps --filter health=unhealthy
```

To see one container's health record, replace `CONTAINER` with the container name:

```bash
sudo docker inspect --format '{{json .State.Health}}' CONTAINER
```

If this prints `null`, the container has no health check, and its status never says `unhealthy`. Only some apps have one. See [Which apps have a health check](/apps/app-reference/#which-apps-have-a-health-check). Otherwise the output shows the status (`starting`, `healthy` or `unhealthy`), how many checks failed in a row, and the last checks.

To read only what the last checks printed, one line each:

```bash
sudo docker inspect --format '{{range .State.Health.Log}}exit {{.ExitCode}}: {{.Output}}{{println}}{{end}}' CONTAINER
```

Blank lines between them are normal. `exit 0` means the check passed. Any other number means it failed. Read the text after it. It often says what the check could not reach, such as the app's own port inside the container. If the app is still starting or can't open that port, the log from step 3 usually says why.

### 5. Match the log to a cause

| The log or status shows | What to do |
| --- | --- |
| `address already in use` or `port is already allocated` | Another program holds the port. See [Port already in use](/docker/port-already-in-use/). |
| `permission denied`, or a missing folder or file | Check the folder paths the app uses. See [Set your media, downloads and other folders](/storage/folders/). |
| The app needs files from your NAS and they are missing | Check that the share is mounted. See [Mount a NAS share with Rclone](/storage/rclone-smb-setup/) and [Rclone mount fails because the folder is not empty](/storage/rclone-mount-not-empty/). |
| A helper container, such as a database, is unhealthy or not running | Repeat steps 1 to 4 for the helper. Fix it first. The app depends on it. |
| The app talks to Docker and cannot reach it | Socket Proxy may be stopped. See [Socket Proxy](/docker/socket-proxy/). |
| The page does not open and the app itself looks fine | Traefik may be the problem. See [Read the Traefik logs](/reverse-proxy/check-traefik-logs/) and [Traefik can't get a Let's Encrypt certificate](/reverse-proxy/certificate-errors/). |
| You edited a compose file or `.env` and then it broke | Undo your edit. For the main compose file, see [Docker environment setup fails with: docker-compose file is malformed](/docker/compose-malformed/). |
| `no such host`, `temporary failure in name resolution` or other lookup errors | The container has no DNS or internet. See [No internet on the server or in containers after setup](/docker/no-internet-in-containers/). |
| `no space left on device` | The disk is full. See [When the disk is full](/docker/free-disk-space/#when-the-disk-is-full). |
| `toomanyrequests` or `TLS handshake timeout` | The image did not download. See [Docker image pulls fail](/docker/rate-limit/). |
| `failed to create shim task` in a Proxmox LXC container | See [Docker fails with "failed to create shim task"](/host/shim-task-debian/). |
| qBittorrent VPN is unhealthy or its web UI will not open | See [qBittorrent web UI says Unauthorized or won't open](/apps/qbittorrent-webui-troubleshooting/). |

For a general check of your server, run **Tools** > **Diagnostics**. It needs a Basic, Plus or Pro license. See [Deployrr shows "Unhealthy - Issues detected"](/support/diagnostics/).

### 6. Start or recreate the app

After you fix the cause, bring the app back.

1. In Deployrr, go to **Tools** > **Stack Manager** > **Start Container**.
2. At "Select an app to start:", type the number of the app and press Enter.
3. Look for "APP started".

The list shows every container that is not running, including one that is restarting. If you see "No exited containers found.", every container is already running. Use **Recreate** to apply a change. You can also use **Apps** > **Manage Apps** > the app > **Start** and look for "APP started successfully".

If you edited the app's compose file or `.env` values, recreate the app so it picks up the change:

1. Go to **Tools** > **Stack Manager** > **Recreate**.
2. At "Select an app to recreate:", type the number of the app and press Enter.
3. Look for "APP recreated".

With the aliases: `dcstart APP` and `dcrec APP`. Unlike the menu option, `dcrec` does not take the app down first.

### 7. Reinstall as a last resort

If the app still fails, reinstall it. See [Reinstall an app and keep its data](/using-deployrr/reinstall-app/).

:::caution
Do not choose a **Full** delete unless you accept losing the app's data and settings. Back up your Docker folder first. See [Back up and restore your Docker folder](/using-deployrr/backups/).
:::

## Check it worked

1. The status shows `Up` and does not say `Restarting`, `unhealthy` or `Exited`:

   ```bash
   sudo docker ps -a
   ```

   With the aliases: `dps`. **Containers Status** in Stack Manager shows running, but it can't tell you whether the app is healthy.

2. The status still says `Up` after a few minutes. A crash loop can look fine for a few seconds.
3. The app's web page opens.

## Automatic restarts of unhealthy containers

[DeUnhealth](/apps/deunhealth/) is an official app ("Restart unhealthy containers"). It restarts unhealthy containers for you and needs Socket Proxy. In Deployrr v6, only the qBittorrent VPN app is set up for it. For other apps it does nothing unless you add a label to the app's compose file yourself. That is an advanced, manual edit, and a reinstall may overwrite it. To see how the health check and DeUnhealth work together, watch [DeUnhealth video: health check and automatic restart at 2:51](https://youtu.be/oY1U_Htes9A?t=171) (manual Docker Compose setup with labels).

If you still need help, go to **Settings** > **Logs** ("[Generate Sanitized Deployrr Log](/support/generate-support-log/)") and press `Y` to continue. Deployrr shows where it saved the log. Read the file before you share it, then ask on Discord. See [Get help on Discord](/support/discord/).
