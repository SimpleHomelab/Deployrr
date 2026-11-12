---
title: Free up disk space used by Docker
description: Fix a full disk or "no space left on device", see what Docker uses, clean up safely, and set up limits so the disk does not fill again.
type: how-to
tags:
  - docker
  - host
  - backups
applies_to: v6.0+
related:
  - using-deployrr/stack-manager
  - reverse-proxy/check-traefik-logs
  - using-deployrr/backups
  - docker/socket-proxy
  - host/system-checks-failed
further_reading:
  - title: "UDMS part 13: System cleanup commands for Docker"
    url: https://www.simplehomelab.com/udms-13-docker-and-docker-compose-commands/#System_Cleanup
  - title: "UDMS part 14: Docker Garbage Collector"
    url: https://www.simplehomelab.com/udms-14-docker-media-server/#16_Docker_Garbage_Collector
videos:
  - id: Ux9khKhqhcg
    start: 578
    title: "Bash aliases video: Docker cleanup aliases (prune volumes, images and unused data)"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
  - id: KMZIyoZ3jWM
    start: 2132
    title: "Traefik 3 guide: Traefik log settings and access log growth"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
last_reviewed: 2026-11-12
status: current
old_paths: []
sources: []
---

Docker keeps old images, stopped containers and logs on your server's disk. Over time they fill it. This page shows how to see what uses the space and how to clean it up safely. If your disk is already full, go to [When the disk is full](#when-the-disk-is-full). To stop it filling again, see [Keep the disk from filling again](#keep-the-disk-from-filling-again).

## Before you start

- You finished all **Prerequisites** steps. **Docker** > **Disk Usage** and **Cleanup** need only that, on any license. If a step is missing, Deployrr shows a **Requirements Not Met** box that says "Prerequisites - All steps must be completed". See the [Quick start](/getting-started/quick-start/).
- Make a [backup](/using-deployrr/backups/) of your Docker folder before a cleanup that removes volumes or all containers. **Tools** > **Backups** needs a Pro license ("License - Pro required."). A backup stops all your running containers first.
- Some steps use [Stack Manager](/using-deployrr/stack-manager/). It needs a Basic, Plus or Pro license.

## When the disk is full

A full disk shows up in a few ways. These are general Docker and Linux behavior:

- `no space left on device` in an app's log, in an image pull or in an update.
- Apps stop or won't start.
- Databases fail to write.

### 1. Find which disk is full

1. Run this:

   ```bash
   df -h
   ```

2. Look for a line at or near `100%` in the `Use%` column.

Docker keeps its data in `/var/lib/docker` by default. Your app files are in the Docker folder you chose in Prerequisites. These can be on different disks. Free space on the disk that is full.

### 2. Free some space

Go in this order. The safest options come first. Check `df -h` after each one and stop when you have enough room.

1. **Docker cleanup.** Run **Docker** > **Cleanup**. See [Clean up with the Docker menu](#clean-up-with-the-docker-menu).
2. **Container logs.** Find the big ones. With the aliases, run `dlogsize`. The long form is in [Container logs](#container-logs). The output shows the path of each log file. To empty a huge log and keep the file, replace `/path/to/the-container-json.log` with a path from that output:

   ```bash
   sudo truncate -s 0 /path/to/the-container-json.log
   ```

3. **Traefik logs.** Use the same `truncate` command on `access.log` and `traefik.log` in `logs/HOSTNAME/traefik/` in your Docker folder. See [Read Traefik logs](/reverse-proxy/check-traefik-logs/).
4. **Old backups.** Go to **Tools** > **Backups** > **Delete**. This needs a Pro license. Pick the backup location, then one backup file. In the **Delete Backups** box, **No** is selected first; choose **Yes** to delete. Repeat for each file. See [Back up and restore your Docker folder](/using-deployrr/backups/). Don't make a new backup while the disk is full. A backup needs free space and stops all your apps.
5. **System journal.** This is general Linux. Check its size, then shrink it:

   ```bash
   sudo journalctl --disk-usage
   ```

   ```bash
   sudo journalctl --vacuum-size=200M
   ```

6. **Package cache.** On Debian or Ubuntu:

   ```bash
   sudo apt clean
   ```

:::caution
Don't delete files inside `/var/lib/docker` by hand. You can break Docker and lose your images, containers and volumes.

Don't delete app folders under `appdata` to make space. That is your app's data.

Truncating a log removes its old lines. You can't get them back. If you need them, copy the log somewhere else first. Make a [backup](/using-deployrr/backups/) before any step that removes more than logs or caches.
:::

### 3. Bring your apps back

1. Go to **Tools** > **Stack Manager** > **Up**. This needs a Basic, Plus or Pro license. See [Stack Manager](/using-deployrr/stack-manager/).
2. On any license, list your containers to see which ones stopped:

   ```bash
   sudo docker ps -a
   ```

3. Read the log of each app that is not running:

   ```bash
   sudo docker logs APP
   ```

   Replace `APP` with the container name.

Then follow [Check it worked](#check-it-worked).

## See what Docker uses

1. In Deployrr, open **Docker** from the main menu.
2. Select **Disk Usage** ("View Docker Disk Usage").
3. Wait for "Disk usage report complete".

Deployrr prints a detailed report. It lists your images, containers, local volumes and build cache, with the size of each. Look at the **RECLAIMABLE** column in the summary. It shows how much space a cleanup could free.

If you installed the [bash aliases](/using-deployrr/bash-aliases/), `ddf` shows the short summary. The long form is:

```bash
sudo docker system df
```

## Clean up with the Docker menu

This is the safe option. It never removes volumes.

1. Open **Docker** from the main menu.
2. Select **Cleanup** ("Prune Unused Docker Data").
3. Read the **Docker Cleanup** box. It says it will remove:
   - All stopped containers.
   - All networks not used by at least one container.
   - All dangling images.
   - All dangling build cache.
4. Select **Yes** to continue. **Yes** is selected by default. Select **No** to stop without changes.
5. Wait. Deployrr says "This may take a few minutes...".
6. Look for "Docker system prune complete".
7. Read the updated disk usage that Deployrr prints, then wait for "Cleanup complete".

The box says "This is safe for running containers and will free up disk space." Running containers are not touched. Your app files in the Docker folder are not touched either. This menu option never removes volumes.

A dangling image is an image with no name that nothing uses. After you [update your apps](/using-deployrr/update-apps/), the old version of each image often becomes dangling. This cleanup removes those. This is general Docker behavior, as is the **RECLAIMABLE** column in the usage report.

If you stopped an app, Cleanup removes its container. Its settings stay in your Docker folder. Open **Tools** > **Stack Manager** > **Up** to create the container again. **Start Container** only lists containers that still exist, so a removed one is not in its list. If no stopped container is left at all, it prints "No exited containers found."

## Pick a cleanup alias

If you installed the bash aliases, you have more cleanup aliases. They are stronger than the menu option. Each alias below shows its long form, which works without the aliases.

To see how the cleanup aliases work in a manual setup, watch [Bash aliases video: Docker cleanup aliases at 9:38](https://youtu.be/Ux9khKhqhcg?t=578) (manual Docker Compose setup; alias names and behavior can differ from Deployrr). For the matching commands, read [UDMS part 13: System cleanup commands for Docker](https://www.simplehomelab.com/udms-13-docker-and-docker-compose-commands/#System_Cleanup) (manual setup, for background only).

:::caution
Removing a volume deletes its data and you can't undo it. Back up first.

Deployrr app files live in your Docker folder, not in Docker volumes, and none of the Deployrr app compose files declare a named volume. So `dprunevol` should not touch Deployrr app data. But Docker can create volumes you didn't ask for, for example when an image defines one. Containers you added yourself may use volumes too. A volume that no container uses counts as unused, even if its app is only stopped. This is general Docker behavior.

A Deployrr backup is a copy of the Docker folder only. It does not include Docker-managed volumes.
:::

| Alias | Long form | What it removes |
| --- | --- | --- |
| `ddf` | `sudo docker system df` | Nothing. It shows disk use. |
| `dstopall` | `sudo docker stop $(sudo docker ps -aq)` | Nothing. It stops every container. `derase` runs it first. |
| `dlogsize` | See below | Nothing. It shows container log sizes. |
| `dprunesys` | `sudo docker system prune -a` | Stopped containers, unused networks and all images that no container uses. It does not remove volumes. It asks you to confirm. |
| `dprunevol` | `sudo docker volume prune` | Volumes that no container uses. It asks you to confirm. |
| `ddelimages` | `sudo docker rmi $(sudo docker images -q)` | Tries to delete every image. Images that a container uses stay, and Docker prints an error for each. |
| `drm` | `sudo docker rm $(sudo docker ps -a -q)` | Tries to remove every container. Running ones are refused. |
| `dprune` | `ddelimages ; dprunevol ; dprunesys` | All the effects of those three aliases, one after the other. It removes unused volumes. |
| `derase` | `dstopall ; drm ; ddelimages ; dprunevol ; dprunesys` | Stops and removes every container, then every image, then the volumes. |

Which one to use:

- **Routine cleanup:** use the **Cleanup** menu option, or `dprunesys` if you also want unused images that are not dangling gone. Neither removes volumes.
- **Unused volumes:** run `dprunevol` only after you check what it will remove and have a backup. Newer Docker versions remove only unnamed volumes by default. Older versions remove all unused volumes. Check the list Docker shows before you answer.
- **`dprune`:** the alias file calls it a safe cleanup. It is not safe for volumes, because it runs `dprunevol`.
- **`derase`:** a full reset. Every app stops and its container is removed. Docker pulls every image again when you bring your apps back, for example with **Tools** > **Stack Manager** > **Up**. That counts against your Docker Hub pull limit. See [Docker image pulls fail](/docker/rate-limit/). Use it only when you want to start from nothing.

:::caution
Do not run `derase` or `dprune` on a server where you have not made a backup. Both can delete volumes.
:::

The messages `ddelimages` and `drm` print for images and containers in use, and the confirmation prompts, are general Docker behavior. In Stack Manager, **Down** also removes containers.

## Other big disk users

Docker images and containers are not the only space users.

### Container logs

If you installed the aliases, `dlogsize` lists the size of each container's log file, sorted by size. The long form is:

```bash
sudo du -ch $(sudo docker inspect --format='{{.LogPath}}' $(sudo docker ps -qa)) | sort -h
```

### Traefik logs

Traefik writes `traefik.log` and `access.log` to `logs/HOSTNAME/traefik/` in your Docker folder. Deployrr does not rotate them, so they grow over time. See [Read Traefik logs](/reverse-proxy/check-traefik-logs/). To see their size, run this from your Docker folder. This is a general check:

```bash
ls -lh logs/$HOSTNAME/traefik/
```

### Backups

Each backup is a full copy of your Docker folder. Old ones add up. Open **Tools** > **Backups** to see **Number of Backups** and **Size of Backups**. Use **Delete** to remove old ones. See [Back up and restore your Docker folder](/using-deployrr/backups/).

### Your whole disk

These are general Linux checks. The first shows free space on each disk. The second shows the size of your Docker folder. Replace `YOUR_DOCKER_FOLDER` with the path to your Docker folder.

```bash
df -h
```

```bash
sudo du -sh YOUR_DOCKER_FOLDER
```

If you installed the bash aliases, these help you find big items. Run them from the folder you want to look at:

| Alias | Long form | What it shows |
| --- | --- | --- |
| `dirsize` | `sudo du -hx --max-depth=1` | The size of each folder one level down. |
| `space` | `du -sh * \| sort -hr` | Items in the current folder, largest first. |
| `biggest` | `find . -type f -printf "%s %p\n" \| sort -nr \| head -10` | The 10 largest files under the current folder. |

If cleaning up is not enough, move your media or Docker's storage to a bigger disk. See [Move your media or Docker data to another disk](/host/move-data-to-another-disk/).

## Keep the disk from filling again

### Install Docker Garbage Collection

Docker Garbage Collection ("Docker GC") cleans up unused Docker images, containers and volumes on a schedule. In **Apps** > **Browse Apps** it is listed as "Docker Garbage Collection - Docker garbage collection".

Before you start:

- You finished Prerequisites.
- You have a Basic, Plus or Pro license. See [Licenses](/getting-started/licenses/). Installing apps needs one.
- [Socket Proxy](/docker/socket-proxy/) is installed and running. You install it from **Docker** > **Socket Proxy**.

To install it:

1. Go to **Apps** > **Browse Apps**.
2. Select **Docker Garbage Collection** and press **Install**.
3. In the **Install Docker Garbage Collection** box ("Do you want to install this app?"), choose **Yes**.

Docker GC asks no other questions. Deployrr prints four steps and ends with "Docker Garbage Collection installation complete!".

If the terminal shows `Required app not running` with `[REQUIRED] socket-proxy must be installed and running first`, install or start Socket Proxy, then install again. It works the same way as for [DeUnhealth](/apps/deunhealth/). See [Requirements Not Met](/using-deployrr/requirements-not-met/) for other boxes.

Docker GC has no web page and no Traefik entry. If you set up the [Deployrr Dashboard](/using-deployrr/dashboard/), it shows in the **Apps (Others)** section, with no link.

#### What it does by default

These are the settings in its compose file, `compose/HOSTNAME/docker-gc.yml` in your Docker folder:

| Setting | Value | Meaning |
| --- | --- | --- |
| `CRON` | `0 0 0 * * ?` | Runs every day at midnight. |
| Grace period | `604800` seconds | Keeps things for 7 days before removal. |
| `FORCE_IMAGE_REMOVAL` | `1` | Forces the removal of unused images. |
| `FORCE_CONTAINER_REMOVAL` | `0` | Does not force the removal of containers. |
| `CLEAN_UP_VOLUMES` | `1` | Removes unused volumes. |
| `DRY_RUN` | `0` | Does the removal for real. |

In plain terms, the Docker GC image removes containers that exited more than 7 days ago, images that no container uses, and unused volumes. This is how the image behaves, not something Deployrr adds. To understand how a garbage collector works in a manual setup, read [UDMS part 14: Docker Garbage Collector](https://www.simplehomelab.com/udms-14-docker-media-server/#16_Docker_Garbage_Collector) (manual setup, for background only; Deployrr v6 runs it through Socket Proxy with the settings above).

To keep an image, list it in `appdata/docker-gc/docker-gc-exclude` in your Docker folder. The file ships with only the Docker GC image in it.

:::caution
Docker GC removes unused volumes. Removing a volume deletes its data for good. Read the warning in [Pick a cleanup alias](#pick-a-cleanup-alias) and make a [backup](/using-deployrr/backups/) first.

If an app has been stopped for more than 7 days, Docker GC can remove its container. Its settings stay in your Docker folder. Use **Tools** > **Stack Manager** > **Up** to create the container again.

Deployrr writes the exclude file and `docker-gc.yml` again on every install or reinstall. Your changes to either are lost then. Keep your own copy of what you change.
:::

#### Test it before you trust it

1. Open `compose/HOSTNAME/docker-gc.yml` in your Docker folder.
2. Set `DRY_RUN` to `1`. Save the file.
3. Go to **Tools** > **Stack Manager** > **Recreate**. In the numbered list, pick `docker-gc`.
4. After its next run, read its log:

   ```bash
   sudo docker logs docker-gc
   ```

5. Set `DRY_RUN` back to `0` and recreate it again when you are happy with the list.

### Limit container log size

Deployrr's app compose files don't set a log size limit, except for the Valkey container that SearXNG installs. Docker's default `json-file` log driver has no limit either, so a chatty app can fill your disk. This is general Docker behavior.

You can set a limit for all containers in `/etc/docker/daemon.json`.

:::caution
Restarting Docker restarts every container. A mistake in the JSON stops Docker from starting. Back up the file first. Deployrr doesn't create it, so skip the copy if the file does not exist.

```bash
sudo cp /etc/docker/daemon.json /etc/docker/daemon.json.bak
```

If the file already exists, add these keys to what is there. Keep the whole file valid JSON. If Docker won't start, copy the backup back and see [System checks failed](/host/system-checks-failed/).
:::

1. Open the file:

   ```bash
   sudo nano /etc/docker/daemon.json
   ```

2. Add these keys. This keeps up to 3 files of 10 MB per container:

   ```json
   {
     "log-driver": "json-file",
     "log-opts": {
       "max-size": "10m",
       "max-file": "3"
     }
   }
   ```

3. Save the file.
4. Restart Docker:

   ```bash
   sudo systemctl restart docker
   ```

5. Check that Docker runs:

   ```bash
   sudo systemctl status docker
   ```

The limit applies only to containers created after the change. Recreate your apps with **Tools** > **Stack Manager** > **Recreate** (pick one app, or `all`). **Up** doesn't recreate a container whose compose file didn't change. Then check one container. Replace `CONTAINER` with its name:

```bash
sudo docker inspect --format '{{.HostConfig.LogConfig}}' CONTAINER
```

The output shows `max-size` and `max-file`.

### Traefik logs

Deployrr doesn't rotate the Traefik logs. Check their size now and then. See [Read Traefik logs](/reverse-proxy/check-traefik-logs/).

To hear why access logs grow fast, watch [Traefik 3 guide: Traefik log settings and access log growth at 35:32](https://youtu.be/KMZIyoZ3jWM?t=2132) (manual Docker Compose setup; Deployrr does these steps for you).

## Check it worked

1. Open **Docker** > **Disk Usage** again, or run `ddf`.
2. Compare the **RECLAIMABLE** numbers with the first report. They should be smaller.
3. Run `df -h` and check that free space went up.
4. List your containers. Your running apps should still show as running. On any license, run this. If you installed the bash aliases, `dps` does the same:

   ```bash
   sudo docker ps -a
   ```

   With a Basic, Plus or Pro license you can use **Tools** > **Stack Manager** > **Containers Status** instead.

## Related

- [Back up and restore your Docker folder](/using-deployrr/backups/): make a backup before you remove volumes, and delete old backups.
- [Bash aliases](/using-deployrr/bash-aliases/): the full alias list.
- [Read Traefik logs](/reverse-proxy/check-traefik-logs/): where the Traefik logs are.
- [Update your apps](/using-deployrr/update-apps/): updates leave old images behind.
- [Stack Manager](/using-deployrr/stack-manager/): use **Up** to create the containers of stopped apps again after a cleanup.
- [Socket Proxy](/docker/socket-proxy/): Docker GC needs it running.
- [System checks failed](/host/system-checks-failed/): what to do if Docker won't start after a `daemon.json` change.
