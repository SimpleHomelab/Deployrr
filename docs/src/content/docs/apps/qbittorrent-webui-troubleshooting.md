---
title: qBittorrent web UI says Unauthorized or won't open
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
further_reading:
  - title: "qBittorrent, Gluetun VPN, and DeUnhealth: The Perfect Trio (video playlist)"
    url: https://youtube.com/playlist?list=PL1Hno7tIbSWWZXw1jEsYWPRK-gHqITZds
last_reviewed: 2026-11-08
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

Deployrr sets the login to this when it installs qBittorrent or qBittorrent VPN:

- Username: `admin`
- Password: `adminadmin`

If you changed the password and it no longer works, go to step 5.

:::caution
Anyone on your network who knows the default can log in with it. Change the password in **Tools** > **Options** > **WebUI** as soon as you are in.
:::

### 3. Clear an IP ban

qBittorrent blocks your IP address for a while after several wrong logins. Restarting the container clears the block.

1. Run this for qBittorrent. For qBittorrent VPN, use `qbittorrent-vpn` instead:

   ```bash
   sudo docker restart qbittorrent
   ```

2. Open the web page again and log in.

### 4. Check that the container runs (qBittorrent VPN)

qBittorrent VPN has no port of its own. You reach it through Gluetun, so both containers must run.

1. List the containers:

   ```bash
   sudo docker ps
   ```

2. Check that `gluetun` and `qbittorrent-vpn` both show as `Up`. If `gluetun` keeps restarting, read its log:

   ```bash
   sudo docker logs gluetun
   ```

   Gluetun must be set up with your VPN provider and connected. If its log shows it can't connect, fix the VPN settings first. qBittorrent VPN can't work without it.

3. Open the Gluetun file in the `compose/HOSTNAME` folder inside your Docker folder. `HOSTNAME` is your server's hostname. The file is `gluetun.yml`.
4. Find the `ports` section. It must have this line without a `#` in front:

   ```yaml
   ports:
     - $QBITTORRENTVPN_PORT:8080
   ```

   In a fresh Gluetun install, both lines start with `#`. Installing qBittorrent VPN removes the `#`.
5. If the line is missing or has a `#` in front, install qBittorrent VPN again: **Apps** > **Browse Apps** > **qBittorrent VPN** > **Install**. At the **Already Installed** prompt, choose **Yes**. The install adds the line back, restarts Gluetun and starts qBittorrent VPN again.

   :::caution
   Installing qBittorrent VPN again replaces its config file, even though the prompt says data is preserved. The login goes back to `admin` and `adminadmin`, and your qBittorrent settings are reset. Any changes you made to the compose files by hand are also lost.
   :::

6. If you restart or recreate Gluetun yourself later, restart qBittorrent VPN after it:

   ```bash
   sudo docker restart qbittorrent-vpn
   ```

:::note
`$QBITTORRENTVPN_PORT` is a variable name. Leave it as it is in the file. It takes the number from your `.env` file.
:::

### 5. Reset the password

1. Stop the container. Use `qbittorrent-vpn` instead for qBittorrent VPN:

   ```bash
   sudo docker stop qbittorrent
   ```

2. Open the qBittorrent config file. It is in your Docker folder, under `appdata/qbittorrent/qBittorrent/qBittorrent.conf`. For qBittorrent VPN, the folder is `appdata/qbittorrent-vpn/qBittorrent/qBittorrent.conf`.
3. Find the line that starts with `WebUI\Password_PBKDF2` and delete it.
4. Save the file.
5. Start the container:

   ```bash
   sudo docker start qbittorrent
   ```

6. Read the container log and find the temporary password. Current qBittorrent versions (4.6.1 and later) print one when no password is set:

   ```bash
   sudo docker logs qbittorrent
   ```

7. Log in with your username (`admin` unless you changed it) and the temporary password.
8. In qBittorrent, open **Tools**, then **Options**, then **WebUI**. Set a new password and save. The temporary password only works until the container restarts.

### 6. Check the host header settings

Deployrr turns host header validation off for you. If you changed the config file, check that the `[Preferences]` section still has these lines:

```ini
WebUI\Address=*
WebUI\ServerDomains=*
WebUI\HostHeaderValidation=false
```

If you change the file, stop the container first and start it again after you save. qBittorrent can overwrite your edits while it runs.

### 7. Check the apps that connect to qBittorrent

If the web page works but Sonarr or Radarr can't connect, the host and port are probably wrong. Apps connect with a container name and the internal port, not the port you use in your browser. See [Connect your apps to each other](/using-deployrr/connecting-apps/).

## Check it worked

- The qBittorrent login page opens at `http://YOUR_SERVER_IP:PORT`.
- You log in and see the torrent list.
- For qBittorrent VPN, both `gluetun` and `qbittorrent-vpn` show as `Up` in `sudo docker ps`.

If it still fails, read the qBittorrent log and look for the last error lines. You can also run `dlogs qbittorrent` from [Bash aliases](/using-deployrr/bash-aliases/). It follows the log live; press Ctrl+C to stop.

```bash
sudo docker logs qbittorrent
```

## Related

- [Connect your apps to each other](/using-deployrr/connecting-apps/): the host and port Sonarr and Radarr need, including `gluetun:8080`.
- [Bash aliases](/using-deployrr/bash-aliases/): shortcuts for logs and container lists.
