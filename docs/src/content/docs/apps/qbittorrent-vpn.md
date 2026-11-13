---
title: Install qBittorrent VPN (qBittorrent behind Gluetun)
description: Set the VPN network adapter, install Gluetun and qBittorrent VPN, then check that your torrent traffic really leaves through your VPN.
type: how-to
tags:
  - media
  - app-networking
  - host
applies_to: v6.0+
apps: [qbittorrent-vpn, gluetun, deunhealth]
related:
  - apps/qbittorrent-webui-troubleshooting
  - using-deployrr/connecting-apps
  - getting-started/requirements-not-met
  - storage/folders
  - docker/container-keeps-restarting
further_reading:
  - title: "UDMS part 10: pass the TUN network device into a Proxmox LXC"
    url: https://www.simplehomelab.com/udms-10-proxmox-lxc-network-device-passthrough/
videos:
  - id: arew_OGQYyw
    start: 772
    title: "Gluetun VPN kill switch guide: start Gluetun and check the VPN public IP"
    note: Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens.
  - id: arew_OGQYyw
    start: 1699
    title: "Gluetun VPN kill switch guide: connect Radarr to qBittorrent with the gluetun host and port 8080"
    note: Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens.
  - id: r0nGMFs5pCY
    start: 132
    title: "Proxmox LXC network device passthrough: add /dev/net/tun to the container"
last_reviewed: 2026-11-13
status: current
old_paths: []
sources: []
---

qBittorrent VPN is qBittorrent that runs behind Gluetun, a VPN client. All of its traffic goes through your VPN. This page takes you from a fresh server to a working install, and shows you how to prove the traffic uses the VPN.

## Before you start

- You have finished Prerequisites. See the [Quick start](/getting-started/quick-start/).
- You have a Basic, Plus or Pro license. See [Licenses](/getting-started/licenses/).
- You have a VPN account that gives you a WireGuard or OpenVPN setup. You need the provider name. For WireGuard, you also need the private key and the address. For OpenVPN, you need the username and password.
- Your server has a `/dev/net/tun` device. Step 1 checks this.

## Steps

### 1. Set the network adapter

Gluetun can't be installed until Deployrr has checked your server for the VPN network adapter. Tailscale, ZeroTier and Cloudflare Tunnel need this step too.

1. Go to **System** > **Network**.
2. Read the **Network Adapter** box and select **OK**. It says the adapter is needed for VPN apps, such as torrent clients, and is normally at `/dev/net/tun`.
3. Watch the result. A good result looks like this:

   ```txt
   Network adapter device found at /dev/net/tun
   Device is readable and writable by YOUR_USER
   Network adapter detection completed - VPN support enabled
   ```

4. Go back to the **System Preparation** menu. The line now reads **Network Adapter (for VPN) - /dev/net/tun**.

If the menu line still reads **Not Set/Found**, see [If the adapter is not found](#if-the-adapter-is-not-found).

### 2. Install the apps qBittorrent VPN needs

qBittorrent VPN won't install unless Gluetun and DeUnhealth are running. [DeUnhealth](/apps/deunhealth/) restarts a container when it turns unhealthy. It needs Socket Proxy to be running first.

1. Go to **Docker** > **Socket Proxy** and install it if it isn't running. See [Socket Proxy](/docker/socket-proxy/).
2. Go to **Apps** > **Browse Apps**, select **DeUnhealth** and choose **Install**. It asks no questions.
3. Select **Gluetun** and choose **Install**.
4. At each prompt, enter the value from your VPN provider:

   | Prompt | What to enter |
   | --- | --- |
   | `Enter value for GLUETUN_VPN_SERVICE_PROVIDER:` | Your provider's name exactly as Gluetun expects it, for example `surfshark`, `nordvpn` or `mullvad`. Deployrr doesn't check it. |
   | `Enter value for GLUETUN_VPN_TYPE:` | `wireguard` (the default) or `openvpn`, in lowercase. Any other value, such as `WireGuard`, gives `Unknown VPN type` and Deployrr asks for no VPN details. |

5. Next you see one **Docker Environment Variables** box after another. For `wireguard` they ask for the **Private Key** and the **Wireguard Addresses** from your provider's configuration. The address usually looks like `XX.XX.XX.XX/XX`. For `openvpn` they ask for the **OpenVPN Username** and **OpenVPN Password**. What you type is shown on screen, so make sure nobody is watching. Don't cancel these boxes: Deployrr goes on anyway, and Gluetun can't connect without the values.
6. Wait up to 60 seconds. Deployrr waits for Gluetun to connect to the VPN. Look for this:

   ```txt
   VPN connected successfully!
   Public IP: ...
   ```

   Note the public IP. You use it later.

If you see `Timed out after 60s. Could not verify VPN connection.`, Gluetun did not connect. Read its log:

```bash
sudo docker logs gluetun
```

With the [Deployrr bash aliases](/using-deployrr/bash-aliases/): `dlogs gluetun`. It keeps following the log; press Ctrl+C to stop.

:::caution
After a time-out, Gluetun counts as installed. The qBittorrent VPN install in step 4 then goes ahead even though the VPN isn't connected. Fix your VPN details and get `VPN connected successfully!` before you go on. See [If Gluetun doesn't connect](#if-gluetun-doesnt-connect).
:::

At the end, Deployrr tells you that you can route other containers through Gluetun by adding `network_mode: service:gluetun` to their compose configuration. You don't need that for qBittorrent VPN. Its install does it for you.

### 3. Set your Downloads Folder

qBittorrent VPN saves its files in your Downloads Folder. If it isn't set, the install shows `Downloads Folder - Must be set (System > Folders menu)`. Set it in **System** > **Folders**. See [Set your media, downloads and other folders](/storage/folders/).

The install creates a `torrents` folder inside your Downloads Folder. It has the subfolders `movies`, `tv`, `others` and `indexes`.

### 4. Install qBittorrent VPN

1. Go to **Apps** > **Browse Apps**.
2. Select **qBittorrent VPN** and choose **Install**.
3. Read the **qBittorrent VPN Setup** box. It says Gluetun must be running and connected to your VPN, and that you reach the web page through Gluetun's port. Select **OK**. Deployrr checks the requirements after this box.
4. At **Port Configuration**, enter the port for the web page. The default is `8082`. Deployrr suggests the first free port from there. If the port is taken, see [Port is already in use](/docker/port-already-in-use/).
5. Wait for the four steps to finish: configuring the Gluetun port, stopping qBittorrent VPN, restarting Gluetun and starting qBittorrent VPN. The last step can show an error and leave qBittorrent VPN stopped, so check it after every install: run `sudo docker ps -a` (or `dps`). If `qbittorrent-vpn` isn't listed as `Up`, recreate it: **Tools** > **Stack Manager** > **Recreate** and pick `qbittorrent-vpn`, or `dcrec qbittorrent-vpn` with the aliases.
6. Read the **qBittorrent VPN - Installation Notes** box at the end. It has two notes. One is about the login; log in as in step 5 below. The other tells you how to connect Arr apps.

If you see `Required app not running` with `gluetun must be installed and running first` or `deunhealth must be installed and running first`, go back to step 2. Deployrr only checks that the container is running, not that the VPN is connected. Installing DeUnhealth without Socket Proxy shows `socket-proxy must be installed and running first`. See also [Requirements Not Met](/getting-started/requirements-not-met/).

### 5. Open qBittorrent and change the login

1. Open this address. Replace `YOUR_SERVER_IP` with your server's local IP address and `PORT` with the port you chose in step 4:

   ```txt
   http://YOUR_SERVER_IP:PORT
   ```

2. Log in with the username `admin` and the temporary password qBittorrent prints in its log. Find it with this command. It is on the line that mentions a temporary password:

   ```bash
   sudo docker logs qbittorrent-vpn
   ```

   With the aliases: `dlogs qbittorrent-vpn`. Press Ctrl+C to stop following the log. qBittorrent prints a new temporary password every time it starts until you set your own.

3. In qBittorrent, go to **Tools** > **Options** > **WebUI** and set a new password.
4. Go to **Tools** > **Options** > **Downloads**. qBittorrent VPN starts with `/downloads/` as its **Default Save Path**. Change it to `/data/downloads/torrents/others/`, and the incomplete folder, if you use one, to `/data/downloads/torrents/incomplete/`. Only paths under `/data/downloads` reach your Downloads Folder and the Arr apps. Select **Save**.

:::caution
Set your own password right away. Until you do, the password changes every time the container starts.
:::

qBittorrent VPN is not behind Traefik. You can't give it a subdomain or a login from Traefik. Always use the address above. If the page doesn't open, see [qBittorrent web UI says Unauthorized or won't open](/apps/qbittorrent-webui-troubleshooting/).

### 6. Connect your Arr apps

In Sonarr, Radarr and other apps, add qBittorrent as a download client with these values:

- **Host**: `gluetun`
- **Port**: `8080`

:::caution
Apps in other containers connect on port `8080`. The port you chose (`8082` by default) is for your browser.
:::

The host is `gluetun` because qBittorrent VPN shares Gluetun's network. It has no network or container address of its own. See [Connect your apps to each other](/using-deployrr/connecting-apps/).

To see the same idea in a manual setup, watch [Gluetun VPN kill switch guide: connect Radarr to qBittorrent at 28:19](https://youtu.be/arew_OGQYyw?t=1699) (manual Docker Compose setup; it also puts qBittorrent behind Traefik, which Deployrr v6 does not).

## Check it worked

Check that qBittorrent VPN uses your VPN address, not your home address.

1. Find your home IP address. Run this on the server (install `curl` first if it's missing):

   ```bash
   curl -s https://ifconfig.me
   ```

2. Find the IP address that qBittorrent VPN sees. Run this command inside its container:

   ```bash
   sudo docker exec qbittorrent-vpn curl -s https://ifconfig.me
   ```

   With the Deployrr bash aliases: `dexec qbittorrent-vpn curl -s https://ifconfig.me`.

3. Compare the two addresses. They must be different.
4. Compare the second address with the `Public IP` Gluetun showed at install. You can also find it in the Gluetun log, in the line `Public IP address is`. They should match.

If both commands print the same address, qBittorrent VPN is not using the VPN. Stop torrenting and check Gluetun with `sudo docker logs gluetun` (or `dlogs gluetun`).

You can also run `sudo docker ps` (or `dps`). Both `gluetun` and `qbittorrent-vpn` must show as `Up`.

## If Gluetun doesn't connect

Gluetun connects only when the provider name and your key, address, username or password match what your VPN provider gave you. Read its log first to see what failed:

```bash
sudo docker logs gluetun
```

Then fix the values in one of two ways. Editing `.env` keeps everything else as it is. Reinstalling Gluetun asks every question again, but undoes part of the qBittorrent VPN install.

Deployrr saves your answers in the `.env` file in your Docker folder:

| `.env` line | What it holds |
| --- | --- |
| `GLUETUN_VPN_SERVICE_PROVIDER` | Your provider's name, such as `mullvad` |
| `GLUETUN_VPN_TYPE` | `wireguard` or `openvpn` |
| `GLUETUN_WIREGUARD_PRIVATE_KEY` | WireGuard private key |
| `GLUETUN_WIREGUARD_ADDRESSES` | WireGuard address |
| `GLUETUN_OPENVPN_USERNAME` | OpenVPN username |
| `GLUETUN_OPENVPN_PASSWORD` | OpenVPN password |

### Fix the values in .env

Use this when the provider name or a key, address or password was wrong. Your qBittorrent VPN setup stays as it is.

1. Back up `.env`. Replace `YOUR_DOCKER_FOLDER` with your Docker folder path:

   ```bash
   sudo cp YOUR_DOCKER_FOLDER/.env YOUR_DOCKER_FOLDER/.env.bak
   ```

2. Open `.env` with **Tools** > **.env Editor** (Pro), or by hand:

   ```bash
   sudo nano YOUR_DOCKER_FOLDER/.env
   ```

3. Correct the lines from the table. Keep each value in single quotes, as Deployrr writes them, for example `GLUETUN_WIREGUARD_PRIVATE_KEY='YOUR_KEY'`. If a line is missing (for example because you cancelled a box during the install), add it. See [Edit .env values and secrets](/using-deployrr/edit-env-and-secrets/).
4. Recreate Gluetun: **Tools** > **Stack Manager** > **Recreate** and pick `gluetun`. With the aliases: `dcrec gluetun`.
5. Check that it connected. This prints a line when it did:

   ```bash
   sudo docker logs gluetun 2>&1 | grep "Public IP address is"
   ```

6. Recreate qBittorrent VPN the same way (`dcrec qbittorrent-vpn`). It uses Gluetun's network, so it must be built again after Gluetun is. Recreate keeps its settings and your login.

Don't switch `GLUETUN_VPN_TYPE` between `wireguard` and `openvpn` here. Gluetun's compose file only has the lines for the type you chose at install switched on. To change the type, reinstall Gluetun.

### Reinstall Gluetun

Use this to change the VPN type or to start over.

1. Go to **Apps** > **Browse Apps**, select **Gluetun** and choose **Install**. At the **Already Installed** prompt, choose **Yes**.
2. Answer every prompt again, as in [step 2](#2-install-the-apps-qbittorrent-vpn-needs). The provider box starts empty and the type box starts at `wireguard`, so type your own values. The key, address, username and password boxes may show your old values. Replace them if they were wrong.
3. Wait for `VPN connected successfully!`.

The reinstall replaces Gluetun's compose file with a fresh one, and removes the old Gluetun container. qBittorrent VPN's web page port is switched off again, and qBittorrent VPN loses its network. Fix both:

1. Back up and open the Gluetun file. `HOSTNAME` is your server's hostname:

   ```bash
   sudo cp YOUR_DOCKER_FOLDER/compose/HOSTNAME/gluetun.yml YOUR_DOCKER_FOLDER/compose/HOSTNAME/gluetun.yml.bak
   sudo nano YOUR_DOCKER_FOLDER/compose/HOSTNAME/gluetun.yml
   ```

2. Remove the `#` and the space after it in front of these two lines. Leave the other `#` lines alone:

   ```yaml
   ports:
     - $QBITTORRENTVPN_PORT:8080
   ```

3. Recreate `gluetun`, then `qbittorrent-vpn`, as in steps 4 to 6 above.

Installing qBittorrent VPN again also does all of this, but it resets your qBittorrent login and settings. See [qBittorrent web UI says Unauthorized or won't open](/apps/qbittorrent-webui-troubleshooting/#4-check-that-the-container-runs-qbittorrent-vpn).

## If the adapter is not found

Deployrr only checks for the device. It doesn't create it. These are the two results that stop you:

| What you see | What it means |
| --- | --- |
| `No network adapter detected at /dev/net/tun` and `Network adapter detection completed - No adapter detected` | Your server has no `/dev/net/tun` device. The menu line stays **Not Set/Found**. |
| `Device is not readable or writable by YOUR_USER` and `Network adapter detection failed - Permission issue detected` | The device exists, but your Linux user can't read and write it. |

Until the adapter is set, installing Gluetun shows `Network Adapter - Must be configured (System menu)` in a **Requirements Not Met** box.

Deployrr gives no steps for this. If your server is a Proxmox LXC container, the device usually has to be passed from the Proxmox host into the container. You set that on the Proxmox host, not in Deployrr. After you change it, restart the container and run **System** > **Network** again. Deployrr saves the result, so the menu line only changes when you run it again. The Proxmox steps are in [Run Deployrr in a Proxmox LXC container](/host/proxmox-lxc/#pass-devnettun-into-the-container).

To see how the device is passed into an LXC, watch [Proxmox LXC network device passthrough at 2:12](https://youtu.be/r0nGMFs5pCY?t=132). The steps are also in [UDMS part 10: pass the TUN network device into a Proxmox LXC](https://www.simplehomelab.com/udms-10-proxmox-lxc-network-device-passthrough/) (manual setup).

## Related

- [qBittorrent web UI says Unauthorized or won't open](/apps/qbittorrent-webui-troubleshooting/): the web page won't load, the login fails or Gluetun can't connect.
- [Connect your apps to each other](/using-deployrr/connecting-apps/): the host and port for every app, including `gluetun:8080`.
- [Requirements Not Met](/getting-started/requirements-not-met/): every line of the requirements box and the menu that clears it.
- [Reinstall an app and keep its data](/using-deployrr/reinstall-app/): what a reinstall of qBittorrent VPN resets.
- [Install and manage apps from the Apps menu](/using-deployrr/manage-apps/): start, stop, restart and read logs.
