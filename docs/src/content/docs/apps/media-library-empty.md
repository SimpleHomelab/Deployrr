---
title: Media app shows an empty library or no folders
sidebar:
  label: Media library is empty
description: Fix an empty Plex, Jellyfin, Emby or Arr library by checking the media folder, the container path, the folder owner and the library scan, in order.
type: troubleshooting
tags:
  - media
  - host
  - compose
  - docker
applies_to: v6.0+
apps:
  - plex
  - jellyfin
  - emby
  - sonarr
  - radarr
  - lidarr
  - navidrome
symptoms:
  - My Plex library is empty
  - Jellyfin library shows no movies or shows after adding a folder
  - Emby library is empty
  - The folder browser in Plex, Jellyfin or Emby shows no media folders
  - Sonarr or Radarr root folder is empty or does not list /data/media1
  - Media is on my NAS but the app cannot see it
related:
  - using-deployrr/folders
  - apps/reinstall-app
  - host/rclone-smb-setup
  - host/smb-nfs-mounts
  - using-deployrr/stack-manager
further_reading:
  - title: "UDMS part 07: Permission denied errors on SMB mounts"
    url: "https://www.simplehomelab.com/udms-07-mount-remote-shares-smb/#Permission_Denied_Errors"
  - title: "UDMS part 08: Permission denied errors on NFS mounts"
    url: "https://www.simplehomelab.com/udms-08-mount-remote-folders-using-nfs/#Permission_Denied_Errors"
videos:
  - id: rdqbAr0TFnQ
    start: 1337
    title: "Deployrr 5 walkthrough: Setting the media folders before you install apps"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: rdqbAr0TFnQ
    start: 1176
    title: "Deployrr 5 walkthrough: Delay Media Apps until the Rclone mount is ready"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: D-XS0biLP14
    start: 669
    title: "Rclone SMB mount: making your user the owner of the mount folders"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
last_reviewed: 2026-11-12
status: current
old_paths: []
sources: []
---

## Symptoms

You installed a media app such as Plex, Jellyfin, Emby, Navidrome, Sonarr, Radarr or Lidarr. One of these happens:

- The library is empty after you add it.
- The folder browser inside the app shows no media folders, or an empty one.
- Only some of your files show up.
- Sonarr, Radarr or Lidarr do not list `/data/media1` as a root folder.

## Cause

The app runs in a container and sees your files at a different path than your server does. In v6, the media apps see your folders like this:

| Folder on your server | Path inside the app |
| --- | --- |
| Media Folder 1 | `/data/media1` |
| Media Folder 2 | `/data/media2` |
| Media Folder 3 | `/data/media3` |
| Downloads Folder | `/data/downloads` |

Navidrome gets the media folders but not the Downloads Folder. If your library is fine but finished downloads never reach it, see [Sonarr, Radarr or Lidarr don't import finished downloads](/apps/arr-downloads-not-importing/).

The library is empty when one of these is true:

- The folder on your server is empty or not mounted.
- You set a media folder after you installed the app, so the app never got it. This is most often Media Folder 2 or 3. These apps don't install without at least one media folder set.
- The library in the app points at the server path instead of the `/data` path.
- Your user cannot read the folder.
- The app has not scanned the folder yet.

Work through the checks below in order. Stop when your library fills.

## Fix

### 1. Check the files on the server

1. In Deployrr, go to **System** > **Folders**. Note the path next to **Media Folder 1**. If it says `NOT SET`, set it as shown in [Set a folder](/using-deployrr/folders/#set-a-folder), then go to check 2.
2. List the folder on the server. Replace `YOUR_MEDIA_FOLDER` with the path from step 1:

   ```bash
   ls YOUR_MEDIA_FOLDER
   ```

3. Look for your media type folders, such as `movies` and `tv`. If the list is empty, the problem is on the server, not in the app.

If your media is on a NAS and the list is empty, the share is not mounted:

- Mount it again with [Rclone](/host/rclone-smb-setup/) or with [SMB and NFS mounts](/host/smb-nfs-mounts/).
- If Rclone says the mount folder is not empty, see [Rclone mount folder is not empty](/host/rclone-mount-not-empty/).
- If the files are there after a reboot but the app was empty at start, the NAS was not ready when the app started. Use **System** > **Mounts** > **Rclone** > **Delay Media Apps**. See part 5 of [Mount a NAS share with Rclone](/host/rclone-smb-setup/).

When the files show on the server again, restart the app from **Apps** > **Manage Apps**: pick the app and choose **Restart**, or **Start** if it is stopped. See [Install and manage apps from the Apps menu](/apps/manage-apps/).

### 2. Check that the app has the folder

An app only gets the media folders that were set when you installed it. To see why the order matters, watch [Deployrr 5 walkthrough: Setup Folders at 22:17](https://youtu.be/rdqbAr0TFnQ?t=1337) (shows Deployrr v5; menus differ in v6).

1. Look inside the app's container. Replace `APP` with the app's name, such as `jellyfin`:

   ```bash
   sudo docker exec APP ls /data
   ```

   With the [Deployrr bash aliases](/using-deployrr/bash-aliases/): `dexec APP ls /data`.

2. Look for `media1`, and `media2` or `media3` if you use them. If a folder is missing, the app does not have it.
3. To confirm, read the app's compose file. Replace `YOUR_DOCKER_FOLDER` with your Docker folder path, `HOSTNAME` with your server's hostname and `APP` with the app's name:

   ```bash
   grep MEDIADIR YOUR_DOCKER_FOLDER/compose/HOSTNAME/APP.yml
   ```

   A line that starts with `#` is off. For example, `# - $MEDIADIR1:/data/media1` means the app has no Media Folder 1.

4. If the lines are off, but you set the folder in **System** > **Folders**, [reinstall the app](/apps/reinstall-app/). Reinstalling keeps the app's data but replaces its compose file, so make the backups on that page first. For a running app, start the reinstall from **Apps** > **Browse Apps**. **Manage Apps** shows **Reinstall** only for a stopped app.
5. If the lines are on and the path in `.env` changed, recreate the app. Go to **Tools** > **Stack Manager** > **Recreate** and pick the app. See [Stack Manager](/using-deployrr/stack-manager/). With the Deployrr bash aliases: `dcrec APP`.

Recreating does not turn on a media folder that was off. Only a reinstall does. For the full explanation, see [Apps you installed before you set a media folder](/using-deployrr/folders/#apps-you-installed-before-you-set-a-media-folder).

### 3. Use the path inside the app

In the app, add the library with the `/data` path, not the path on your server.

1. Open the app and go to where you add a library or a root folder.
2. Browse to `/data/media1`, then pick your media type folder, such as `/data/media1/movies`.
3. Do not type a path like `/home/YOUR_USER/media/movies`. The app cannot see that path.
4. Save the library.

For Sonarr, Radarr and Lidarr, the root folder works the same way. See [Connect your apps to each other](/using-deployrr/connecting-apps/) if you link them to a media server.

### 4. Check who owns the folder

Apps run as your Linux user and its main group. Deployrr makes your user the owner only of a folder it creates for you. A folder that already existed keeps its own owner. A folder owned by `root`, or a NAS share your user cannot read, gives an empty or partial library.

1. Check the owner. Replace `YOUR_MEDIA_FOLDER` with your path:

   ```bash
   ls -ld YOUR_MEDIA_FOLDER
   ```

2. For a local folder owned by `root`, check the path again. Make sure it is your media folder and not `/` or your home folder.
3. Make your user the owner. Replace `YOUR_USER` with your Linux username and `YOUR_MEDIA_FOLDER` with your path. The command assumes your main group has the same name as your user, which is the default on most systems:

   ```bash
   sudo chown YOUR_USER:YOUR_USER YOUR_MEDIA_FOLDER
   ```

   :::caution
   This changes who owns the folder. A wrong path changes the wrong files. Do not add `-R` unless you mean to change everything inside. On a large library, `-R` takes a long time.
   :::

4. If the folder holds subfolders you cannot read, run `ls -ld` on one of them. Fix the owner the same way.

To see a root-owned mount folder fixed by hand, watch [Rclone SMB mount on Ubuntu/LXC: folder owner at 11:09](https://youtu.be/D-XS0biLP14?t=669) (manual setup).

On a NAS mount, the NAS decides who can read. Check the share permissions on the NAS, and that the account you mount with can read the share. See [UDMS part 07: Permission Denied Errors](https://www.simplehomelab.com/udms-07-mount-remote-shares-smb/#Permission_Denied_Errors) (manual setup). For more, see [The app cannot read or write the folder](/using-deployrr/folders/#the-app-cannot-read-or-write-the-folder).

### 5. Scan the library

A new library can take a while to fill. Media servers scan in the background, and big libraries can take a long time.

1. Open the app.
2. Find the library and start a scan, or refresh it. The menu text depends on the app.
3. Wait, then check again.

## Check it worked

1. Run `sudo docker exec APP ls /data/media1` with your app name. You see your media type folders.
2. Open the app. The library shows your titles.
3. In Sonarr, Radarr or Lidarr, the root folder list shows a path under `/data/media1`.

## Related

- [Set your media, downloads and other folders](/using-deployrr/folders/): every folder entry, which apps use it, and what to do after a change.
- [Reinstall an app and keep its data](/apps/reinstall-app/): add a media folder to an app you installed earlier.
- [Mount a NAS share with Rclone](/host/rclone-smb-setup/): mount your NAS and delay media apps until it is ready.
- [Mount an SMB or NFS share without Rclone](/host/smb-nfs-mounts/): the other way to mount a NAS.
- [Stack Manager](/using-deployrr/stack-manager/): recreate an app after a folder path change.
