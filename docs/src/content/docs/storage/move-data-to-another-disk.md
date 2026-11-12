---
title: Move your media or Docker data to another disk
sidebar:
  order: 5
  label: Move data to another disk
description: Move your media and downloads, or Docker's own storage, to a bigger disk without breaking your apps, and check that everything still works.
type: how-to
tags:
  - host
  - docker
  - media
applies_to: v6.0+
related:
  - storage/folders
  - docker/free-disk-space
  - storage/smb-nfs-mounts
  - using-deployrr/stack-manager
  - using-deployrr/backups
further_reading:
  - title: "UDMS part 07: Make a mount permanent with fstab"
    url: "https://www.simplehomelab.com/udms-07-mount-remote-shares-smb/#Step_6_Make_Mount_Permanent_with_fstab"
videos:
  - id: rdqbAr0TFnQ
    start: 1296
    title: "Deployrr 5 walkthrough: Setup Folders"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
last_reviewed: 2026-11-12
status: current
old_paths: ["/host/move-data-to-another-disk"]
sources: []
---

Your disk is full, or you added a bigger one. This page shows how to move your media and downloads, or Docker's own storage, to the new disk. Your apps keep working because the paths inside the apps do not change.

## What lives where

Three places can fill a disk. Each one moves in a different way.

| Data | Where it is | How to move it |
| --- | --- | --- |
| Media and downloads (also books, photos, Immich and Nextcloud files) | The folders you set in **System** > **Folders** | [Move your media and downloads](#move-your-media-and-downloads). |
| Docker's images, containers and volumes | `/var/lib/docker` by default | [Move Docker's storage](#move-dockers-storage). This is a standard Docker setting, not a Deployrr menu. |
| The Deployrr Docker folder (`appdata`, `.env`, compose files, secrets) | The path you chose in **Prerequisites** | Do not move it. See the note below. |

:::caution
Do not move the Docker folder to another path. Deployrr has no menu for it. If you change the **Docker Folder** path in **Prerequisites**, Deployrr warns you that you have to move your existing folder to the new location yourself. Your apps and settings do not follow.

To get your setup onto a new disk or machine, make a [backup](/using-deployrr/backups/) or use a [Migration Package](/using-deployrr/move-to-new-server/) instead. To free space in the Docker folder, see [Free up disk space used by Docker](/docker/free-disk-space/).
:::

Check which disk is full first:

```bash
df -h
```

Look for a line at or near `100%` in the `Use%` column. Then see how big each part is. Replace `YOUR_FOLDER` with the folder you want to measure:

```bash
sudo du -sh YOUR_FOLDER
```

## Before you start

- You have a new disk that is already formatted and visible to Linux. This page does not format disks.
- You made a [backup](/using-deployrr/backups/) of your Docker folder. **Tools** > **Backups** needs a Pro license and stops all your apps while it runs. At the end it asks whether to restart the Docker stack. If you answer no, start your apps later with **Tools** > **Stack Manager** > **Up**. A backup holds only the Docker folder. It does not hold your media or Docker's images.
- The new disk has more free space than the data you move.
- For **Stack Manager**, you have a Basic, Plus or Pro license and all **Prerequisites** steps are done. To set a folder in **System** > **Folders** you need the same. See [Licenses](/getting-started/licenses/).
- If your media is on a NAS, you do not need a local disk. Mount the share with [SMB or NFS Mount](/storage/smb-nfs-mounts/) or [Rclone](/storage/rclone-smb-setup/), then go to [Move your media and downloads](#move-your-media-and-downloads).

## Mount the new disk for good

A disk you mount by hand is gone after a reboot. Add it to `/etc/fstab`, the file Linux reads at boot. This example uses a disk with an `ext4` filesystem. Replace the values in capitals where the steps say so.

:::caution
A broken line in `/etc/fstab` can stop your server from booting normally. Copy the file first. Test your change with `sudo mount -a` before you reboot. Do not reboot until the test shows no errors. If your server already won't boot, see [Server won't boot after an /etc/fstab change](/storage/fstab-boot-recovery/).
:::

1. Find your disk and its UUID:

   ```bash
   lsblk -f
   ```

   Look for the new disk and its partition, such as `sdb1`. Copy the long `UUID` value next to it.

2. Make the mount folder. This example uses `/mnt/data`. Use any path you like:

   ```bash
   sudo mkdir -p /mnt/data
   ```

3. Copy the file as a backup:

   ```bash
   sudo cp /etc/fstab /etc/fstab.before-newdisk
   ```

4. Open the file:

   ```bash
   sudo nano /etc/fstab
   ```

5. Add this line at the end. Replace `YOUR_UUID` with the UUID from step 1. Change `ext4` if your disk uses another filesystem:

   ```txt
   UUID=YOUR_UUID  /mnt/data  ext4  defaults,nofail  0  2
   ```

6. Save the file.
7. Test it:

   ```bash
   sudo mount -a
   ```

   No output means the file is fine. If you see an error, fix the line it names. Or put your copy back:

   ```bash
   sudo cp /etc/fstab.before-newdisk /etc/fstab
   ```

8. Check that the disk is mounted:

   ```bash
   findmnt /mnt/data
   ```

9. Make your Linux user the owner of the mount folder. Replace `YOUR_USER` with your Linux username. Skip this step if you only move Docker's storage:

   ```bash
   sudo chown YOUR_USER:YOUR_USER /mnt/data
   ```

The `nofail` option lets the server boot even if the disk is missing. If you later see an empty folder where your data should be, check that the disk is mounted. See [Media app shows an empty library](/apps/media-library-empty/).

To understand how a permanent mount entry works, read [UDMS part 07: Make a mount permanent with fstab](https://www.simplehomelab.com/udms-07-mount-remote-shares-smb/#Step_6_Make_Mount_Permanent_with_fstab) (manual setup). It covers a network share, not a local disk, so use the steps on this page for your disk.

## Move your media and downloads

Moving changes where the files live on your server. It does not change the paths inside your apps. Media Folder 1 is still `/data/media1` and the Downloads Folder is still `/data/downloads` for your apps. You do not need to change any library or root folder inside Plex, Jellyfin, Sonarr or Radarr.

:::note
Sonarr, Radarr and Lidarr can save space by linking a finished download to your media file instead of copying it. This only works when both folders are on the same disk. If your media and downloads are on one disk now, move both to one new disk. Copy them in a single `rsync` run from their shared parent folder. Two separate runs turn every link into a second full copy.
:::

1. Go to **Tools** > **Stack Manager** > **Stop Container**.
2. At "Select an app to stop:", type the number next to `all` and press Enter. Look for "All containers stopped".
3. Copy your files. Replace `OLD_FOLDER` with your current folder and `NEW_FOLDER` with the folder on the new disk. Keep the `/` at the end of both paths:

   ```bash
   sudo rsync -aHAX --info=progress2 OLD_FOLDER/ NEW_FOLDER/
   ```

   A big library takes a long time. If the copy stops, run the same command again. It carries on where it left off. If `rsync` is not found, install it with your package manager, such as `sudo apt install rsync` on Debian or Ubuntu.

4. Check the copy. This dry run lists differences and changes nothing. It prints nothing when both folders match:

   ```bash
   sudo rsync -aHAXn --itemize-changes OLD_FOLDER/ NEW_FOLDER/
   ```

5. Compare the sizes:

   ```bash
   sudo du -sh OLD_FOLDER NEW_FOLDER
   ```

6. In Deployrr, go to **System** > **Folders**.
7. Select the folder you moved, such as **Media Folder 1** or **Downloads Folder**.
8. Pick the new folder in the directory browser, choose **Select**, then **Confirm**. See [Set a folder](/storage/folders/#set-a-folder) for each prompt. To see the folder prompts, watch [Deployrr 5 walkthrough: Setup Folders at 21:36](https://youtu.be/rdqbAr0TFnQ?t=1296) (shows Deployrr v5; menus and steps differ in v6).
9. Repeat steps 7 and 8 for every folder you moved.
10. Go to **Tools** > **Stack Manager** > **Recreate**.
11. At "Select an app to recreate:", type the number of one app that uses the folder, or the number next to `all`. Wait for "APP recreated" or "All containers recreated".

:::note
Recreate is enough when an app already had that folder. If you move to a folder that an app never had, such as Media Folder 2 or 3, you must reinstall the app instead. See [Apps you installed before you set a media folder](/storage/folders/#apps-you-installed-before-you-set-a-media-folder) and [Reinstall an app and keep its data](/using-deployrr/reinstall-app/).
:::

Check that it worked (see [Check it worked](#check-it-worked)). Keep the old copy until you are sure.

Do not delete the old copy until your apps have run for a few days with the new folder. To make sure nothing still uses it, rename it first. Replace `OLD_FOLDER` with your old folder:

```bash
sudo mv OLD_FOLDER OLD_FOLDER.old
```

If everything works after a few days, delete it. Check the path twice. This cannot be undone:

```bash
sudo rm -rf OLD_FOLDER.old
```

## Move Docker's storage

Docker keeps images, containers and volumes in `/var/lib/docker`. If that disk is full, you can point Docker at a folder on the new disk. This is a standard Docker setting called `data-root`. Deployrr has no menu for it.

Check how Docker stores images before you start:

```bash
sudo docker info --format '{{.Driver}}'
```

If it prints `overlay2`, your images and containers are in `/var/lib/docker` and the steps below move them. If it prints `overlayfs`, Docker uses the containerd image store. Then most of the image data is in `/var/lib/containerd`, which `data-root` does not move. Check its size with `sudo du -sh /var/lib/containerd` before you go on, because the steps below may free much less space than you expect.

:::caution
Stopping Docker stops every container, so all your apps go down while you copy. A mistake in `/etc/docker/daemon.json` stops Docker from starting. Back up the file and the Docker folder first. Do not delete `/var/lib/docker` until you have checked that your apps run from the new path.
:::

1. Make the folder on the new disk. This example uses `/mnt/data/docker`:

   ```bash
   sudo mkdir -p /mnt/data/docker
   ```

2. Stop Docker:

   ```bash
   sudo systemctl stop docker docker.socket
   ```

3. If `/etc/docker/daemon.json` exists, copy it. Skip this if the file does not exist:

   ```bash
   sudo cp /etc/docker/daemon.json /etc/docker/daemon.json.bak
   ```

4. Open the file:

   ```bash
   sudo nano /etc/docker/daemon.json
   ```

5. Add the `data-root` key. If the file is new, it holds only this:

   ```json
   {
     "data-root": "/mnt/data/docker"
   }
   ```

   If the file already has keys, add `data-root` to them. Keep a comma between keys and keep the file valid JSON. For example, with the log limit from [Free up disk space used by Docker](/docker/free-disk-space/#limit-container-log-size):

   ```json
   {
     "data-root": "/mnt/data/docker",
     "log-driver": "json-file",
     "log-opts": {
       "max-size": "10m",
       "max-file": "3"
     }
   }
   ```

6. Save the file.
7. Copy Docker's data to the new folder. This can take a long time:

   ```bash
   sudo rsync -aHAX --info=progress2 /var/lib/docker/ /mnt/data/docker/
   ```

8. Start Docker:

   ```bash
   sudo systemctl start docker
   ```

9. Check the path Docker uses now:

   ```bash
   sudo docker info --format '{{.DockerRootDir}}'
   ```

   It prints `/mnt/data/docker`. If it still prints `/var/lib/docker`, check `daemon.json` for typos.

10. Go to **Tools** > **Stack Manager** > **Up**. Look for "Docker stack is up". Many apps don't start on their own when Docker starts, so this step brings them back.

If you installed cAdvisor or Node Exporter, their files still name `/var/lib/docker`, so they may show old or empty Docker data after the move.

If Docker does not start, put your copy of `daemon.json` back, or remove the `data-root` line, then start Docker again. Your old data is still in `/var/lib/docker`:

```bash
sudo cp /etc/docker/daemon.json.bak /etc/docker/daemon.json
sudo systemctl start docker
```

If you had no `daemon.json` before, delete the new file instead with `sudo rm /etc/docker/daemon.json`.

:::note
Docker reads the new path at start. If the new disk is not mounted at boot, Docker starts with empty storage and your apps look gone. Mount the disk first, then restart Docker with `sudo systemctl restart docker`.
:::

When your apps have run well for a few days, free the old space. Rename the old folder first to prove nothing uses it:

```bash
sudo mv /var/lib/docker /var/lib/docker.old
```

Check your apps again. Then delete it. This cannot be undone:

```bash
sudo rm -rf /var/lib/docker.old
```

## Check it worked

1. See the free space on both disks:

   ```bash
   df -h
   ```

2. For media, list the folder inside an app. Replace `APP` with the app's name, such as `jellyfin`:

   ```bash
   sudo docker exec APP ls /data/media1
   ```

   You see your media type folders, such as `movies` and `tv`.

3. Open the app. Your library shows your titles. In Sonarr, Radarr or Lidarr, the root folder list shows a path under `/data/media1`.
4. For Docker's storage, list your containers:

   ```bash
   sudo docker ps -a
   ```

   Your apps show as `Up`. With a license you can use **Tools** > **Stack Manager** > **Containers Status** instead.

5. Reboot once. Then check that the disk is mounted:

   ```bash
   findmnt /mnt/data
   ```

   Many apps, including Jellyfin, Sonarr and Radarr, are set not to start on boot. Go to **Tools** > **Stack Manager** > **Up** to start them, then check that they show as `Up`.

## If apps do not start

- If an app shows `Restarting` or `Exited`, see [A container keeps restarting, is unhealthy or has exited](/docker/container-keeps-restarting/).
- If a media app shows an empty library, the disk is probably not mounted, or your user does not own the folder. See [Media app shows an empty library](/apps/media-library-empty/).
- If an app cannot write to the new folder, make your user the owner. See [The app cannot read or write the folder](/storage/folders/#the-app-cannot-read-or-write-the-folder).
- If you see `no space left on device`, the wrong disk is still full. Run `df -h` and see [Free up disk space used by Docker](/docker/free-disk-space/).

## Related

- [Set your media, downloads and other folders](/storage/folders/): every folder entry and how to apply a change.
- [Free up disk space used by Docker](/docker/free-disk-space/): clean up before you move anything.
- [Mount an SMB or NFS share without Rclone](/storage/smb-nfs-mounts/): put your media on a NAS instead of a local disk.
- [Stack Manager](/using-deployrr/stack-manager/): stop, start and recreate your apps.
- [Back up and restore your Docker folder](/using-deployrr/backups/): make a backup before you move anything.
