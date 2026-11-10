---
title: Free up disk space used by Docker
description: See what Docker uses on your disk, clean it up from the Docker menu, and pick the right cleanup alias without deleting app data by mistake.
type: how-to
tags:
  - docker
  - host
  - backups
applies_to: v6.0+
related:
  - using-deployrr/backups
  - using-deployrr/bash-aliases
  - reverse-proxy/check-traefik-logs
  - using-deployrr/update-apps
  - using-deployrr/stack-manager
further_reading: []
last_reviewed: 2026-11-10
status: current
old_paths: []
sources: []
---

Docker keeps old images, stopped containers and logs on your server's disk. Over time they fill it. This page shows how to see what uses the space and how to clean it up safely.

## Before you start

- You finished all **Prerequisites** steps. **Docker** > **Disk Usage** and **Cleanup** need only that, on any license. If a step is missing, Deployrr shows a **Requirements Not Met** box that says "Prerequisites - All steps must be completed". See the [Quick start](/getting-started/quick-start/).
- Make a [backup](/using-deployrr/backups/) of your Docker folder before a cleanup that removes volumes or all containers. **Tools** > **Backups** needs a Pro license ("License - Pro required."). A backup stops all your running containers first.
- Some steps use [Stack Manager](/using-deployrr/stack-manager/). It needs a Basic, Plus or Pro license.

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

If you stopped an app, Cleanup removes its container. Its settings stay in your Docker folder. Open **Tools** > **Stack Manager** > **Up** to create the container again. **Start Container** only works for containers that still exist. For a removed one it prints "No exited containers found."

## Pick a cleanup alias

If you installed the bash aliases, you have more cleanup aliases. They are stronger than the menu option. Each alias below shows its long form, which works without the aliases.

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
