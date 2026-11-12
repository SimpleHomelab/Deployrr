---
title: Deployrr times out waiting for a container to start
sidebar:
  order: 3
  label: Timed out waiting for a container
description: Fix Deployrr timing out while it waits for an app or Traefik to start. Check logs, ports and dependencies, then replace an old snap or distro Docker.
type: troubleshooting
tags:
  - docker
  - install
  - logs
  - ports
applies_to: v6.0+
symptoms:
  - Waiting for Traefik to start...
  - Waiting for APP to initialize...
  - Timed out. Could not verify if Traefik is running.
  - Timed out waiting for APP container to start
  - Required dependency APP did not become healthy
  - "Required dependency not running: APP"
  - "Failed to start required dependency: APP"
  - "Failed to pull image for required dependency: APP"
  - "unknown flag: --profile"
  - Apps never start after you installed Docker from snap or apt before Deployrr
related:
  - using-deployrr/bash-aliases
  - reverse-proxy/check-traefik-logs
  - apps/pi-hole-port-53-conflict
  - docker/rate-limit
  - getting-started/quick-start
further_reading:
  - title: "UDMS part 13: Viewing running containers"
    url: https://www.simplehomelab.com/udms-13-docker-and-docker-compose-commands/#Viewing_Running_Containers
  - title: "UDMS part 12: Install Docker and Docker Compose"
    url: https://www.simplehomelab.com/udms-12-install-docker-and-docker-compose/
videos:
  - id: Ux9khKhqhcg
    start: 236
    title: "Bash aliases video: reading container logs with docker logs"
    note: Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens.
  - id: rdqbAr0TFnQ
    start: 699
    title: "Deployrr 5 walkthrough: System Checks installs Docker"
    note: Shows Deployrr v5. Menus and steps differ in v6.
last_reviewed: 2026-11-09
status: current
old_paths: ["/docker/waiting-for-container-to-start"]
sources:
  - { type: discord, ref: "https://discord.com/channels/974306760171073556/1346950985121009776" }
---

Deployrr starts a container and then waits for it to run. If the container never gets there, Deployrr gives up. This page shows how to find out why and how to fix it.

## Symptoms

During an install, Deployrr shows a step such as one of these and does not move on:

```txt
Waiting for Traefik to start...
Waiting for APP to initialize...
```

After a while (about two minutes for Traefik) it stops with an error. For Traefik, the error is:

```txt
Timed out. Could not verify if Traefik is running.
```

Some core apps stop with this message. Authelia, Google OAuth and TinyAuth give up after about a minute. Authentik and CrowdSec give up after about two minutes. Authentik also says "First startup can take several minutes - please be patient...".

```txt
Timed out waiting for APP container to start
```

Here `APP` is the name of the app you were installing.

After the Traefik error, Deployrr tells you to check the documentation at docs.deployrr.app and says you can generate a troubleshooting log from the Settings menu. After the "Timed out waiting for APP" error, it mentions the troubleshooting log. For CrowdSec it also points to the documentation.

Most other apps do not show a timeout. Deployrr shows "Waiting for APP to initialize...", waits about a minute, then says "APP is running" even if the app never started. If an app is missing after an install, use the checks in the Fix section below.

Apps that need a helper container, such as a database, can stop with one of these instead. `APP` is the helper's name. Deployrr then shows `Dependency container startup failed`.

```txt
Required dependency APP did not become healthy
Required dependency not running: APP
Failed to start required dependency: APP
Failed to pull image for required dependency: APP
```

For a helper that reports its health, Deployrr waits up to five minutes for it to become healthy, and stops sooner if Docker reports it as unhealthy. For a helper that does not report health, it waits about 30 seconds. A message that starts with "Optional dependency" is only a warning. The install carries on.

You may also see this error when you run Docker commands yourself. It comes from Docker, not Deployrr:

```txt
unknown flag: --profile
```

## Cause

The container did not reach the running state in time. There are a few common reasons:

- The container starts and then crashes. The log shows why.
- A port the app needs is already in use by something else on your server.
- A helper container the app depends on is not running or is not healthy.
- Docker was installed before you used Deployrr, for example from snap or from your operating system's own repositories, and it is too old. Deployrr's app commands use Docker Compose profiles. An old Docker Compose (such as the old `docker-compose` with a hyphen) does not know them and fails with `unknown flag: --profile`. This is general Docker behaviour, not a Deployrr message.

Deployrr does not replace a Docker it finds, and it does not check the Docker version or where Docker came from. If Docker is already there, **Prerequisites** > **System Checks** reports `Docker already installed` and asks "Would you like to check and update your system? (Y/n):". That runs a normal system package update. It does not replace a snap or distro Docker. So an old Docker stays in place until you remove it. When Docker is missing, System Checks installs it from Docker's official source.

## Fix

### 1. Find out why the container did not start

These are general Docker commands.

1. List all containers, including stopped ones:

   ```bash
   sudo docker ps -a
   ```

   With the [Deployrr bash aliases](/using-deployrr/bash-aliases/): `dps`. To understand what the list shows, read [UDMS part 13: Viewing running containers](https://www.simplehomelab.com/udms-13-docker-and-docker-compose-commands/#Viewing_Running_Containers) (manual setup).

2. Find your container in the list. Look at the `STATUS` column.
   - `Exited` or `Restarting` means the container crashed. Go to step 3.
   - `Up (unhealthy)` means it runs but its health check fails. Go to step 3.
   - It is missing from the list. The container was never created. Go to step 5.

3. Read its log. Replace `CONTAINER` with the name from the `NAMES` column. This is a value you fill in.

   ```bash
   sudo docker logs --tail 100 CONTAINER
   ```

   The last lines usually say what is wrong. Typical causes are a wrong setting, a missing file or a permission error. If Docker says `failed to create shim task` and you run in a Proxmox LXC container, see [Docker fails with "failed to create shim task"](/host/shim-task-debian/). If the app uses an Rclone mount for your NAS and the files are missing, see [Rclone mount fails because the folder is not empty](/storage/rclone-mount-not-empty/).

   With the aliases: `dlogs CONTAINER`. It shows the last 50 lines and follows the log; press Ctrl+C to stop. `dclogs` follows the logs of all your apps. See [Bash aliases](/using-deployrr/bash-aliases/). To see `docker logs` used on a container, watch [Bash aliases video: reading container logs at 3:56](https://youtu.be/Ux9khKhqhcg?t=236) (manual Docker Compose setup). For Traefik, see [Read the Traefik logs](/reverse-proxy/check-traefik-logs/).

4. If the app uses a helper container, such as a database, check that container too. Repeat steps 2 and 3 for it. If the helper is `unhealthy` or not running, fix it first. The app waits for it.

5. Check for a port conflict. The log often says `address already in use` or `port is already allocated`. Replace `PORT` with the port number the app needs. This is a value you fill in.

   ```bash
   sudo ss -tulpn | grep ':PORT'
   ```

   If another program uses the port, stop that program or change the port. For port 53 and Pi-hole, see [Pi-hole will not start because port 53 is already in use](/apps/pi-hole-port-53-conflict/).

6. If the problem is not clear, run **Tools** > **Diagnostics** ("Run System Health Checks") for a general check of your server. It needs a Basic, Plus or Pro license. See [Deployrr shows "Unhealthy - Issues detected"](/support/diagnostics/) for what each line means. Then generate a log to share when you ask for help. In Deployrr, open **Settings** > **Logs**. The menu describes it as "Generate Sanitized Deployrr Log". See [Get help on Discord](/support/discord/) for what else to include.

If the log shows image pull errors, see [Docker image pulls fail](/docker/rate-limit/).

If the app installed fine but later keeps restarting or shows unhealthy, see [A container keeps restarting, is unhealthy or has exited](/docker/container-keeps-restarting/).

### 2. Check which Docker you have

Do this if you saw `unknown flag: --profile`, or if you installed Docker yourself before you used Deployrr. These are general Linux commands.

1. Check the versions:

   ```bash
   sudo docker --version
   sudo docker compose version
   ```

   The second command must work. If it says `docker: 'compose' is not a docker command`, you have no Compose plugin.

2. See whether Docker came from snap:

   ```bash
   snap list docker
   ```

   If it lists Docker, you have the snap version.

3. See which `docker` program runs:

   ```bash
   which docker
   ```

   A path that starts with `/snap/` means snap Docker.

4. If you use snap Docker, an old `docker-compose` command, or Docker from your OS repositories, continue with the next section. If you have a current Docker with the `docker compose` plugin, your problem is one of the causes in the first section.

### 3. Replace the old Docker

:::caution
Removing Docker data deletes all containers, images, volumes and app data on this server. Back up first. Do the steps in this section only if the earlier checks point to an old Docker and you have nothing to lose, or you have a backup.
:::

1. Back up your Docker folder. If you have Deployrr Pro, open **Tools** > **Backups** and choose **Backup** (see [Back up and restore your Docker folder](/using-deployrr/backups/)). It stops all running containers while it works, and asks at the end whether to restart the Docker stack. Otherwise, copy the folder. Replace `YOUR_DOCKER_FOLDER` with the path of your Docker folder. This is a value you fill in. To see the path, open **Prerequisites** > **Docker Folder** in Deployrr. The recommended path is `/home/USERNAME/docker`.

   ```bash
   sudo cp -a YOUR_DOCKER_FOLDER YOUR_DOCKER_FOLDER-backup
   ```

   Copy it to another disk if you can. A copy on the same disk does not protect you from a disk failure.

2. Remove the old Docker. This is general Linux advice. Run the command that matches how you installed Docker.

   For snap:

   ```bash
   sudo snap remove docker
   ```

   For apt:

   ```bash
   sudo apt remove docker docker-engine docker.io containerd runc
   sudo apt autoremove
   ```

3. Delete Docker's data folder. This is the step that deletes your containers, images and volumes.

   ```bash
   sudo rm -rf /var/lib/docker
   ```

4. Delete your Docker folder only if you want to start from nothing. Skip this step if you want to keep your app settings and data. You made the backup in step 1. Use the same path as before.

   ```bash
   sudo rm -rf YOUR_DOCKER_FOLDER
   ```

5. Start Deployrr again.
6. Open **Prerequisites** > **System Checks**. The menu describes it as "System and Docker Checks". If Deployrr says "It appears that System Checks were already completed. If you want to redo it, press Y/y to resume or any other key to go back:", press `Y`.
7. Watch the output. Deployrr shows `Docker not installed. Installing now...` and installs Docker. At the end it shows `Docker is installed and running`. To see System Checks install Docker, watch [Deployrr 5 walkthrough: System Checks at 11:39](https://youtu.be/rdqbAr0TFnQ?t=699) (shows Deployrr v5; menus differ in v6).

   If it shows `Docker installed but not running` or `Docker installation failed`, run `sudo systemctl status docker` and read the message.

8. Do the rest of the setup steps again if needed, then install your app.

You don't need **Settings** > **Reset** for this. Each Prerequisites step lets you redo it. Use Reset only as a last resort.

:::caution
**Settings** > **Reset** takes your stack down, which stops and removes your containers. Then it removes all unused Docker data, which now includes the images and volumes your apps used. Then it deletes Deployrr's own files, including the Deployrr program, and exits. You must run the installer again. Back up first. See [Refresh, Reset or Remove Deployrr](/getting-started/reset-or-remove-deployrr/).
:::

:::note
Our advice: don't install Docker yourself before you use Deployrr. Let the Prerequisites step do it. To understand how Docker is installed from Docker's own repository, read [UDMS part 12: Install Docker and Docker Compose](https://www.simplehomelab.com/udms-12-install-docker-and-docker-compose/) (manual setup).
:::

## Check it worked

1. The Docker commands work:

   ```bash
   sudo docker --version
   sudo docker compose version
   ```

2. Your container shows `Up` in the list:

   ```bash
   sudo docker ps
   ```

   With the aliases: `dps`.

3. When you install the app in Deployrr again, the "Waiting for" step finishes without a timeout.

## Related

- [Bash aliases](/using-deployrr/bash-aliases/): `dlogs`, `dclogs` and `dps` (lists all containers, including stopped ones) for checking containers.
- [Read the Traefik logs](/reverse-proxy/check-traefik-logs/): where to look when Traefik does not start.
- [Pi-hole will not start because port 53 is already in use](/apps/pi-hole-port-53-conflict/): a common port conflict.
- [Docker image pulls fail](/docker/rate-limit/): when the image does not download.
- [Quick start](/getting-started/quick-start/): the Prerequisites steps in order.
