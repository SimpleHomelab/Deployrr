---
title: Set your media, downloads and other folders
sidebar:
  order: 1
  label: Media and app folders
description: Set the System > Folders entries for media, downloads, books, photos, Immich and Nextcloud, see which apps need each one, and apply a change.
type: guide
tags:
  - host
  - media
  - compose
applies_to: v6.0+
related:
  - storage/rclone-smb-setup
  - getting-started/requirements-not-met
  - using-deployrr/stack-manager
  - using-deployrr/reinstall-app
  - storage/smb-nfs-mounts
further_reading:
  - title: "UDMS part 07: SMB mount permission denied errors"
    url: https://www.simplehomelab.com/udms-07-mount-remote-shares-smb/#Permission_Denied_Errors
videos:
  - id: THuLgGwq0vg
    start: 250
    title: "Ultimate Docker Server: files, folders and permissions"
    note: "Manual Docker Compose setup. It sets permissions on the Docker folder; the same Linux steps apply to a media folder."
last_reviewed: 2026-11-11
status: current
old_paths: ["/using-deployrr/folders"]
sources: []
---

Use **System** > **Folders** to tell Deployrr where your media, downloads, books, photos and other files live. Apps that need a folder read the path from here. This guide lists every entry, what each prompt asks, which apps use which folder, and what to do after you change one.

## Overview

The menu is called **Set Folders**. It has twelve entries. Each one holds one path on your server. Next to each entry you see the path you set, or `NOT SET`. On the **System** menu, the **Folders** line shows how many you set, such as "Set Folders - 3 defined". With no folders set, it shows only "Set Folders".

Deployrr does not put any default path in. Every folder starts as `NOT SET`.

You only set the folders for the apps you plan to install. You do not need all twelve.

The top of the **Set Folders** screen shows two notes in a red **IMPORTANT!** block:

1. At least one media folder is required if you plan to set up any of the media, downloader, or Arr apps.
2. If you change the folder paths, you have to recreate the apps that use them for the change to take effect.

:::note
Setting a folder needs a Basic, Plus or Pro license. You can open the menu on a Free license. When you pick an entry, you see a **Requirements Not Met** box that says "License - Basic, Plus, or Pro required. Current: Free". See [Licenses](/getting-started/licenses/). You also need to finish **Prerequisites** first. See [Prerequisites, step by step](/getting-started/prerequisites/).
:::

## Do it in this order

1. Finish **Prerequisites**.
2. If your media is on a NAS, mount it first. Use [Rclone](/storage/rclone-smb-setup/) or [SMB and NFS mounts](/storage/smb-nfs-mounts/) in **System** > **Mounts**. Check that the files show up on the server.
3. Set the folders in **System** > **Folders**.
4. Install your apps from **Apps** > **Browse Apps**.

Set the folders before you install the apps. When an app installs, Deployrr checks that the folders it needs are set. If one is not set, you see a **Requirements Not Met** box and the install does not start. Set the folder, then start the install again. See [Requirements Not Met](/getting-started/requirements-not-met/#folder-lines).

For media folders, the order matters more. See [Apps you installed before you set a media folder](#apps-you-installed-before-you-set-a-media-folder).

## Set a folder

The steps are the same for every entry.

1. In Deployrr, go to **System** > **Folders**.
2. Select the folder, such as **Downloads Folder**.
3. Read the box that explains the folder. Select **OK**.
4. Read the **Directory Browser - Instructions** box. Select **OK**.
5. In the browser, pick the folder. It starts in `/home/YOUR_USER`. If that folder does not exist, it starts in `/`.
6. To make a new folder, type its name at the end of the path, such as `/home/YOUR_USER/media`.
7. Select **Select**.
8. Read "Confirm the following directory?". If the folder does not exist, you also see "Note: This directory will be created."
9. Choose **Confirm**.

In the browser, Up and Down move, Spacebar opens a folder, Tab switches to the buttons, Enter confirms and Esc cancels.

The new path now shows next to the entry. If you choose **Cancel** at the confirm step, you see "CANCELLED: Directory selection cancelled." and nothing changes.

Deployrr creates a missing folder for you, and makes your Linux user its owner. You do not need to create it first. For the Downloads Folder, Deployrr also gives your user read and write access to the folder and what is in it.

If you type a path with more than one new folder, such as `/data/a/b`, only the last folder (`b`) gets your user as owner. The new folders above it stay owned by root. To avoid this, create the parent folders first, or fix the owner afterwards as shown in [The app cannot read or write the folder](#the-app-cannot-read-or-write-the-folder).

:::caution
Do not pick a folder on a NAS that is not mounted. If the mount is down when you confirm, the path is just an empty folder on your server's own disk. Mount first, check the files are there, then pick the folder.
:::

## Every folder

The menu lists them in this order.

| Menu entry | Box title | What it is for |
| --- | --- | --- |
| **Audiobooks Folder** | Set Audiobooks Folder | The folder that holds all your audiobooks. |
| **Books Folder** | Set Books Folder | The folder that holds all your books. |
| **Comics Folder** | Set Comics Folder | The folder that holds all your comics. |
| **Downloads Folder** | Set Downloads Folder | The folder where download clients keep their own download folders. |
| **Games Folder** | Set Games Folder | The folder that holds all your games. |
| **Immich Folder** | Set Immich Uploads Folder | The folder that holds all your Immich uploads. |
| **Media Folder 1** | Set Base Media Folder 1 | The folder with your media types in their own folders. |
| **Media Folder 2** | Set Base Media Folder 2 | Same as Media Folder 1. Optional. |
| **Media Folder 3** | Set Base Media Folder 3 | Same as Media Folder 1. Optional. |
| **Nextcloud Folder** | Set Nextcloud Data Folder | The folder you want to make available in Nextcloud. |
| **Photos Folder** | Set Photos Folder | The folder that holds all your photos. |
| **Podcasts Folder** | Set Podcasts Folder | The folder that holds all your podcasts. |

### Media folders

Pick the top folder that holds your media types. The box shows this example:

```txt
/media/storage/media
  movies
    Movie A
  tv
    TV Show A
  music
    Artist A
      Album A
```

You need at least one media folder for the media, downloader and Arr apps. One is enough. Use Media Folder 2 and 3 only if your media is on more than one disk or share.

### Downloads folder

The box shows this example:

```txt
/media/storage/downloads
  usenet
    movies
    tv
    music
  torrents
    movies
    tv
    music
  youtube
```

Your download clients keep their own folders inside it. If finished downloads stay in the queue, see [Sonarr, Radarr or Lidarr don't import finished downloads](/apps/arr-downloads-not-importing/).

## Which apps use which folder

This table shows which folder each app asks for when you install it. If a folder is `NOT SET`, the install stops with a **Requirements Not Met** box that names it.

| Folder | Apps |
| --- | --- |
| Media Folder 1, 2 or 3 (at least one) | Sonarr, Radarr, Lidarr, Bazarr, Plex, Jellyfin, Emby, Navidrome, Airsonic Advanced, Gonic, Lollypop, Funkwhale, Beets, Cloud Commander, Double Commander |
| Downloads Folder | qBittorrent, qBittorrent VPN, Transmission, SABnzbd, NZBGet, Prowlarr, Jackett, Resilio Sync, Sonarr, Radarr, Lidarr, Mylar3, Plex, Jellyfin, Emby |
| Books Folder | Calibre, Calibre-Web, Kavita, Komga |
| Comics Folder | Komga, Mylar3 |
| Audiobooks Folder and Podcasts Folder | Audiobookshelf |
| Photos Folder | Piwigo, digiKam |
| Games Folder | GameVault |
| Immich Folder | Immich |
| Nextcloud Folder | Nextcloud |

Sonarr, Radarr, Lidarr, Plex, Jellyfin and Emby need both a media folder and the Downloads Folder. For Plex, Jellyfin, Emby, Lollypop, digiKam and Double Commander, the install may also ask about your graphics card. See [GPU hardware transcoding](/apps/gpu-transcoding/).

Some apps need an app-specific folder to store data. Immich keeps all uploaded photos and videos in the Immich Folder. Nextcloud keeps uploaded files in the Nextcloud Folder. Pick a disk with enough free space for these two. Coming from Deployrr v5 with Immich or Nextcloud? See [Move Nextcloud, Immich or Paperless-ngx from v5](/apps/move-database-apps-from-v5/) before you set these folders.

## Change a folder after apps are installed

A new path does not reach an app that already runs. The app keeps the old path until you recreate it.

Where the value lives: Deployrr saves each path in the `.env` file in your Docker folder. The variable names are:

| Menu entry | `.env` variable |
| --- | --- |
| Audiobooks Folder | `AUDIOBOOKSDIR` |
| Books Folder | `BOOKSDIR` |
| Comics Folder | `COMICSDIR` |
| Downloads Folder | `DOWNLOADSDIR` |
| Games Folder | `GAMESDIR` |
| Immich Folder | `IMMICH_FOLDER` |
| Media Folder 1, 2, 3 | `MEDIADIR1`, `MEDIADIR2`, `MEDIADIR3` |
| Nextcloud Folder | `NEXTCLOUD_FOLDER` |
| Photos Folder | `PHOTOSDIR` |
| Podcasts Folder | `PODCASTSDIR` |

Change the path in **System** > **Folders**. Do not edit the `.env` file by hand or with **Tools** > **.env Editor** unless you know why.

:::caution
Changing a folder does not move any files. The files stay at the old path. Move them yourself, or point the folder at the place where they already are. To copy them to a new disk safely, see [Move your media or Docker data to another disk](/storage/move-data-to-another-disk/). For Immich and Nextcloud, a new path that does not hold the old uploads makes the app look empty.
:::

1. Back up your `.env` file. Replace `YOUR_DOCKER_FOLDER` with the path to your Docker folder:

   ```bash
   sudo cp YOUR_DOCKER_FOLDER/.env YOUR_DOCKER_FOLDER/.env.bak
   ```

2. In **System** > **Folders**, set the new path. Follow [Set a folder](#set-a-folder).
3. Recreate the apps that use the folder. Pick one of the two ways below.

### Recreate with Stack Manager

1. Go to **Tools** > **Stack Manager** > **Recreate**.
2. At "Select an app to recreate:", type the number of the app and press Enter. Type `all` to recreate every app.
3. Wait for "APP recreated".

Stack Manager needs a Basic, Plus or Pro license. See [Stack Manager](/using-deployrr/stack-manager/).

### Recreate with a Deployrr alias

With the [Deployrr bash aliases](/using-deployrr/bash-aliases/), recreate one app. Replace `APP` with the app's name, such as `sonarr`:

```bash
dcrec APP
```

To recreate all apps, run `dcrec` with no name.

Without the aliases, run this. Replace `DOCKER_FOLDER` with your Docker folder path, `HOSTNAME` with your server's hostname and `APP` with the app's name. Leave `APP` out to recreate all apps:

```bash
sudo docker compose --profile all -f DOCKER_FOLDER/docker-compose-HOSTNAME.yml up -d --force-recreate APP
```

### Apps you installed before you set a media folder

When you install an app, Deployrr adds the media folders you have set at that time. If you set a media folder after the app is installed, the app does not get it. This is true for all three, for example Media Folder 2 or 3, or Media Folder 1 if you only had Media Folder 2 set. Recreating the app does not add it, even though the **IMPORTANT!** note on the screen only mentions recreating.

To add it, [reinstall the app](/using-deployrr/reinstall-app/). Reinstalling keeps the app's data but replaces its compose file, so back up first as that page says.

If you only change the path of a media folder an app already uses, recreating is enough.

## Check it worked

1. Open **System** > **Folders**. The entry shows your new path.
2. Open the app and look for your files. For example, in Sonarr, open the root folder list and browse to `/data/media1`.
3. If the app still shows the old files, recreate it again.

## Common problems

If a media app shows an empty library, follow the checks in [Media app shows an empty library](/apps/media-library-empty/).

### The folder does not exist

Deployrr creates a folder you pick. If a path later goes missing, the app may start with an empty folder, or not start. For a folder on a NAS, check the mount first. Run `ls` on the path. Replace `YOUR_FOLDER` with your path:

```bash
ls YOUR_FOLDER
```

If it is empty and should not be, the mount is down. See [Mount a NAS share with Rclone](/storage/rclone-smb-setup/) or [Mount an SMB or NFS share without Rclone](/storage/smb-nfs-mounts/).

### The app cannot read or write the folder

This is general Linux guidance, not a Deployrr message. Deployrr makes your Linux user the owner of a folder it creates. A folder that already existed keeps its own owner. If an app says "permission denied", check who owns the folder:

```bash
ls -ld YOUR_FOLDER
```

Replace `YOUR_FOLDER` with your path. If a local folder is owned by `root`, make your user the owner. Replace `YOUR_USER` with your Linux username. Check the path twice before you run it:

```bash
sudo chown YOUR_USER:YOUR_USER YOUR_FOLDER
```

On a NAS mount, the NAS decides who can write. Check the share permissions on the NAS. To understand how SMB permission errors come about, read [UDMS part 07: Permission Denied Errors](https://www.simplehomelab.com/udms-07-mount-remote-shares-smb/#Permission_Denied_Errors) (manual setup).

To see how folder owners and permissions are set by hand, watch [Ultimate Docker Server: files, folders and permissions at 4:10](https://youtu.be/THuLgGwq0vg?t=250) (manual Docker Compose setup; the ACL steps start at 8:08 and use the Docker folder, but work the same on a media folder).

### The NAS was not ready when the server started

If apps start before the share mounts, they see an empty folder. With Rclone, use **Delay Media Apps**. Part 5 of [Mount a NAS share with Rclone](/storage/rclone-smb-setup/) shows how. For a share with a mount folder that is not empty, see [Rclone mount folder is not empty](/storage/rclone-mount-not-empty/).

### Requirements Not Met when you install an app

The box names the missing folder, for example "Downloads Folder - Must be set (System > Folders menu)". Set that folder, then start the install again. If you see "License - Basic, Plus, or Pro required", see [Licenses](/getting-started/licenses/).

### You want to clear a folder

The menu has no option to clear a folder. You can only pick a new path.

## Next steps

- Install the apps that use your folders from **Apps** > **Browse Apps**.
- To link your apps together, see [Connect your apps to each other](/using-deployrr/connecting-apps/).
