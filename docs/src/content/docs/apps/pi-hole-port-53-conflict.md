---
title: Pi-hole will not start because port 53 is already in use
description: Fix the "address already in use" error on port 53 when you install Pi-hole, by turning off the systemd-resolved stub listener on the host.
type: troubleshooting
tags:
  - ad-blocking
  - ports
  - docker
applies_to: v6.0+
apps: [pihole]
symptoms:
  - "Error response from daemon: driver failed programming external connectivity on endpoint pihole: failed to bind host port for 0.0.0.0:53:172.18.0.18:53/tcp: address already in use"
  - Pi-hole install fails and the pihole container does not start
  - Something else is already listening on port 53
related:
  - using-deployrr/bash-aliases
  - docker/no-internet-in-containers
  - networking/opnsense-conflict
  - getting-started/quick-start
last_reviewed: 2026-11-08
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

6. In Deployrr, go to **Tools** > **Stack Manager** > **Delete**.
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

   The status should say `Up`.

3. Open the Pi-hole web interface. The address is shown at the end of the install. It looks like `http://SERVER_IP:83/admin/` with the web port you chose.

If something other than `systemd-resolved` is on port 53, the `ports` and `showlistening` shortcuts on the [bash aliases page](/using-deployrr/bash-aliases/) can help you find it. Stop that program, or move it to another port, then repeat steps 6 to 11.

Pi-hole also uses port 67/udp for DHCP. If a DHCP server runs on the same machine, it can clash in the same way.

## Related

- [Bash aliases](/using-deployrr/bash-aliases/): the `ports` and `showlistening` shortcuts show which program holds a port.
- [Quick start](/getting-started/quick-start/): the Prerequisites steps, including Packages.
- [No internet on the server or in containers after setup](/docker/no-internet-in-containers/): when DNS breaks after the Debian Packages step.
- [Traefik staging fails on OPNsense](/networking/opnsense-conflict/): when your router's DNS filtering stops Traefik from getting a certificate.
