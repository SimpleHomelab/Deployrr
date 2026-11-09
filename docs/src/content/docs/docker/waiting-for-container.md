---
title: Deployrr times out waiting for a container to start
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
last_reviewed: 2026-11-08
status: needs-review
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

Some core apps, such as Authelia, OAuth and CrowdSec, stop after about a minute with this message:

```txt
Timed out waiting for APP container to start
```

Here `APP` is the name of the app you were installing.

After the Traefik error, Deployrr tells you to check the documentation at docs.deployrr.app and says you can generate a troubleshooting log from the Settings menu. After the "Timed out waiting for APP" error, it only mentions the troubleshooting log.

Most other apps do not show a timeout. Deployrr waits about a minute and then moves on, even if the app never started. If an app is missing after an install, use the checks in the Fix section below.

Apps that need a helper container, such as a database, can stop with one of these instead. `APP` is the helper's name. Deployrr then shows `Dependency container startup failed`.

```txt
Required dependency APP did not become healthy
Required dependency not running: APP
Failed to start required dependency: APP
Failed to pull image for required dependency: APP
```

Deployrr waits up to five minutes for a helper to become healthy. It stops sooner if Docker reports the helper as unhealthy. A message that starts with "Optional dependency" is only a warning. The install carries on.

You may also see this error when you run Docker commands yourself. It comes from Docker, not Deployrr:

```txt
unknown flag: --profile
```

## Cause

The container did not reach the running state in time. There are a few common reasons:

- The container starts and then crashes. The log shows why.
- A port the app needs is already in use by something else on your server.
- A helper container the app depends on is not running or is not healthy.
- Docker is an old version, installed before you used Deployrr, from snap or from your operating system's own repositories. These versions are often too old. Older Docker Compose (`docker-compose` with a hyphen) cannot run Deployrr's app commands and shows `unknown flag: --profile`.

Deployrr does not replace a Docker it finds, and it does not check the Docker version or where Docker came from. If Docker is already there, **Prerequisites** > **System Checks** reports `Docker already installed` and asks "Would you like to check and update your system? (Y/n)". That updates your operating system packages only. So an old Docker stays in place until you remove it.

## Fix

### 1. Find out why the container did not start

These are general Docker commands.

1. List all containers, including stopped ones:

   ```bash
   sudo docker ps -a
   ```

2. Find your container in the list. Look at the `STATUS` column.
   - `Exited` or `Restarting` means the container crashed. Go to step 3.
   - `Up (unhealthy)` means it runs but its health check fails. Go to step 3.
   - It is missing from the list. The container was never created. Go to step 5.

3. Read its log. Replace `CONTAINER` with the name from the `NAMES` column. This is a value you fill in.

   ```bash
   sudo docker logs --tail 100 CONTAINER
   ```

   The last lines usually say what is wrong. Typical causes are a wrong setting, a missing file or a permission error. If Docker says `failed to create shim task` and you run in a Proxmox LXC container, see [Docker fails with "failed to create shim task"](/host/shim-task-debian/).

   Deployrr also adds short commands for this. `dlogs CONTAINER` follows one container's log. `dclogs` follows the logs of all your apps. See [Bash aliases](/using-deployrr/bash-aliases/). For Traefik, see [Read the Traefik logs](/reverse-proxy/check-traefik-logs/).

4. If the app uses a helper container, such as a database, check that container too. Repeat steps 2 and 3 for it. If the helper is `unhealthy` or not running, fix it first. The app waits for it.

5. Check for a port conflict. The log often says `address already in use` or `port is already allocated`. Replace `PORT` with the port number the app needs. This is a value you fill in.

   ```bash
   sudo ss -tulpn | grep ':PORT'
   ```

   If another program uses the port, stop that program or change the port. For port 53 and Pi-hole, see [Pi-hole will not start because port 53 is already in use](/apps/pi-hole-port-53-conflict/).

6. If the problem is not clear, run **Tools** > **Diagnostics** ("Run System Health Checks") for a general check of your server. Then generate a log to share when you ask for help. In Deployrr, open **Settings** > **Logs**. The menu describes it as "Generate Sanitized Deployrr Log".

If the log shows image pull errors, see [Docker image pulls fail](/docker/rate-limit/).

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

1. Back up your Docker folder. If you have Deployrr Pro, open **Tools** > **Backups** and choose **Backup**. It stops all running containers while it works, and asks at the end whether to restart the Docker stack. Otherwise, copy the folder. Replace `YOUR_DOCKER_FOLDER` with the path of your Docker folder. This is a value you fill in. To see the path, open **Prerequisites** > **Docker Folder** in Deployrr. The recommended path is `/home/USERNAME/docker`.

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
6. Open **Prerequisites** > **System Checks**. The menu describes it as "System and Docker Checks". If Deployrr says "It appears that System Checks were already completed.", press `Y` to redo them.
7. Watch the output. Deployrr shows `Docker not installed. Installing now...` and installs Docker. At the end it shows `Docker is installed and running`.

   If it shows `Docker installed but not running` or `Docker installation failed`, run `sudo systemctl status docker` and read the message.

8. Do the rest of the setup steps again if needed, then install your app.

You don't need **Settings** > **Reset** for this. Each Prerequisites step lets you redo it. Use Reset only as a last resort.

:::caution
**Settings** > **Reset** stops all your containers and removes unused Docker images, networks and volumes. Then it deletes Deployrr's own configuration and cache and exits. You must start Deployrr again. The Reset screen says containers keep running and app data is not deleted. Don't rely on that. Back up first.
:::

:::note
Our advice: don't install Docker yourself before you use Deployrr. Let the Prerequisites step do it.
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

3. When you install the app in Deployrr again, the "Waiting for" step finishes without a timeout.

## Related

- [Bash aliases](/using-deployrr/bash-aliases/): `dlogs`, `dclogs` and `dps` (lists all containers, including stopped ones) for checking containers.
- [Read the Traefik logs](/reverse-proxy/check-traefik-logs/): where to look when Traefik does not start.
- [Pi-hole will not start because port 53 is already in use](/apps/pi-hole-port-53-conflict/): a common port conflict.
- [Docker image pulls fail](/docker/rate-limit/): when the image does not download.
- [Quick start](/getting-started/quick-start/): the Prerequisites steps in order.
