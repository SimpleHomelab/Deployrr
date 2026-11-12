---
title: Sonarr, Radarr or Lidarr don't import finished downloads
sidebar:
  label: Arr downloads not importing
description: Fix finished downloads that stay in the Sonarr, Radarr or Lidarr queue by checking client paths, remote path mappings, folder owner and mounts, in order.
type: troubleshooting
tags:
  - media
  - app-networking
  - host
applies_to: v6.0+
apps:
  - sonarr
  - radarr
  - lidarr
symptoms:
  - Import failed, path does not exist or is not accessible by Sonarr
  - Sonarr or Radarr download is finished but stuck in Activity > Queue
  - Download client places downloads in a folder that does not appear to exist inside the container
  - Remote Path Mappings warning in Sonarr or Radarr
  - Radarr or Lidarr will not import completed downloads from qBittorrent, SABnzbd, NZBGet or Transmission
  - Arr import fails with permission denied
related:
  - apps/media-library-empty
  - using-deployrr/folders
  - using-deployrr/connecting-apps
  - apps/qbittorrent-vpn
  - apps/qbittorrent-webui-troubleshooting
further_reading:
  - title: "UDMS part 14: Connecting the apps by container name"
    url: https://www.simplehomelab.com/udms-14-docker-media-server/#Connecting_the_Apps
videos:
  - id: Wt8hS0msLxw
    start: 719
    title: "qBittorrent Docker Compose: set the download path to /data/downloads"
    note: Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens.
  - id: arew_OGQYyw
    start: 1652
    title: "Gluetun guide: add qBittorrent behind Gluetun as a download client in Radarr"
    note: Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens.
last_reviewed: 2026-11-12
status: current
old_paths: []
sources: []
---

## Symptoms

Your download client finishes a download, but Sonarr, Radarr or Lidarr never moves it into your library. You see one of these:

- In **Activity** > **Queue**, the item stays there with a warning, or shows an import failed message.
- In **System** > **Status**, a health warning says the download client places downloads in a folder that does not appear to exist inside the container. It points you to Remote Path Mappings.

The text differs a little between apps and versions. It looks like this:

```txt
Import failed, path does not exist or is not accessible by Sonarr
```

## Cause

The download client and the Arr app each run in their own container. The Arr app asks the client where a finished file is. Then it looks for that file at the same path inside its own container. If it can't see the path, or can't read the file, the import fails.

In v6, these apps see the Downloads Folder from **System** > **Folders** at `/data/downloads`: Sonarr, Radarr, Lidarr, Mylar3, Prowlarr, Jackett, qBittorrent, qBittorrent VPN, SABnzbd, NZBGet, Plex, Jellyfin and Emby. Because the path is the same everywhere, most setups need no path mapping.

An import fails when one of these is true:

- The client saves files somewhere outside `/data/downloads`.
- You use Transmission, which sees only part of the folder at `/data/downloads`.
- The Arr app is not connected to the client, or uses the wrong category.
- The root folder in the Arr app is not under `/data/media1`, `/data/media2` or `/data/media3`.
- A file in the downloads folder belongs to another user.
- The downloads folder is on a NAS and the mount is down.

Work through the checks in order. Stop when imports work.

## Fix

### 1. Read the path in the message

1. In Sonarr, Radarr or Lidarr, go to **Activity** > **Queue**.
2. Hover over the warning icon on the stuck item, or open the item, to read the full message.
3. Note the path it names.

If the path starts with `/data/downloads`, go to check 4 or check 6. If it starts with anything else, such as `/downloads`, go to check 2.

If you use Transmission, go to check 2 first, then check 3.

### 2. Keep the client's folders under /data/downloads

A path outside `/data/downloads` exists only inside the client's container. The Arr app can't see it. The files are also lost when that container is recreated.

**qBittorrent and qBittorrent VPN**

1. Open the qBittorrent web UI.
2. Go to **Tools** > **Options** > **Downloads**.
3. Check that **Default Save Path** starts with `/data/downloads`. The settings Deployrr installs use `/data/downloads/torrents/others/`.
4. Check that the incomplete folder, if you use one, starts with `/data/downloads`. The settings Deployrr installs use `/data/downloads/torrents/incomplete/`.
5. Check the save path of each category you use. Every one must start with `/data/downloads`.
6. Select **Save**.

You can make a category per Arr app, such as `tv-sonarr` and `radarr`, with save paths under `/data/downloads/torrents/`. Deployrr creates `movies`, `tv` and `others` folders there for you, so `/data/downloads/torrents/tv/` and `/data/downloads/torrents/movies/` work well. Settings you change in the client apply at once. You don't need to restart anything.

If you can't open the web UI, see [qBittorrent web UI says Unauthorized or won't open](/apps/qbittorrent-webui-troubleshooting/).

To see why the default `/downloads` path is wrong, watch [qBittorrent Docker Compose: set the download path to /data/downloads at 11:59](https://youtu.be/Wt8hS0msLxw?t=719) (manual Docker Compose setup).

**SABnzbd, NZBGet and Transmission**

Deployrr does not set their download folders. Check them yourself.

1. Open the client's settings and find the folders for completed and incomplete downloads.
2. Set both to a path under `/data/downloads`, such as `/data/downloads/usenet/complete` for SABnzbd or NZBGet, or `/data/downloads/others` for Transmission. For Transmission, Deployrr creates `movies`, `tv` and `others` folders that it sees at `/data/downloads`.
3. Save.

### 3. Add a remote path mapping for Transmission

Transmission sees only the `torrents` folder inside your Downloads Folder, at `/data/downloads`. The Arr apps see the whole Downloads Folder at `/data/downloads`. So a file Transmission saves at `/data/downloads/tv/x` sits at `/data/downloads/torrents/tv/x` for the Arr app.

This mapping only works once Transmission saves under `/data/downloads` (check 2).

1. In the Arr app, go to **Settings** > **Download Clients**.
2. Scroll to **Remote Path Mappings** and add one.
3. Set **Host** to the host name you used in the Transmission download client entry. With the default setup, that is `transmission`.
4. Set **Remote Path** to `/data/downloads/`.
5. Set **Local Path** to `/data/downloads/torrents/`.
6. Save.

:::caution
Do not add remote path mappings for qBittorrent, qBittorrent VPN, SABnzbd or NZBGet. Their paths already match. A mapping for them points the Arr app at the wrong folder.
:::

### 4. Check the download client entry in the Arr app

1. In the Arr app, go to **Settings** > **Download Clients**.
2. Open your client's entry.
3. Check that **Host** is the container name and the port is the internal port, as in the table.

   | Client | Host | Port |
   | --- | --- | --- |
   | qBittorrent | `qbittorrent` | `8080` |
   | SABnzbd | `sabnzbd` | `8080` |
   | NZBGet | `nzbget` | `6789` |
   | Transmission | `transmission` | `9091` |
   | qBittorrent VPN | `gluetun` | `8080` |

4. Check that the **Category** matches a category in the client, if the client uses categories.
5. Select **Test**. It should show a green check.
6. Save.

For the steps and the reasons behind these values, see [Connect your apps to each other](/using-deployrr/connecting-apps/). For the VPN setup, see [Install qBittorrent VPN](/apps/qbittorrent-vpn/).

To see the `gluetun` host and port 8080 entered in Radarr, watch [Gluetun guide: add qBittorrent behind Gluetun as a download client in Radarr at 27:32](https://youtu.be/arew_OGQYyw?t=1652) (manual Docker Compose setup). For background on why container names work as hosts, read [UDMS part 14: Connecting the apps by container name](https://www.simplehomelab.com/udms-14-docker-media-server/#Connecting_the_Apps) (manual setup).

### 5. Check the root folder

The Arr app moves the finished file into a root folder. That folder must be under `/data/media1`, `/data/media2` or `/data/media3`.

1. In Sonarr or Radarr, go to **Settings** > **Media Management**.
2. Check that each root folder starts with `/data/media1`, `/data/media2` or `/data/media3`.
3. If you can't pick a folder under `/data`, the app has no media folder. Go to [Media app shows an empty library](/apps/media-library-empty/#2-check-that-the-app-has-the-folder). It explains how to add a folder with a reinstall.

### 6. Check who owns the files

All these apps run as the same Linux user. A file created by `root` or another user can block the import.

1. List the downloads folder with numeric owners. Replace `YOUR_DOWNLOADS_FOLDER` with the path next to **Downloads Folder** in **System** > **Folders**:

   ```bash
   ls -ln YOUR_DOWNLOADS_FOLDER
   ```

2. Compare the owner numbers with your own. To see your user and group numbers, run:

   ```bash
   id
   ```

3. If files or folders belong to another number, check the path again. Make sure it is your downloads folder and not `/` or your Docker folder.
4. Make your user the owner of that folder and what it holds. Replace `YOUR_USER` with your Linux username and `YOUR_DOWNLOADS_FOLDER` with your path. The command assumes your main group has the same name as your user, which is the default on most systems:

   ```bash
   sudo chown -R YOUR_USER:YOUR_USER YOUR_DOWNLOADS_FOLDER
   ```

   :::caution
   `-R` changes every file inside the path. A wrong path changes the wrong files. Never run it on `/` or on your Docker folder.
   :::

For more on folder owners, see [The app cannot read or write the folder](/using-deployrr/folders/#the-app-cannot-read-or-write-the-folder).

### 7. Check the mount

If your downloads folder is on a NAS, the share may be down. The folder then looks empty, or is a plain local folder.

1. List the folder on the server. Replace `YOUR_DOWNLOADS_FOLDER` with your path:

   ```bash
   ls YOUR_DOWNLOADS_FOLDER
   ```

2. If the list is empty and should not be, mount the share again. See [Mount a NAS share with Rclone](/host/rclone-smb-setup/) or [Mount an SMB or NFS share without Rclone](/host/smb-nfs-mounts/).

If you edit a compose file or `.env` file to change a path, recreate the app afterwards. See [Stack Manager](/using-deployrr/stack-manager/).

## Downloads use double the space

Downloads and media are separate folders inside each container. So the Arr apps can't hardlink a finished file. They copy it into your media folder. The file then takes space twice while the torrent keeps seeding.

Remove the torrent once it has seeded enough. Or open the download client entry in the Arr app and turn on **Remove Completed**, so the app removes the torrent after import.

## Check it worked

1. In the Arr app, go to **Activity** > **Queue**. Choose the stuck item and import it again if needed.
2. The item leaves the queue.
3. The file shows in your library under `/data/media1`, `/data/media2` or `/data/media3`.
4. In **System** > **Status**, the Remote Path Mappings warning is gone.

## Related

- [Media app shows an empty library](/apps/media-library-empty/): check that the Arr app has your media folders.
- [Set your media, downloads and other folders](/using-deployrr/folders/): how the Downloads Folder is set and used.
- [Connect your apps to each other](/using-deployrr/connecting-apps/): host names and ports for download clients.
- [Install qBittorrent VPN](/apps/qbittorrent-vpn/): connect the Arr apps to a client behind Gluetun.
- [qBittorrent web UI says Unauthorized or won't open](/apps/qbittorrent-webui-troubleshooting/): get back into the client to check its paths.
