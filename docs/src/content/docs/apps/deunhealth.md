---
title: Restart unhealthy containers automatically with DeUnhealth
sidebar:
  label: DeUnhealth
description: Install DeUnhealth after Socket Proxy, check it runs, and add its label to an app so Docker restarts that app when it turns unhealthy.
type: how-to
tags:
  - docker
  - compose
applies_to: v6.0+
apps: [deunhealth, socket-proxy]
related:
  - apps/qbittorrent-vpn
  - docker/socket-proxy
  - docker/container-keeps-restarting
  - using-deployrr/restart-recreate-reinstall
  - using-deployrr/manage-apps
further_reading: []
videos:
  - id: oY1U_Htes9A
    start: 171
    title: "DeUnhealth video: health check and automatic restart of an unhealthy container"
    note: Manual Docker Compose setup. In Deployrr v6, install DeUnhealth from the Apps menu; only qBittorrent VPN has the label already.
last_reviewed: 2026-11-12
status: current
old_paths: []
sources: []
---

DeUnhealth watches your containers and restarts the ones that Docker marks as unhealthy. This page shows how to install it, check that it runs and, if you want, turn it on for another app.

## What DeUnhealth does

DeUnhealth has no web page and no login. It runs in the background.

It restarts a container only when both of these are true:

- The container has a Docker health check. Docker then reports it as `healthy` or `unhealthy`.
- The container has the label `deunhealth.restart.on.unhealthy=true`.

A container without the label is left alone, even when it is unhealthy.

In Deployrr v6, only [qBittorrent VPN](/apps/qbittorrent-vpn/) has the label. It runs behind a VPN client. When the VPN reconnects, qBittorrent can lose its connection and turn unhealthy. DeUnhealth then restarts it. qBittorrent VPN won't install unless DeUnhealth is running.

To see the idea in a manual setup, watch [DeUnhealth video: health check and automatic restart at 2:51](https://youtu.be/oY1U_Htes9A?t=171) (manual Docker Compose setup with labels).

## Before you start

- You finished Prerequisites. See the [Quick start](/getting-started/quick-start/).
- You have a Basic, Plus or Pro license. See [Licenses](/getting-started/licenses/). Socket Proxy needs one, and so does installing apps.
- Socket Proxy is installed and running. See [Socket Proxy](/docker/socket-proxy/). In the **Docker** menu, its line ends with `RUNNING`.

## Install DeUnhealth

1. Go to **Apps** > **Browse Apps**.
2. Select **DeUnhealth** ("Restart unhealthy containers").
3. Choose **Install**.
4. At "Do you want to install this app?", choose **Yes**.

DeUnhealth asks no other questions.

If you see `Required app not running` with `[REQUIRED] socket-proxy must be installed and running first`, install or start Socket Proxy first, then run the install again. See [Requirements Not Met](/getting-started/requirements-not-met/) for other boxes.

## Check it worked

1. Go to **Apps** > **Manage Apps**. The DeUnhealth line shows **[Running]**. It has no exposure or login, because it isn't behind Traefik.
2. In a terminal, list the containers:

   ```bash
   sudo docker ps
   ```

   With the [Deployrr bash aliases](/using-deployrr/bash-aliases/): `dps` (it lists all containers, including stopped ones). The `deunhealth` container shows `Up`.

3. Read its log:

   ```bash
   sudo docker logs deunhealth
   ```

   With the aliases: `dlogs deunhealth`. It keeps following the log. Press Ctrl+C to stop. You can also go to **Apps** > **Manage Apps**, select **DeUnhealth**, press **Manage**, then choose **Logs**. See [Install and manage apps from the Apps menu](/using-deployrr/manage-apps/).

## Add DeUnhealth to another app

Do this only if the app has a health check. DeUnhealth can't tell that a container is unhealthy without one. The [App reference](/apps/app-reference/#which-apps-have-a-health-check) lists which apps have one by default.

:::caution
This is an advanced edit. A reinstall of the app replaces its compose file with the default one, and your label is lost. Stack Manager **Delete** removes the file too. Add the label again after either one.
:::

### 1. Check that the app has a health check

Replace `NAME` with the app's container name. This is a value you fill in.

```bash
sudo docker inspect --format '{{json .State.Health}}' NAME
```

If the output is `null`, the app has no health check. Stop here. The label would do nothing.

Otherwise the output lists the status and the last checks. You can also read the status in `docker ps`. The `STATUS` column shows `(healthy)`, `(unhealthy)` or `(health: starting)` after the uptime.

### 2. Back up the compose file

1. Go to your Docker folder:

   ```bash
   cdd
   ```

2. Copy the app's compose file. Replace `APP` with the app's name. Bash fills in `$HOSTNAME` for you.

   ```bash
   cp compose/$HOSTNAME/APP.yml compose/$HOSTNAME/APP.yml.bak
   ```

### 3. Add the label

1. Open the file. Replace `APP` with the app's name.

   ```bash
   nano compose/$HOSTNAME/APP.yml
   ```

2. Find the service of the app. Add this label under it. If the service already has a `labels:` list, add only the line that starts with the dash. Keep the same indentation as the lines around it.

   ```yaml
       labels:
         - "deunhealth.restart.on.unhealthy=true"
   ```

3. Save the file.

If the app is one of your own containers in [custom.yml](/using-deployrr/custom-yml/), add the same label to its service there.

### 4. Recreate the app

Restart does not read the compose file again. Use **Recreate**. See [Restart, Recreate or Reinstall](/using-deployrr/restart-recreate-reinstall/).

1. Go to **Tools** > **Stack Manager** > **Recreate**.
2. Type the number of the app and press Enter.
3. Look for "APP recreated".

With the aliases: `dcrec APP`. Replace `APP` with the app's name.

### 5. Check the label

Replace `NAME` with the app's container name:

```bash
sudo docker inspect --format '{{json .Config.Labels}}' NAME
```

The output includes `"deunhealth.restart.on.unhealthy":"true"`.

If Docker or Compose reports an error after your edit, copy the backup back over the file, then recreate the app. See [Docker environment setup fails with: docker-compose file is malformed](/docker/compose-malformed/) for the main file.

## If it doesn't work

- **DeUnhealth can't see your containers.** Socket Proxy may be stopped. Check that its line in the **Docker** menu ends with `RUNNING`. If it says `STOPPED`, see [When Socket Proxy is not running](/docker/socket-proxy/#when-socket-proxy-is-not-running). After it runs again, recreate DeUnhealth in **Tools** > **Stack Manager** > **Recreate**.
- **An unhealthy app is not restarted.** Check that it has a health check and the label. See the steps above.
- **An app restarts again and again.** DeUnhealth only restarts it. It does not fix the reason it is unhealthy. Read the app's log and fix the cause. See [A container keeps restarting, is unhealthy or has exited](/docker/container-keeps-restarting/).

## Related

- [Install qBittorrent VPN (qBittorrent behind Gluetun)](/apps/qbittorrent-vpn/): the app that needs DeUnhealth.
- [Socket Proxy](/docker/socket-proxy/): DeUnhealth needs it running.
- [A container keeps restarting, is unhealthy or has exited](/docker/container-keeps-restarting/): find the cause of an unhealthy app.
- [Restart, Recreate or Reinstall](/using-deployrr/restart-recreate-reinstall/): why a label edit needs Recreate.
- [Install and manage apps from the Apps menu](/using-deployrr/manage-apps/): status, logs and restart.
