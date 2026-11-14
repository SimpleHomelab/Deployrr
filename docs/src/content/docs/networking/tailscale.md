---
title: Set up Tailscale to reach your apps from anywhere
sidebar:
  order: 3
  label: Set up Tailscale
description: Install Tailscale from Deployrr and open your apps from anywhere at TAILSCALE-IP:PORT, with no port forwarding and no domain name.
type: how-to
tags:
  - remote-access
  - app-networking
  - host
applies_to: v6.0+
apps: [tailscale]
related:
  - networking/ufw-firewall-vps
  - using-deployrr/connecting-apps
  - using-deployrr/restart-recreate-reinstall
  - apps/qbittorrent-vpn
  - getting-started/requirements-not-met
further_reading:
  - title: "UDMS part 16: reaching your homelab services through Tailscale"
    url: "https://www.simplehomelab.com/udms-part-16-tailscale-homelab-remote-access/#Accessing_Your_Homelab_Services_Through_Tailscale"
videos:
  - id: M6GMp4FJrB8
    start: 883
    title: "Tailscale tutorial: create an auth key and install Tailscale with Deployrr"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: M6GMp4FJrB8
    start: 1249
    title: "Tailscale tutorial: open your apps by Tailscale IP and port"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
last_reviewed: 2026-11-14
status: current
old_paths: []
sources: []
---

Tailscale links your server and your other devices into one private network. Once it runs, you open your apps from your phone or laptop at your server's Tailscale address. You do not forward any router ports and you do not need a domain name.

## What you get

- **No port forwarding.** Your router stays closed. Only devices signed in to your Tailscale account can reach the server.
- **No Traefik.** Tailscale does not use a domain name, a certificate or a Traefik login. You open apps at `http://TAILSCALE-IP:PORT`, with plain `http`.
- **Every app on the server.** Tailscale runs in host networking mode. Any app with a port on the server is reachable at the server's Tailscale address and that port. For example, the Deployrr Dashboard is on port `3050` by default.

To understand how Tailscale reaches homelab services, read [UDMS part 16: Accessing your homelab services through Tailscale](https://www.simplehomelab.com/udms-part-16-tailscale-homelab-remote-access/#Accessing_Your_Homelab_Services_Through_Tailscale) (manual setup, so its files and paths differ from Deployrr v6).

If you want real domain names and HTTPS, use Traefik instead. See [Simple vs Advanced mode](/reverse-proxy/simple-vs-advanced-mode/).

## Before you start

- You have finished Prerequisites. See the [Quick start](/getting-started/quick-start/).
- You have a Basic, Plus or Pro license. **System** > **Network** and the apps in **Browse Apps** both need one. See [Licenses](/getting-started/licenses/).
- You have a Tailscale account. Free personal accounts are available at `tailscale.com`.
- Your server has a `/dev/net/tun` device that your Linux user can read and write. Step 1 checks this.
- You have Tailscale installed and signed in on the device you will browse from, such as your phone or laptop.

## Steps

### 1. Set the network adapter

Tailscale does not install until Deployrr has checked your server for the network adapter. This step checks that `/dev/net/tun` exists and that your Linux user can read and write it.

1. Go to **System** > **Network**. In the **System Preparation** menu, the line reads **Network Adapter (for VPN)** followed by `/dev/net/tun` or `Not Set/Found`.
2. Read the **Network Adapter** box and select **OK**.
3. Look for this result. Only this line means it worked:

   ```txt
   Network adapter detection completed - VPN support enabled
   ```

You can run this step again at any time. If you see another result, see [If the adapter is not found](#if-the-adapter-is-not-found).

If you skip this step, the install shows the **Tailscale Mode** box first. Then it shows **Requirements Not Met (1)** with `Network Adapter - Must be configured (System menu)`.

### 2. Turn off MagicDNS in Tailscale

:::caution
Deployrr recommends turning off MagicDNS in the Tailscale admin console before you install. Its warning says that with MagicDNS on, the Docker host can lose its internet connection. A host without internet can be hard to fix, so do this first.
:::

1. Sign in to the Tailscale admin console at `login.tailscale.com`.
2. Open the **DNS** page.
3. Find the **MagicDNS** setting and turn it off.

The admin console changes now and then, so the labels may differ.

### 3. Create an auth key

An auth key lets the Tailscale container join your account without a browser login.

1. In the Tailscale admin console, usually under **Settings** and then **Keys**, choose to generate an auth key.
2. Pick the options you want. The labels may differ, but you usually see these:
   - **Reusable**: the same key can add more than one device. A one-off key stops working after one device joins.
   - **Expiration**: the key stops working after this time. A device that already joined usually does not need the key again.
3. Copy the key. The console usually shows it only once.

Treat the key like a password. Anyone who has it can add a device to your Tailscale account until it expires or you revoke it.

To see the key created, watch [Tailscale tutorial: create an auth key at 14:43](https://youtu.be/M6GMp4FJrB8?t=883). The video then installs Tailscale with Deployrr (shows Deployrr v5; menus differ in v6). The extra `tailscale up` step it shows also differs in v6.

### 4. Install Tailscale

1. Go to **Apps** > **Browse Apps**. It is one list in alphabetical order.
2. Select **Tailscale - Tailscale VPN client** and choose **Install**.
3. At the **Install Tailscale** box, which asks `Do you want to install this app?`, choose **Yes**.
4. Read the **Tailscale Mode** box and select **OK**. It says Tailscale installs in host networking mode, and you open apps at `TAILSCALE-IP:PORT`. It repeats the MagicDNS recommendation from step 2.
5. If you see **Requirements Not Met (1)**, go back to step 1.
6. In the **Tailscale - Configuration** box, type or paste your auth key and select **OK**. The box asks `Enter value for TS_AUTH_KEY:`. It starts empty and shows the key as you type.
7. Wait for the install to finish. Look for these lines in the terminal:

   ```txt
   Tailscale container started
   Waiting for Tailscale to initialize...
   Tailscale is running
   Tailscale installation complete!
   ```

Do not leave the key box empty. Deployrr does not stop you, but Tailscale can't join your account without a key. If you cancel the box, the install stops and you see `Tailscale installation failed`.

`Tailscale is running` only means the container is up. It does not prove the server joined your account. Confirm that in [Check it worked](#check-it-worked).

Deployrr saves the key in your `.env` file as `TS_AUTH_KEY`. Tailscale has no web page, no Traefik entry and no Dashboard entry.

If Tailscale is already installed, an **Already Installed** box appears. Reinstalling stops the container and keeps its data. The key box is empty again, so have your key ready before you start.

### 5. Find the server's Tailscale IP

Use either way.

- In the Tailscale admin console, open the **Machines** page. Your server is listed, usually with an address that starts with `100.`. The labels may differ.
- On the server, run this:

  ```bash
  sudo docker exec tailscale tailscale ip -4
  ```

  With the Deployrr bash aliases: `dexec tailscale tailscale ip -4`.

### 6. Open an app

1. On a device that is signed in to your Tailscale account, open this address. Replace `TAILSCALE-IP` with the address from step 5 and `PORT` with the app's port:

   ```txt
   http://TAILSCALE-IP:PORT
   ```

2. For the Deployrr Dashboard, use port `3050` unless you changed it.

To find an app's port, run `sudo docker ps` (or `dps`, which also lists stopped containers) and read the **Ports** column. It shows the host port before the colon, for example `0.0.0.0:8989->8989/tcp`.

## Check it worked

1. Check that the container is up:

   ```bash
   sudo docker ps
   ```

   With the Deployrr bash aliases: `dps`, which also lists stopped containers. The `tailscale` container must show `Up`.

2. Read its log. This prints the log and returns:

   ```bash
   sudo docker logs tailscale
   ```

   With the Deployrr bash aliases: `dlogs tailscale`. It shows the last 50 lines, then keeps following the log. Press Ctrl+C to stop.

3. Open the admin console page that lists your devices (usually **Machines**). Your server must be listed and show as connected. This is the check that proves it joined.
4. From another device on your Tailscale account, open `http://TAILSCALE-IP:3050` or another app's address.

## Tailscale and Traefik on the same server

Traefik needs **Prerequisites** > **Setup Mode** set to **Hybrid**. Tailscale works in Local or Hybrid mode, so you can run both on the same server. Each app then has two kinds of address, and they behave differently.

| Address | How it reaches the app | Opens over Tailscale |
| --- | --- | --- |
| `http://TAILSCALE-IP:PORT` | Straight to the app's port. Traefik is not involved. | Every app, whatever its Internal or External setting |
| `https://app.YOUR_DOMAIN` | Your domain points to your public IP (or to Cloudflare), so the request goes over the internet to Traefik, not through Tailscale. | Apps set to **External** or **Both**. Apps set to **Internal** don't open. |

Replace `app` and `YOUR_DOMAIN` with the app's subdomain and your domain. In Simple mode, every app is **Both**. See [Simple vs Advanced mode](/reverse-proxy/simple-vs-advanced-mode/).

:::caution
`TAILSCALE-IP:PORT` skips Traefik, so it also skips the login you picked for the app in Traefik, such as Authelia or TinyAuth. Anyone on your Tailscale account sees the app's own login screen, or none if the app has no login. Keep your Tailscale account to devices you trust.
:::

### Open Internal apps by domain over Tailscale

Traefik counts a request as Internal when it arrives on port 443 of your server. A request to the server's Tailscale IP on port 443 counts too. So an Internal app opens by domain over Tailscale when your device looks up `app.YOUR_DOMAIN` as the server's Tailscale IP.

Deployrr does not set this up. One way is Tailscale's split DNS: in the Tailscale admin console, on the **DNS** page, add a nameserver used only for your domain, such as Pi-hole on this server, reached at the server's Tailscale IP. That DNS server must answer `app.YOUR_DOMAIN` with the server's Tailscale IP, not its LAN IP. Each device you browse from must have **Use Tailscale DNS settings** turned on. The server itself ignores Tailscale DNS, so this only changes your other devices. If devices at home also use that Pi-hole, they get the Tailscale IP too, and only open the app while Tailscale runs on them. [Set up local DNS rewrites](/networking/local-dns-rewrites/) shows how to add the record. See Tailscale's [DNS documentation](https://tailscale.com/kb/1054/dns).

Once this works, apps set to **External** only don't open over Tailscale by domain, because the request now arrives on the Internal port. Set them to **Both** if you want them on both paths. If this is more setup than you need, use `http://TAILSCALE-IP:PORT` for Internal apps.

## Change the auth key later

The key is stored as `TS_AUTH_KEY` in the `.env` file in your Docker folder, inside single quotes. Keep the quotes when you change it.

1. Edit the value in one of two ways:
   - With a Pro license, go to **Tools** > **.env Editor** and pick `TS_AUTH_KEY`. The **Edit Environment Variable** box asks `Edit value for TS_AUTH_KEY:`. It shows the key in plain text.
   - Or open the `.env` file in your Docker folder in a text editor. Use `sudo` if you need it.
2. Go to **Tools** > **Stack Manager** > **Recreate** (Basic, Plus or Pro license).
3. At `Select an app to recreate:`, type the number for Tailscale. Look for `tailscale recreated`.

With the Deployrr bash aliases, run `dcrec tailscale` instead of step 2 and 3.

Recreate reads `.env` again. See [Restart, Recreate or Reinstall](/using-deployrr/restart-recreate-reinstall/).

Tailscale keeps its login in the `appdata/tailscale` folder in your Docker folder. In general, Tailscale uses an auth key when a device first joins, so a server that is already signed in may keep using its saved login. A new key matters most when the server has no saved login or you removed it from your Tailscale account.

## Reach a host-network app from another container

Tailscale and a few other apps, such as Netdata, run in host networking mode. They have no container name that other containers can use. From another container, connect to your server's local IP and the app's port. See [Connect your apps to each other](/using-deployrr/connecting-apps/).

## Troubleshooting

### If the adapter is not found

Deployrr only checks for `/dev/net/tun`. It does not create it. These results mean the step did not work:

| What you see | What it means |
| --- | --- |
| `No network adapter detected at /dev/net/tun` and `Network adapter detection completed - No adapter detected` | Your server has no `/dev/net/tun` device. |
| `Device is not readable or writable by YOUR_USER` and `Network adapter detection failed - Permission issue detected` | The device exists, but your Linux user can't read and write it. |

If your server is a Proxmox LXC container, the device must be passed from the Proxmox host into the container. You do that on the Proxmox host, not in Deployrr. After you change it, restart the container and run **System** > **Network** again. The steps are the same as for qBittorrent VPN. See [If the adapter is not found](/apps/qbittorrent-vpn/#if-the-adapter-is-not-found), and the Proxmox steps in [Run Deployrr in a Proxmox LXC container](/host/proxmox-lxc/#pass-devnettun-into-the-container).

### The server lost its internet connection

:::caution
If the server loses internet after you install Tailscale, MagicDNS is a likely cause, as Deployrr's warning says. Do the fix from another computer, because the server may have no internet to use.
:::

1. Sign in to the Tailscale admin console.
2. Open the **DNS** page and turn MagicDNS off.
3. Restart the Tailscale container, or restart the server.

### An app does not open at TAILSCALE-IP:PORT

1. Check that your device is signed in to the same Tailscale account as the server.
2. Check that you use `http`, not `https`.
3. Check the app's port with `sudo docker ps` (or `dps`).
4. Check that the app is running. If it is stopped, start it from **Apps** > **Manage Apps**.
5. If you use a firewall on the server, allow the Tailscale interface. With UFW and Tailscale's usual interface name, this is `sudo ufw allow in on tailscale0`. See [Fix the UFW firewall on a VPS](/networking/ufw-firewall-vps/).

### The server does not show in the admin console

1. Read the log with `sudo docker logs tailscale` (or `dlogs tailscale`).
2. If the key is expired, revoked or already used (a one-off key), create a new one.
3. Follow [Change the auth key later](#change-the-auth-key-later).
