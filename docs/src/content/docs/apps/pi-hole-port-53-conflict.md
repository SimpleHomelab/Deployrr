---
title: Pi-hole will not start because port 53 is already in use
sidebar:
  label: "Pi-hole: port 53 already in use"
description: Fix "address already in use" on port 53 or 67 when you install Pi-hole, why its DHCP server doesn't work here, and its web address at home and via Traefik.
type: troubleshooting
tags:
  - ports
  - host
  - docker
  - dns
applies_to: v6.0+
apps: [pihole]
symptoms:
  - "Error response from daemon: driver failed programming external connectivity on endpoint pihole: failed to bind host port for 0.0.0.0:53:172.18.0.18:53/tcp: address already in use"
  - Pi-hole install fails and the pihole container does not start
  - Something else is already listening on port 53
  - "failed to bind host port for 0.0.0.0:67 ... address already in use"
related:
  - docker/port-already-in-use
  - using-deployrr/bash-aliases
  - docker/no-internet-in-containers
  - networking/opnsense-conflict
  - getting-started/quick-start
last_reviewed: 2026-11-13
status: current
old_paths: ["/apps/pi-hole-port-53-conflict"]
sources:
  - { type: discord, ref: "https://discord.com/channels/974306760171073556/1346884572138438667/1347161142794911825" }
---

## Symptoms

You install Pi-hole from Deployrr and the container does not start. Docker reports that port 53 is taken:

```txt
Error response from daemon: driver failed programming external connectivity on endpoint pihole: failed to bind host port for 0.0.0.0:53:172.18.0.18:53/tcp: address already in use
```

The wording can differ a little between Docker versions. The part to look for is port 53 and "address already in use" or "port is already allocated".

## Cause

Pi-hole needs port 53 on your server for DNS. The Pi-hole compose file in `compose/HOSTNAME/pihole.yml` maps port 53 for both TCP and UDP:

```yaml
ports:
  - "53:53/tcp"
  - "53:53/udp"
```

On many Ubuntu and Debian systems, `systemd-resolved` already listens on port 53. Only one program can use a port at a time, so Docker cannot give it to Pi-hole.

Deployrr checks the Pi-hole web interface port (83 by default) and suggests the next free one if it is taken. It does not check port 53, so you only find out when Docker fails to start the container.

## Fix

:::caution
This change affects DNS on the server itself. While you work through the steps, the server may not be able to look up names. If you manage the server over SSH, use its IP address, not a hostname.
:::

1. Open the systemd-resolved settings file:

   ```bash
   sudo nano /etc/systemd/resolved.conf
   ```

2. Under the `[Resolve]` heading, add or change this line:

   ```ini
   DNSStubListener=no
   ```

   If the line starts with `#`, remove the `#`.

3. Save the file and close the editor.

4. Restart the service:

   ```bash
   sudo systemctl restart systemd-resolved
   ```

5. Check that the server can still look up names:

   ```bash
   ping -c 2 example.com
   ```

   If this fails with a name resolution error, point `/etc/resolv.conf` at the file that lists your real DNS servers, then try again:

   ```bash
   sudo ln -sf /run/systemd/resolve/resolv.conf /etc/resolv.conf
   ```

6. In Deployrr, go to **Tools** > **Stack Manager** > **Delete**. [Stack Manager](/using-deployrr/stack-manager/#delete) explains each Delete choice.
7. Pick **Full**.
8. Answer the live backup question. Press `Y` to make one, or any other key to skip.
9. At `Enter the number of the service to delete:`, type the number next to `pihole`.
10. Press `Y` to confirm.
11. Install Pi-hole again: **Apps** > **Browse Apps** > **Pi-hole**.

:::note
A **Full** delete removes Pi-hole's data and settings, including its saved port and password. You set them again during the new install. A **Safe** delete keeps Pi-hole's data folder, so your blocklists and settings stay, but you still enter the port and password again.
:::

:::note
On Debian, **Prerequisites** > **Packages** rewrites `/etc/systemd/resolved.conf` in its `Configuring DNS resolver for Debian...` step. It saves your old file as `/etc/systemd/resolved.conf.bak` and sets Cloudflare and Google as DNS servers. The new file has no `DNSStubListener=no` line. If you run that step again, add the line back and restart systemd-resolved. Deployrr does not change this file on Ubuntu.
:::

## Check it worked

1. Check what is listening on port 53:

   ```bash
   sudo ss -lntup | grep ':53 '
   ```

   You should see Docker (`docker-proxy`) or Pi-hole, not `systemd-resolve`.

2. Check that the container is running:

   ```bash
   sudo docker ps --filter name=pihole
   ```

   With the [Deployrr bash aliases](/using-deployrr/bash-aliases/): `dps`. It lists all containers, so look for the `pihole` line.

   The status should say `Up`.

3. Open the Pi-hole web interface. The address is shown at the end of the install. It looks like `http://SERVER_IP:83/admin/` with the web port you chose.

If something other than `systemd-resolved` is on port 53, the `ports` and `showlistening` shortcuts on the [bash aliases page](/using-deployrr/bash-aliases/) can help you find it. Stop that program, or move it to another port (see [Port already in use](/docker/port-already-in-use/) if it is one of your apps), then repeat steps 6 to 11.

## Port 67 already in use

Pi-hole's compose file also maps port 67/udp, the DHCP port, even if you never turn on Pi-hole's DHCP server. If a DHCP server already runs on the host, Docker fails with the same "address already in use" error, but for port 67.

1. Find the program that holds port 67:

   ```bash
   sudo ss -lnup | grep ':67 '
   ```

   Common ones are `dnsmasq`, `dhcpd` (isc-dhcp-server) and `kea-dhcp4`.

2. If your network doesn't need that DHCP server (your router hands out addresses), stop it and turn it off.

   :::caution
   If this DHCP server hands out the addresses on your network, don't turn it off. Devices can't get an address while it is off. Use the compose file steps below instead.
   :::

   For example, for isc-dhcp-server:

   ```bash
   sudo systemctl disable --now isc-dhcp-server
   ```

3. Install Pi-hole again as in steps 6 to 11 above.

If you need to keep that DHCP server, take port 67 out of Pi-hole's compose file instead:

1. In your Docker folder, back up the file:

   ```bash
   cp compose/HOSTNAME/pihole.yml compose/HOSTNAME/pihole.yml.bak
   ```

2. Open `compose/HOSTNAME/pihole.yml` and put a `#` in front of the `- "67:67/udp"` line.
3. Go to **Tools** > **Stack Manager** > **Recreate** and pick `pihole`.

When you reinstall Pi-hole, Deployrr copies a fresh compose file, so you make this change again.

## Use Pi-hole for DHCP

Most setups don't need this. Keep your router as the DHCP server and set the DNS server in its DHCP settings to your server's LAN IP. [Local DNS rewrites](/networking/local-dns-rewrites/#point-your-devices-at-the-dns-server) shows how.

Deployrr runs Pi-hole on a Docker network, not on your server's own network. DHCP requests from your devices are broadcasts, and they don't reach a container on a Docker network. So Pi-hole's DHCP server does not hand out addresses in this setup, even though port 67 is mapped. Pi-hole's own documentation lists what it needs instead: the `NET_ADMIN` capability (commented out in the compose file) and host networking or a DHCP relay. Deployrr doesn't set this up for you.

## Open the Pi-hole web interface

| From | Address |
|---|---|
| Your home network | `http://SERVER_LAN_IP:PORT/admin/`, with the web port you chose (`83` by default) |
| Through Traefik | `https://pihole.YOUR_DOMAIN/admin/`, or the subdomain you entered at **Traefik Subdomain** (asked at install when Traefik runs) |

Keep `/admin/` at the end. Pi-hole serves its web interface under that path. If the page doesn't load through Traefik, see [App shows 404 or 502](/reverse-proxy/app-404-or-502/).
