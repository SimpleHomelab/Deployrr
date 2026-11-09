---
title: Rclone mount fails with "is not empty, use --allow-non-empty to mount anyway"
sidebar:
  label: Rclone mount folder is not empty
description: Fix the Rclone "failed to mount FUSE fs" error when the mount folder is not empty. Check it, move the stray files aside and mount your share again.
type: troubleshooting
tags:
  - host
  - logs
  - docker
applies_to: v6.0+
symptoms:
  - "Fatal error: failed to mount FUSE fs: \"/media/rclone/NAME\" is not empty, use --allow-non-empty to mount anyway"
  - failed to mount FUSE fs is not empty
  - use --allow-non-empty to mount anyway
  - Mount verification failed
  - Failed to start service. Check
  - My NAS share does not show up in the Rclone mount folder
related:
  - using-deployrr/bash-aliases
  - docker/waiting-for-container
  - host/shim-task-debian
  - getting-started/quick-start
further_reading: []
last_reviewed: 2026-11-09
status: current
old_paths: ["/operating-system/rclone-mount-point-not-empty-error"]
sources:
  - { type: discord, ref: "https://discord.com/channels/974306760171073556/1350240462593589278" }
---

You set up an Rclone mount for your NAS in Deployrr, but the share does not appear. The Rclone log says the mount folder is not empty. This page shows how to clear the folder safely and mount again.

## Symptoms

You run **System** > **Mounts** > **Rclone** > **Automount**. On a first setup, Deployrr shows:

```txt
Mount verification failed
```

If the automount already exists and you agreed to start it, Deployrr shows:

```txt
Failed to start service. Check
```

Both messages are followed by the path of the Rclone log file. The log has this line. `NAME` stands for your own folder name:

```txt
Fatal error: failed to mount FUSE fs: "/media/rclone/NAME" is not empty, use --allow-non-empty to mount anyway
```

You may also see the problem after a reboot. Your apps run, but the NAS files are missing.

## Cause

Rclone refuses to mount a share on a folder that already has files in it. This protects those files from being hidden by the mount.

The usual reason is that apps wrote into the folder while the share was not mounted. For example, Jellyfin or Radarr started before the mount was ready and created folders there. Files left over from an earlier mount attempt can also cause it.

Those files sit on your server's own disk. They are not your NAS files. Deployrr does not check the folder for stray files before it mounts, so you only find out from the log.

:::note
Automount needs a Basic, Plus or Pro license. If Deployrr shows `License - Basic, Plus, or Pro required`, the mount folder is not the problem.
:::

## Fix

:::caution
Do not delete anything until step 3 says the folder is not a mount. If the share is mounted, the folder shows your real NAS files. Deleting them removes data from your NAS.
:::

Replace `MOUNT_FOLDER` in the commands with the path from the error line, such as `/media/rclone/NAME`. Replace `NAME` with the name of your Rclone remote. These are values you fill in.

1. Stop your apps so nothing writes to the folder. This Deployrr command stops and removes all your app containers. Your app data stays. See [Bash aliases](/using-deployrr/bash-aliases/).

   ```bash
   dcdown
   ```

2. Stop the Rclone mount service:

   ```bash
   sudo systemctl stop rclone-NAME.service
   ```

   If you are not sure of the name, list the Rclone services with `systemctl list-units --all 'rclone-*'`.

3. Check that the folder is not a mount:

   ```bash
   mountpoint MOUNT_FOLDER
   ```

   You must see `MOUNT_FOLDER is not a mountpoint`. If it says `is a mountpoint`, stop here. The share is mounted, so the folder is not the problem.

4. Look at what is in the folder:

   ```bash
   ls -la MOUNT_FOLDER
   ```

   You should see folders or files your apps created, not your NAS files. If you see your NAS files, stop and ask for help.

5. Create a backup folder outside the mount folder. Pick any path you like. Replace `BACKUP_FOLDER` with it:

   ```bash
   mkdir -p BACKUP_FOLDER
   ```

6. Move the contents into the backup folder, hidden files included:

   ```bash
   sudo find MOUNT_FOLDER -mindepth 1 -maxdepth 1 -exec mv -t BACKUP_FOLDER {} +
   ```

7. Check that the mount folder is empty:

   ```bash
   ls -A MOUNT_FOLDER
   ```

   The command prints nothing.

8. In Deployrr, open **System** > **Mounts** > **Rclone** > **Automount**.
9. What you see next depends on your setup:
   - "An automount is already configured but not active. Would you like to start it now?": choose Yes. Deployrr shows `Rclone service started successfully`. This is the usual case, because a failed first setup still creates the service.
   - "Confirm Rclone SMB Automount": choose **Proceed**. Pick the mount folder and the cache folder, then enter the cache size in GB (a number only). Deployrr shows `Rclone SMB successfully mounted and configured for auto-start`.
   - "An automount is already defined and active for this remote.": the share is already mounted. Go to "Check it worked".

10. Start your apps again. This command also recreates containers if needed:

    ```bash
    dcup
    ```

11. Look through the backup folder. When you are sure you do not need anything in it, delete it:

    ```bash
    sudo rm -rf BACKUP_FOLDER
    ```

    :::caution
    `rm -rf` cannot be undone. Check the path twice. Never run it on the mount folder while the share is mounted.
    :::

If the error comes back, read the end of the Rclone log. The log is in your Docker folder, under `logs/YOUR_HOSTNAME/`. Replace `YOUR_DOCKER_FOLDER` with your Docker folder path and `YOUR_HOSTNAME` with your server's hostname. To see the Docker folder path, open **Prerequisites** > **Docker Folder** in Deployrr.

```bash
sudo tail -n 30 YOUR_DOCKER_FOLDER/logs/YOUR_HOSTNAME/rclone-NAME.log
```

## Check it worked

1. The folder is now a mount:

   ```bash
   mountpoint MOUNT_FOLDER
   ```

   It says `MOUNT_FOLDER is a mountpoint`.

2. Your NAS files show up:

   ```bash
   ls MOUNT_FOLDER
   ```

3. In Deployrr, open **System** > **Mounts** > **Rclone**. The **Automount** line reads "Rclone SMB Share (MOUNT_FOLDER mounted)". If it says "not mounted" in red, the mount is still not working.

## Stop it coming back

Apps that use the mount can start before the mount is ready. They then write into the empty folder. Deployrr warns about this: "Typically, Docker containers that rely on Rclone mounts start before the mount is active. This can cause crashes."

In **System** > **Mounts** > **Rclone**, choose **Delay Media Apps** ("Set Media apps to Start after Rclone"). Run it after Automount works, because it needs a mounted share. It stops your media apps from starting on their own at boot. Instead, they start once the Rclone mount is ready. The menu shows "DONE" next to it when it is set up.

If the mount is still not ready after about 15 minutes, the media apps stay stopped. Check the timer logs `rclone-NAME-timer.log` and `rclone-NAME-timer.err` in the same logs folder as the Rclone log.

## Related

- [Bash aliases](/using-deployrr/bash-aliases/): what `dcdown` and `dcup` do.
- [Deployrr times out waiting for a container to start](/docker/waiting-for-container/): how to read container logs when apps do not start.
- [Docker fails with "failed to create shim task"](/host/shim-task-debian/): another reason apps do not start.
- [Quick start](/getting-started/quick-start/): the Prerequisites steps in order.
