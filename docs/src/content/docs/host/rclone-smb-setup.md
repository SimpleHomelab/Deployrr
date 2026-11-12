---
title: Mount a NAS share with Rclone
sidebar:
  label: Mount a NAS share with Rclone
description: Mount an SMB share from your NAS with Rclone so Plex, Jellyfin and the Arr apps can use it, and so it comes back after every reboot.
type: how-to
tags:
  - host
  - media
applies_to: v6.0+
related:
  - host/rclone-mount-not-empty
  - host/smb-nfs-mounts
  - host/shim-task-debian
  - docker/waiting-for-container
  - using-deployrr/bash-aliases
further_reading: []
videos:
  - id: rdqbAr0TFnQ
    start: 1059
    title: "Deployrr 5 walkthrough: Rclone SMB remote and automount"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: rdqbAr0TFnQ
    start: 1176
    title: "Deployrr 5 walkthrough: Delay Media Apps after the Rclone mount"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: D-XS0biLP14
    start: 734
    title: "Rclone SMB mount: the script that starts media apps after the mount"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
last_reviewed: 2026-11-09
status: current
old_paths: []
sources: []
---

This page shows how to mount a share from your NAS on your Deployrr server with Rclone. You set it up once in the **Rclone** menu. The share then mounts on every boot, and your media apps wait for it before they start.

## Before you start

- You have a Basic, Plus or Pro license. If you don't, Deployrr shows a **Requirements Not Met** box that says "License - Basic, Plus, or Pro required".
- You finished the **Prerequisites** steps. See [Quick start](/getting-started/quick-start/).
- You know your NAS IP address (for example `192.168.1.254`).
- You have a NAS user name and password that can read the share.
- Your server has a working network connection to the NAS.

:::note
Deployrr is tested with one SMB remote through Rclone. The menu says so. Set up one remote.
:::

If your server is a Proxmox LXC container, Deployrr does not block the **Rclone** menu. It does block the separate **SMB Mount** and **NFS Mount** options. After you choose **Yes** at their first prompt, they show this message: "SMB mounting is only supported on VPS, Barebones, or Virtual Machine systems. If you are using a Proxmox LXC, then use Bind Mounts or Rclone." If Docker itself fails in your LXC, see [Docker fails with "failed to create shim task"](/host/shim-task-debian/).

## Steps

Open the menu with **System** > **Mounts** > **Rclone**. You do the five parts below in this order. Parts 1, 2, 3 and 5 are the menu options **Install**, **SMB Remote**, **Automount** and **Delay Media Apps**. Part 4 is in **System** > **Folders**. The Rclone menu also has **Refresh Cache** and **Uninstall**.

### 1. Install Rclone

1. Select **Install**.
2. If you see "Rclone is already installed", go to part 2.
3. Read "Would you like to install Rclone?" and choose **Yes**.
4. Wait while Deployrr shows four steps. It can take a few minutes. It may ask for your sudo password.
5. Wait for "Rclone installation completed successfully".

The **Install** line in the menu now shows the Rclone version and "INSTALLED" in green.

If you see "Failed to install fuse3" or "Failed to install Rclone", check that your server can reach the internet, then run **Install** again.

### 2. Add the SMB remote

1. Select **SMB Remote** ("Add a Remote SMB Share").
2. Read "Would you like to add an Rclone SMB remote?" and choose **Yes**.
3. Fill in the form:
   - **Remote Name** is a short name you choose, such as `nas`. You will see it again in the service name and the log name.
   - **Server IP** is the IP address of your NAS, such as `192.168.1.254`.
   - **Username** is your NAS user name.
   - **Password** is your NAS password.
4. Select **OK**.
5. Wait for "Remote connection successful" and then "Rclone SMB remote configured successfully".

Fill in all four fields. If one is empty, Deployrr shows "Incomplete information. Please re-run this step and provide all required details."

:::caution
Type your NAS password only in this form. The field does not hide what you type, so check that nobody can see your screen.
:::

The form does not ask for a share name. (The separate **SMB Mount** option does. See [Mount an SMB or NFS share without Rclone](/host/smb-nfs-mounts/).) You pick the folder you need in part 4.

If the connection test fails, you see one of these messages:

| Message | What to do |
| --- | --- |
| Incorrect username/password | Check the user name and password, then see the note below the table. |
| Cannot reach remote host - check IP address | Check the NAS IP address and that the NAS is on, then see the note below the table. |
| Remote already defined in config | A remote with this name and IP address already exists. If its earlier test worked, go on to part 3. If the test failed, see the note below the table. |

Deployrr saves the remote before it tests the connection, and keeps it when the test fails. If you run **SMB Remote** again with the same name and IP, you get "Remote already defined in config" and nothing changes. To try again, either use a different **Remote Name**, or remove the failed remote first. It is a block that starts with `[NAME]` in `rclone.conf`, in the `appdata/rclone` folder inside your Docker folder:

```bash
sudo nano DOCKER_FOLDER/appdata/rclone/rclone.conf
```

Delete the lines from `[NAME]` down to the next `[` line (or the end of the file), save, and run **SMB Remote** again.

The **SMB Remote** line in the menu now reads "1 remote(s) defined".

To see the remote and the automount filled in on screen, watch [Deployrr 5 walkthrough: Rclone SMB remote and automount at 17:39](https://youtu.be/rdqbAr0TFnQ?t=1059) (shows Deployrr v5; menus differ in v6).

### 3. Set up the automount

1. Select **Automount**.
2. Read "Create an automount for the remote". The buttons are in an unusual order: **Cancel** is selected first, so Enter cancels. Press Tab to move to **Proceed**, then press Enter.
3. Read "Select a directory where the Rclone SMB share will be mounted". Select **OK**.
4. Read the directory browser instructions. Select **OK**. In the browser, Up and Down move, Spacebar opens a folder, Tab switches to the buttons and Esc cancels. The browser starts at `/`, not at your mount folder.
5. In the browser, pick the mount folder. To make a new folder, type its name at the end of the path, such as `/media/rclone/nas`.
6. Select **Select**. Then choose **Confirm**. Deployrr creates the folder if it does not exist.
7. Read "Select a directory where Rclone will store its cache". Select **OK**.
8. Pick the cache folder the same way. Use a folder on a disk with free space. Confirm it.
9. In the **Update Configuration** box, at "Size of Rclone cache in GB (e.g. 256 - number only):", enter a number only, such as `256`. If it is empty, or a folder you picked doesn't exist, you see "Incomplete or incorrect information. Please try again."
10. Wait for "Rclone SMB successfully mounted and configured for auto-start".

:::caution
Use an empty folder as the mount folder. Deployrr does not check what is in it. If it holds files, the mount fails. See [Rclone mount folder is not empty](/host/rclone-mount-not-empty/).
:::

Deployrr stops your media apps during this step. You start them again at the end.

If you see "Mount verification failed", the mount did not start. The next line gives the path of the log file:

```txt
DOCKER_FOLDER/logs/HOSTNAME/rclone-NAME.log
```

`DOCKER_FOLDER` is your Docker folder, `HOSTNAME` is your server's hostname and `NAME` is the remote name you chose. To read the end of the log, replace those three values and run:

```bash
sudo tail -n 30 DOCKER_FOLDER/logs/HOSTNAME/rclone-NAME.log
```

If you run **Automount** again and the service exists but is stopped, Deployrr asks "An automount is already configured but not active. Would you like to start it now?" Choose **Yes**. You see "Rclone service started successfully", or "Failed to start service. Check" followed by the log path.

If you see "An automount is already defined and active for this remote", the share is already mounted.

The service is named `rclone-NAME.service`. You can check it any time:

```bash
sudo systemctl status rclone-NAME.service
```

Replace `NAME` with your remote name.

### 4. Point your apps at the share

Your NAS shares should appear as folders inside the mount folder. Open the mount folder and look. You pick the folder that holds your media.

1. In Deployrr, open **System** > **Folders**.
2. Select **Media Folder 1**.
3. Choose the folder on the share that holds your media, such as `/media/rclone/nas/MY_SHARE/media`. Replace the path with your own.
4. Set **Downloads Folder** the same way if your downloads live on the NAS.

At least one media folder is required for the media, downloader and Arr apps. For every folder and which apps use it, see [Set your media, downloads and other folders](/using-deployrr/folders/). To let Plex, Jellyfin or Emby use your graphics card, see [Set up GPU hardware transcoding](/apps/gpu-transcoding/).

:::note
If you change a folder path, you must recreate the apps that use it. Until then they keep the old path. A media folder you set after an app was installed needs a reinstall instead; see [Apps you installed before you set a media folder](/using-deployrr/folders/#apps-you-installed-before-you-set-a-media-folder). Recreate all your apps with this Deployrr command. See [Bash aliases](/using-deployrr/bash-aliases/).

```bash
dcrec
```

Without the aliases, run this. Replace `DOCKER_FOLDER` with your Docker folder path and `HOSTNAME` with your server's hostname:

```bash
sudo docker compose --profile all -f DOCKER_FOLDER/docker-compose-HOSTNAME.yml up -d --force-recreate --remove-orphans
```
:::

### 5. Delay your media apps at boot

Your server can start Docker before the NAS share is mounted. Then media apps write into an empty folder or crash. **Delay Media Apps** prevents this.

**Delay Media Apps** works only when the share is mounted now. Finish part 3 first.

1. Select **Delay Media Apps** ("Set Media apps to Start after Rclone").
2. Read the **PROBLEM** and **SOLUTION** text. As in Automount, **Cancel** is selected first. Press Tab to move to **Proceed**, then press Enter.
3. Wait for "Delayed media start script installed successfully".

From the next boot, your media apps, such as Plex, Jellyfin, Radarr and Sonarr, do not start by themselves. They start once the mount is ready. Deployrr checks every 5 seconds. If the mount is not ready after about 15 minutes, the media apps stay stopped.

To understand how a start script waits for the mount, watch [Rclone SMB mount: the script that starts media apps at 12:14](https://youtu.be/D-XS0biLP14?t=734) (manual setup; Deployrr does these steps for you).

The menu shows "DONE" next to **Delay Media Apps** once it is set up.

Last, start your apps now. Run this Deployrr command:

```bash
dcup
```

Without the aliases, run this. Replace `DOCKER_FOLDER` and `HOSTNAME` as before:

```bash
sudo docker compose --profile all -f DOCKER_FOLDER/docker-compose-HOSTNAME.yml up -d --build --remove-orphans
```

## Check it worked

1. In **System** > **Mounts** > **Rclone**, the **Automount** line reads "Rclone SMB Share (MOUNT_FOLDER mounted)" with "mounted" in green. `MOUNT_FOLDER` is the folder you picked.
2. List the mount folder. Replace `MOUNT_FOLDER` with your path. You should see your NAS shares:

   ```bash
   ls MOUNT_FOLDER
   ```

3. Reboot the server:

   ```bash
   sudo reboot
   ```

4. After it is back, check that the service is running. Replace `NAME` with your remote name:

   ```bash
   sudo systemctl is-active rclone-NAME.service
   ```

   It prints `active`.

5. Wait a minute, then check that your media apps are running. Run this Deployrr command:

   ```bash
   dps
   ```

   Without the aliases, run `sudo docker ps -a`. Your media apps show a status that starts with "Up".

If the apps run but their library is empty, see [Media app shows an empty library](/apps/media-library-empty/).

If the apps do not come back, read the timer logs in the same folder as the Rclone log. Replace the two values as before:

```bash
sudo tail -n 20 DOCKER_FOLDER/logs/HOSTNAME/rclone-NAME-timer.log
sudo tail -n 20 DOCKER_FOLDER/logs/HOSTNAME/rclone-NAME-timer.err
```

The `.log` file says "Media containers started" with a date. The `.err` file says "Media containers start failed" if the mount never became ready.

## Other options in the Rclone menu

- **Refresh Cache** ("Clear/refresh Rclone Cache") makes Rclone read the files on your NAS again. Use it when new files do not show up. It needs the share to be mounted. Deployrr asks "Clear cache for remote: NAME?" first. It ends with "Cache refresh operation completed". If you see "No active mount found for NAME" before that, the refresh did nothing because the mount is not running.
- **Uninstall** ("Remove everything (Rclone and Startup Scripts, etc.)") warns that it will uninstall Rclone, unmount all remotes and remove startup scripts. **Uninstall** is selected first, so pressing Enter starts it. Use Tab to move to **Cancel** if you don't mean it. It removes Rclone, fuse3, the `rclone-NAME` service and the delayed media start, then shows "Rclone uninstalled successfully". It keeps `rclone.conf` and your mount folder.

## Related

- [Rclone mount folder is not empty](/host/rclone-mount-not-empty/): fix "Mount verification failed" caused by files in the mount folder.
- [Mount an SMB or NFS share without Rclone](/host/smb-nfs-mounts/): the SMB Mount and NFS Mount options.
- [Docker fails with "failed to create shim task"](/host/shim-task-debian/): Docker problems in a Proxmox LXC container.
- [Deployrr times out waiting for a container to start](/docker/waiting-for-container/): what to do when an app will not start.
- [Bash aliases](/using-deployrr/bash-aliases/): what `dcup`, `dcrec` and `dps` do.
