---
title: Apps are stopped or show empty folders after a reboot
sidebar:
  order: 4
  label: Apps not starting after reboot
description: Start media apps that stay Exited after a reboot, check your disk or share is mounted first, and make them wait for an SMB or NFS share at boot.
type: troubleshooting
tags:
  - docker
  - media
  - host
applies_to: v6.0+
apps:
  - plex
  - jellyfin
  - emby
  - sonarr
  - radarr
  - lidarr
  - bazarr
symptoms:
  - Exited (N) 5 minutes ago
  - Jellyfin, Plex, Sonarr or Radarr is not running after I rebooted my server
  - My apps do not start after a reboot
  - Media apps stay stopped after Docker restarts
  - My media app shows an empty library after a reboot
  - My NAS share or disk is not mounted after a reboot
  - I want my media apps to start after my SMB or NFS share is mounted
  - My apps stopped after I restarted Docker
related:
  - using-deployrr/stack-manager
  - storage/rclone-smb-setup
  - storage/smb-nfs-mounts
  - apps/media-library-empty
  - using-deployrr/bash-aliases
further_reading:
  - title: "UDMS part 07: Test the SMB fstab mount"
    url: https://www.simplehomelab.com/udms-07-mount-remote-shares-smb/#Test_fstab_Configuration
  - title: "UDMS part 08: Test the NFS fstab entry"
    url: https://www.simplehomelab.com/udms-08-mount-remote-folders-using-nfs/#Test_the_fstab_Entry
videos:
  - id: rdqbAr0TFnQ
    start: 1176
    title: "Deployrr 5 walkthrough: Rclone Delay Media Apps"
    note: Shows Deployrr v5. Menus and steps differ in v6.
  - id: THuLgGwq0vg
    start: 2276
    title: "Docker Compose server guide: why Jellyfin does not auto-start after a reboot"
    note: Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens.
last_reviewed: 2026-11-13
status: current
old_paths: []
sources: []
---

## Symptoms

You reboot your server, or Docker restarts. Afterwards one or more of these happens:

- Jellyfin, Plex, Sonarr, Radarr or another media app is not running, and its web page does not open.
- The container list shows the app as stopped. `N` is a number:

  ```txt
  Exited (N) 5 minutes ago
  ```

- The app runs, but its library or folders are empty.
- Your NAS share or extra disk is not mounted.

## Cause

There are two separate causes. You may have both.

**The app is set not to start on its own.** Most Deployrr apps start again after a reboot. These do not:

- Plex, Jellyfin, Emby
- Sonarr, Radarr, Lidarr, Bazarr, Jackett, Notifiarr, Mylar3, Kometa, Dispatcharr
- Tautulli
- Kavita, Komga, Navidrome, Calibre, Calibre-Web, Beets, Gonic, Airsonic-Advanced, Funkwhale
- Kasm, Resilio Sync, MQTTX Web

Most of these are media apps, and media apps often use files on a NAS. If they started before the share was ready, they could crash or see an empty folder. So they wait for you. After a reboot they stay `Exited` until you start them. Audiobookshelf and Lollypop start on their own.

To hear why one setup turns off auto-restart for media apps, watch [Docker Compose server guide: why Jellyfin does not auto-start after a reboot at 37:56](https://youtu.be/THuLgGwq0vg?t=2276) (manual Docker Compose setup).

**The disk or share is not mounted yet.** An app that starts before its disk or share is mounted sees an empty folder. It may then show an empty library. Check the mount before you start your apps.

## Fix

### 1. Check that your disk or share is mounted

Skip this step if your media is on the same disk as Deployrr. Do it first if your media is on a NAS or another disk.

1. Check the mount. Replace `MOUNT_FOLDER` with the folder where your share or disk should be:

   ```bash
   findmnt MOUNT_FOLDER
   ```

   You see one line with the source and the folder. If you see nothing, it is not mounted.

2. If it is not mounted, find out how you mounted it:
   - Rclone: see step 2.
   - **SMB Mount**, **NFS Mount** or a disk you added to `/etc/fstab`: see step 3.

If it is mounted, go to step 4.

### 2. Rclone share is not mounted

An Rclone mount is its own service. Replace `NAME` with the remote name you chose:

```bash
sudo systemctl status rclone-NAME.service
```

If it is not active, start it from Deployrr:

1. Go to **System** > **Mounts** > **Rclone** > **Automount**.
2. At "Confirm Rclone SMB Automount", **Cancel** is selected first. Press Tab to move to **Proceed**, then press Enter.
3. At "Service Not Active", choose **Yes** to "Would you like to start it now?".
4. Look for "Rclone service started successfully". If you see "Failed to start service", the message names the log file to read.

If you see "An automount is already defined and active for this remote.", the service is running. If the folder is still empty, see [Rclone mount folder is not empty](/storage/rclone-mount-not-empty/). Part 3 of [Mount a NAS share with Rclone](/storage/rclone-smb-setup/) has the full setup.

### 3. SMB, NFS or disk entry in /etc/fstab is not mounted

Linux mounts these from `/etc/fstab` at boot. Ask Linux to mount everything in that file now:

```bash
sudo mount -a
```

No output means it worked. If you see an error, read it. It usually names the line and the cause, such as a NAS that is off, a wrong IP address or a missing folder. Turn the NAS on or fix the cause, then run the command again. Run `findmnt MOUNT_FOLDER` to confirm.

To understand how the `/etc/fstab` test works, read [UDMS part 07: Test fstab Configuration](https://www.simplehomelab.com/udms-07-mount-remote-shares-smb/#Test_fstab_Configuration) for SMB or [UDMS part 08: Test the fstab Entry](https://www.simplehomelab.com/udms-08-mount-remote-folders-using-nfs/#Test_the_fstab_Entry) for NFS (manual setup).

If the share or disk is mounted after `sudo mount -a` but was not mounted at boot, the NAS may not have been ready when your server booted. Next time, make sure the NAS is on before you start the server. To have your media apps wait for the share by themselves, see step 6.

:::caution
A wrong line in `/etc/fstab` can stop your server from booting normally. Before you change it, copy it with `sudo cp /etc/fstab /etc/fstab.before-edit`. After you change it, run `sudo mount -a` and fix every error before you reboot. Deployrr also keeps copies as `/etc/fstab_` followed by the date and time. See [If the mount fails](/storage/smb-nfs-mounts/#if-the-mount-fails) for the steps. For a local disk, see [Move data to another disk](/storage/move-data-to-another-disk/). If the server doesn't boot at all, see [Server won't boot after an /etc/fstab change](/storage/fstab-boot-recovery/).
:::

The lines that **SMB Mount** and **NFS Mount** add do not tell Linux to skip a share it cannot reach. A local disk line can use the `nofail` option, so the server still boots if the disk is missing. [Move data to another disk](/storage/move-data-to-another-disk/) shows a line with it.

### 4. Start your apps

Pick one way.

**Start every app at once.**

1. In Deployrr, go to **Tools** > **Stack Manager** > **Up**.
2. Wait for "Docker stack is up".

With the [Deployrr bash aliases](/using-deployrr/bash-aliases/): `dcup`.

**Start only the stopped apps.**

1. Go to **Tools** > **Stack Manager** > **Start Container**.
2. At "Select an app to start:", type the number of the app and press Enter. To start every stopped app, type the number next to `all`. The number next to `exit` makes no changes.
3. Look for "APP started", or "All containers started".

With the aliases: `dcstart APP`. Replace `APP` with the app's name. Without a name, it starts all.

If you see "No exited containers found.", every container is already running. Stack Manager needs completed Prerequisites and a Basic, Plus or Pro license. See [Stack Manager](/using-deployrr/stack-manager/) for every option.

### 5. Start your media apps on their own at boot (Rclone only)

If your media is on an Rclone share, you can have your media apps start by themselves once the mount is ready. Use **System** > **Mounts** > **Rclone** > **Delay Media Apps** ("Set Media apps to Start after Rclone").

1. Make sure the Rclone share is mounted.
2. Select **Delay Media Apps**.
3. Read the **PROBLEM** and **SOLUTION** text. **Cancel** is selected first. Press Tab to move to **Proceed**, then press Enter.
4. Wait for "Delayed media start script installed successfully". The menu now shows " - DONE" next to the item.

This needs completed Prerequisites, a Basic, Plus or Pro license, Rclone installed, an SMB remote and the share mounted.

To see this set up, watch [Deployrr 5 walkthrough: Rclone Delay Media Apps at 19:36](https://youtu.be/rdqbAr0TFnQ?t=1176) (shows Deployrr v5; menus differ in v6).

After the next reboot, Deployrr waits for the Rclone mount and then starts your media apps. It checks every 5 seconds and gives up after about 15 minutes. If the mount never appears, it stops and removes the media app containers. This also removes Audiobookshelf and Lollypop, which otherwise start on their own. Your app data stays in the Docker folder. Fix the mount (step 2), then start the apps with **Stack Manager** > **Up** (step 4). **Start Container** can't help here, because the containers are gone. See part 5 of [Mount a NAS share with Rclone](/storage/rclone-smb-setup/) for the log files.

:::note
**Delay Media Apps** only watches the Rclone mount. It does not wait for an SMB or NFS mount in `/etc/fstab`, or for a local disk. For those, see step 6. It does not start Kasm, Resilio Sync or MQTTX Web either. After a reboot, start those with step 4.
:::

### 6. Start your media apps at boot after an SMB or NFS share is ready

**Delay Media Apps** only works with Rclone. If your share is in `/etc/fstab` (from **SMB Mount**, **NFS Mount** or a line you added), you can add a small systemd service yourself (a task Linux runs at boot). It waits until the share is mounted and then starts the apps you list. It does not change `/etc/fstab`.

:::caution
Change only the one file this section creates. A mistake in it only stops the listed apps from starting, and your server still boots. Test it before you reboot, as the last item below shows.
:::

1. Note the name of your main compose file and the path of the `docker` command. Replace `DOCKER_FOLDER` with your Docker folder, such as `/home/USER/docker`:

   ```bash
   ls DOCKER_FOLDER/docker-compose-*.yml
   command -v docker
   ```

2. Create the service file:

   ```bash
   sudo nano /etc/systemd/system/start-apps-after-share.service
   ```

3. Paste these lines, then change them:
   - Replace `MOUNT_FOLDER` with your mount folder.
   - Replace the path after `-f` with the compose file from step 1.
   - Replace `jellyfin sonarr radarr` with the apps that use the share, as their names show in `sudo docker ps -a`.
   - If step 1 showed a path other than `/usr/bin/docker`, use that path.

   ```ini
   [Unit]
   Description=Start media apps after the NAS share is mounted
   Requires=docker.service
   Wants=network-online.target
   After=docker.service network-online.target
   RequiresMountsFor=MOUNT_FOLDER

   [Service]
   Type=oneshot
   ExecStart=/usr/bin/docker compose --profile all -f /home/USER/docker/docker-compose-HOSTNAME.yml up -d jellyfin sonarr radarr

   [Install]
   WantedBy=multi-user.target
   ```

   Save and close with Ctrl+X, Y, Enter.

4. Turn the service on:

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable start-apps-after-share.service
   ```

5. Test it before you reboot. With the share mounted, stop one of the apps you listed so you can see the service start it again. Replace `jellyfin` with that app. Then run the service:

   ```bash
   sudo docker stop jellyfin
   sudo systemctl start start-apps-after-share.service
   sudo systemctl status start-apps-after-share.service
   ```

   Look for `status=0/SUCCESS`. Then check that the apps show `Up` in `sudo docker ps -a`. If the status shows an error such as `no such service`, an app name is wrong. Fix the file, then run `sudo systemctl daemon-reload` and test again.

After the next reboot, Linux mounts the share first and then starts the apps. If the share can't be mounted, for example because the NAS is off, the service does not run and the apps stay stopped. They don't start on an empty folder. If your apps stayed stopped after a reboot, turn the NAS on if it was off, run `sudo mount -a`, and then run `sudo systemctl start start-apps-after-share.service`.

Keep these in mind:

- Apps that start on their own, such as Audiobookshelf and Lollypop, start with Docker and don't wait for the share. If one shows an empty library after a reboot, restart it, for example `sudo docker restart audiobookshelf`.
- When you install another app that uses the share, or change your hostname or Docker folder, edit the `ExecStart` line to match. Then run `sudo systemctl daemon-reload`.
- To remove the service, run `sudo systemctl disable start-apps-after-share.service`, delete only that file with `sudo rm /etc/systemd/system/start-apps-after-share.service`, and run `sudo systemctl daemon-reload`.

## Restart Docker without a reboot

Restarting Docker stops every container, so all your apps, including Traefik and a DNS app such as Pi-hole, go offline for a moment. A system update that upgrades Docker can restart it too. When Docker is back, it starts only the apps that start on their own. The apps listed under [Cause](#cause) stay `Exited`, the same as after a reboot. Apps you stopped yourself before the restart also stay stopped. Your mounts are not touched.

**Delay Media Apps** and the service from step 6 only run at boot. They do not start your apps again after a Docker restart.

1. Restart Docker:

   ```bash
   sudo systemctl restart docker
   ```

2. List the containers and look for any that show `Exited`:

   ```bash
   sudo docker ps -a
   ```

3. Start the stopped apps you use with step 4. **Start Container** with `all` starts every stopped app at once, including any you stopped on purpose.

## Check it worked

1. The app shows a status that starts with `Up`:

   ```bash
   sudo docker ps -a
   ```

   With the aliases: `dps`.

2. The mount shows when you run `findmnt MOUNT_FOLDER`.
3. The app's web page opens and the library shows your titles.

If the app runs but the library is empty, restart the app and see [Media app shows an empty library](/apps/media-library-empty/). If the app starts and then stops or restarts again, see [A container keeps restarting, is unhealthy or has exited](/docker/container-keeps-restarting/).
