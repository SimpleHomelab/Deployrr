---
title: qBittorrent web UI says Unauthorized or won't open
sidebar:
  label: qBittorrent web UI won't open
description: Fix the qBittorrent web UI when it shows Unauthorized, rejects admin/adminadmin or won't load, for qBittorrent and qBittorrent VPN.
type: troubleshooting
tags:
  - media
  - app-networking
  - ports
  - traefik
applies_to: v6.0+
apps: [qbittorrent, qbittorrent-vpn, gluetun]
symptoms:
  - Unauthorized
  - qBittorrent login page says the username or password is wrong, even with admin and adminadmin
  - Your IP address has been banned after too many failed authentication attempts
  - This site can't be reached or connection refused on the qBittorrent port
  - qBittorrent VPN web page doesn't open, but the container is running
  - Sonarr or Radarr can't connect to qBittorrent
related:
  - using-deployrr/connecting-apps
  - using-deployrr/bash-aliases
  - reverse-proxy/check-traefik-logs
  - docker/no-internet-in-containers
  - apps/theme-park-configuration
videos:
  - id: Wt8hS0msLxw
    start: 508
    title: "qBittorrent Docker Compose guide: fixing the Unauthorized error"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
  - id: arew_OGQYyw
    start: 803
    title: "Gluetun guide: putting qBittorrent behind the VPN kill switch"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
further_reading:
  - title: "qBittorrent, Gluetun VPN, and DeUnhealth: The Perfect Trio (video playlist)"
    url: https://youtube.com/playlist?list=PL1Hno7tIbSWWZXw1jEsYWPRK-gHqITZds
last_reviewed: 2026-11-13
status: current
old_paths: ["/apps/qbittorrent-webui-troubleshooting"]
sources:
  - { type: discord, ref: "https://discord.com/channels/974306760171073556/1334338303914147943" }
---

## Symptoms

- The browser shows `Unauthorized` instead of the qBittorrent page.
- The login page rejects your username and password.
- The page doesn't load at all.
- For qBittorrent VPN, the container is running but the web page is empty or times out.

```txt
Unauthorized
```

## Cause

Most of the time it is one of these:

- You use the wrong address or port.
- You changed the password and forgot it, or the default login no longer works.
- qBittorrent blocked your IP address after several wrong logins.
- For qBittorrent VPN, the web page port is no longer set up in Gluetun, or Gluetun isn't running or can't connect to your VPN provider.

## Fix

Work through the steps in order. Stop when the web UI opens.

### 1. Use the right address

1. Find your server's local IP address. Use it instead of `localhost` in the browser.
2. Find the port. Open your `.env` file in your Docker folder and look for the port variable:
   - qBittorrent: `QBITTORRENT_PORT`. The default is `8081`.
   - qBittorrent VPN: `QBITTORRENTVPN_PORT`. The default is `8082`.
3. Open this address. Replace `YOUR_SERVER_IP` with your server's IP address and `PORT` with the number from step 2:

   ```txt
   http://YOUR_SERVER_IP:PORT
   ```

4. Use `http`, not `https`.

qBittorrent VPN can't be put behind Traefik, so always open it this way. Plain qBittorrent can also have a Traefik address if you set one up.

### 2. Try the default login

Deployrr sets the login to this when it installs qBittorrent:

- Username: `admin`
- Password: `adminadmin`

qBittorrent VPN starts with the username `admin` and a temporary password that qBittorrent prints in its log. Read it as in step 5, items 6 to 8. You don't need to stop the container or edit the config file first. It prints a new one every time it starts until you set your own.

If you changed the password and it no longer works, go to step 5.

:::caution
Anyone on your network who knows the default can log in with it. Change the password in **Tools** > **Options** > **WebUI** as soon as you are in.
:::

### 3. Clear an IP ban

qBittorrent blocks your IP address for a while after several wrong logins. Restarting the container clears the block.

1. Run this for qBittorrent. For qBittorrent VPN, use `qbittorrent-vpn` instead, here and in the commands below:

   ```bash
   sudo docker restart qbittorrent
   ```

   With the [Deployrr bash aliases](/using-deployrr/bash-aliases/): `dcrestart qbittorrent`.

2. Open the web page again and log in.

### 4. Check that the container runs (qBittorrent VPN)

qBittorrent VPN has no port of its own. You reach it through Gluetun, so both containers must run.

1. List the containers:

   ```bash
   sudo docker ps
   ```

   With the aliases: `dps`.

2. Check that `gluetun` and `qbittorrent-vpn` both show as `Up`. If `gluetun` keeps restarting, read its log:

   ```bash
   sudo docker logs gluetun
   ```

   With the aliases: `dlogs gluetun`. It follows the log live; press Ctrl+C to stop.

   Gluetun must be set up with your VPN provider and connected. If its log shows it can't connect, fix the VPN settings first. qBittorrent VPN can't work without it. For the full install order and the VPN details Gluetun asks for, see [Install qBittorrent VPN](/apps/qbittorrent-vpn/).

3. Open the Gluetun file in the `compose/HOSTNAME` folder inside your Docker folder. `HOSTNAME` is your server's hostname. The file is `gluetun.yml`.
4. Find the `ports` section. It must have this line without a `#` in front:

   ```yaml
   ports:
     - $QBITTORRENTVPN_PORT:8080
   ```

   In a fresh Gluetun install, both lines start with `#`. Installing qBittorrent VPN removes the `#`.

   To see why the web UI port is set on the Gluetun container, watch [Gluetun guide: putting qBittorrent behind the VPN kill switch at 13:23](https://youtu.be/arew_OGQYyw?t=803). It is a manual Docker Compose setup; Deployrr does this for you. Skip its Traefik labels part: Deployrr doesn't put qBittorrent VPN behind Traefik.

5. If the line is missing or has a `#` in front, install qBittorrent VPN again: **Apps** > **Browse Apps** > **qBittorrent VPN** > **Install**. At the **Already Installed** prompt, choose **Yes**. The install adds the line back, restarts Gluetun and starts qBittorrent VPN again.

   :::caution
   Installing qBittorrent VPN again resets its config file. The login goes back to `admin` with a temporary password from the log, and your qBittorrent settings are reset. Any changes you made to the compose files by hand are also lost.
   :::

6. If you restart Gluetun yourself later, restart qBittorrent VPN after it:

   ```bash
   sudo docker restart qbittorrent-vpn
   ```

   With the aliases: `dcrestart qbittorrent-vpn`. If you recreate or reinstall Gluetun, recreate qBittorrent VPN instead (`dcrec qbittorrent-vpn`). See [If Gluetun doesn't connect](/apps/qbittorrent-vpn/#if-gluetun-doesnt-connect).

:::note
`$QBITTORRENTVPN_PORT` is a variable name. Leave it as it is in the file. It takes the number from your `.env` file.
:::

### 5. Reset the password

1. Stop the container. Use `qbittorrent-vpn` instead for qBittorrent VPN:

   ```bash
   sudo docker stop qbittorrent
   ```

   With the aliases: `dstop qbittorrent`.

2. Open the qBittorrent config file. It is in your Docker folder, under `appdata/qbittorrent/qBittorrent/qBittorrent.conf`. For qBittorrent VPN, the folder is `appdata/qbittorrent-vpn/qBittorrent/qBittorrent.conf`.
3. Find the line that starts with `WebUI\Password_PBKDF2` and delete it.
4. Save the file.
5. Start the container:

   ```bash
   sudo docker start qbittorrent
   ```

   With the aliases: `dcstart qbittorrent`.

6. Read the container log and find the temporary password. Current qBittorrent versions (4.6.1 and later) print one when no password is set:

   ```bash
   sudo docker logs qbittorrent 2>&1 | grep -i password
   ```

   Use the last line it prints. The `dlogs qbittorrent` alias shows only the last 50 lines, so the password line may already be gone from it.

7. Log in with your username (`admin` unless you changed it) and the temporary password.
8. In qBittorrent, open **Tools**, then **Options**, then **WebUI**. Set a new password and save. The temporary password only works until the container restarts.

If the log shows no temporary password, or you still can't log in, [reset qBittorrent to the default login and settings](#reset-to-the-default-login-and-settings).

### 6. Check the host header settings

For qBittorrent, Deployrr turns host header validation off for you. If you changed the config file, check that the `[Preferences]` section still has these lines:

```ini
WebUI\Address=*
WebUI\ServerDomains=*
WebUI\HostHeaderValidation=false
```

qBittorrent VPN starts with only the first two lines. That is enough, because `ServerDomains=*` accepts any address you open it with.

If you change the file, stop the container first and start it again after you save. qBittorrent can overwrite your edits while it runs.

To see the same fix done by hand, watch [qBittorrent Docker Compose guide: fixing the Unauthorized error at 8:28](https://youtu.be/Wt8hS0msLxw?t=508). It is a manual Docker Compose setup; Deployrr does this for you.

### 7. Check the apps that connect to qBittorrent

If the web page works but Sonarr or Radarr can't connect, the host and port are probably wrong. Apps connect with a container name and the internal port, not the port you use in your browser. See [Connect your apps to each other](/using-deployrr/connecting-apps/).

## Reset to the default login and settings

Use this when the password reset in step 5 doesn't get you in, or when a setting you changed in **Options** stops the web UI from opening, such as the web UI port, HTTPS or the address it listens on. Installing the app again resets its config file. The steps are the same for qBittorrent and qBittorrent VPN, but the result differs a little.

What the reinstall changes:

- qBittorrent: `qBittorrent.conf` is replaced with Deployrr's copy. The login goes back to `admin` and `adminadmin`, host header validation is off, and the download folders are the ones under `/data/downloads/torrents/`.
- qBittorrent VPN: `qBittorrent.conf` is deleted, and the container starts with the image's own default settings. The login is `admin` with a temporary password from the log, and the download folder is `/downloads/`. Change it to a folder under `/data/downloads/torrents/` (step 5 below).
- Everything else you set in **Options** goes back to qBittorrent's default.
- Only that one file changes. The other files in the app's appdata folder stay.
- The container is recreated with the latest image, and the app's compose file is replaced. Changes you made to it by hand are lost.

Steps:

1. Back up the config file so you can see your old settings later. Replace `YOUR_USER` with your Linux username and `docker` with your Docker folder if it is somewhere else. For qBittorrent VPN, use `appdata/qbittorrent-vpn` in the path:

   ```bash
   sudo cp /home/YOUR_USER/docker/appdata/qbittorrent/qBittorrent/qBittorrent.conf ~/qBittorrent.conf.bak
   ```

2. Go to **Apps** > **Browse Apps** > **qBittorrent** (or **qBittorrent VPN**) > **Install**. At the **Already Installed** prompt, choose **Yes**. You can also use **Reinstall** in **Manage Apps** when the app is stopped. See [Reinstall an app and keep its data](/using-deployrr/reinstall-app/).
3. For qBittorrent VPN, check that both `gluetun` and `qbittorrent-vpn` show as `Up` in `sudo docker ps -a`. If `qbittorrent-vpn` isn't running, start it as in step 4, item 5 of [Install qBittorrent VPN](/apps/qbittorrent-vpn/#4-install-qbittorrent-vpn).
4. Log in with `admin` and `adminadmin`. For qBittorrent VPN, use `admin` and the temporary password from `sudo docker logs qbittorrent-vpn 2>&1 | grep -i password`. Set a new password right away in **Tools** > **Options** > **WebUI**.
5. For qBittorrent VPN, open **Tools** > **Options** > **Downloads**. Set **Default Save Path** to `/data/downloads/torrents/others/`. If you use an incomplete folder, set it to `/data/downloads/torrents/incomplete/`. Files saved under `/downloads/` stay inside the container and don't reach your Downloads Folder. See [Sonarr, Radarr or Lidarr don't import finished downloads](/apps/arr-downloads-not-importing/).
6. Put the new password in every app that connects to qBittorrent, such as Sonarr and Radarr. Their download client settings hold the qBittorrent username and password.
7. To see which settings you had changed, compare the backup with the new file:

   ```bash
   sudo diff ~/qBittorrent.conf.bak /home/YOUR_USER/docker/appdata/qbittorrent/qBittorrent/qBittorrent.conf
   ```

   For qBittorrent VPN, use `appdata/qbittorrent-vpn` in the path. Set the settings you want again in **Options**. Don't copy back the line that broke the web UI.

## Check it worked

- The qBittorrent login page opens at `http://YOUR_SERVER_IP:PORT`.
- You log in and see the torrent list.
- For qBittorrent VPN, both `gluetun` and `qbittorrent-vpn` show as `Up` in `sudo docker ps` (or `dps`).

If it still fails, read the qBittorrent log and look for the last error lines. You can also run `dlogs qbittorrent` from [Bash aliases](/using-deployrr/bash-aliases/). It follows the log live; press Ctrl+C to stop.

```bash
sudo docker logs qbittorrent
```
