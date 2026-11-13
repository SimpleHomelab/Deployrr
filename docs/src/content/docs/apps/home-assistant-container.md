---
title: Run Home Assistant as a container with custom.yml
sidebar:
  label: Home Assistant container
description: Add the official Home Assistant container to custom.yml with host networking, a config folder in appdata and an optional USB stick, then put it behind Traefik.
type: how-to
tags:
  - compose
  - app-networking
  - traefik
applies_to: v6.0+
related:
  - apps/home-assistant-behind-traefik
  - using-deployrr/custom-yml
  - using-deployrr/backups
  - docker/port-already-in-use
  - getting-started/move-from-v5
further_reading:
  - title: "Home Assistant: install Home Assistant Container with Docker Compose"
    url: https://www.home-assistant.io/installation/linux/#docker-compose
  - title: "Home Assistant HTTP integration: reverse proxies and trusted proxies"
    url: https://www.home-assistant.io/integrations/http/
  - title: "UDMS part 18: adding non-Docker or external apps behind Traefik"
    url: https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Adding_non-Docker_or_External_Apps_Behind_Traefik
  - title: "UDMS part 13: updating services with Docker Compose"
    url: https://www.simplehomelab.com/udms-13-docker-and-docker-compose-commands/#Updating_Services
videos:
  - id: 6S9PwhAlZUs
    start: 543
    title: "Traefik guide: external HTTP apps behind Traefik with a file provider"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
last_reviewed: 2026-11-12
status: current
old_paths: []
sources:
  - { type: discord, ref: "https://discord.com/channels/974306760171073556/1380094049729380462" }
---

Home Assistant is not in the Deployrr v6 apps menu. Install it the way Home Assistant's own guide recommends, for example Home Assistant OS in a VM or on another machine. The container install has no apps (add-ons) and no Supervisor. If you still want the container, add it yourself with [custom.yml](/using-deployrr/custom-yml/).

## Before you start

- Deployrr is installed and you set up your Docker folder in **Prerequisites**.
- `custom.yml` is turned on. If it is not, follow [Add your own containers with custom.yml](/using-deployrr/custom-yml/) steps 1 to 5.
- Nothing else on the server uses port `8123`. If something does, see [Port already in use](/docker/port-already-in-use/).
- Optional: the [Bash aliases](/using-deployrr/bash-aliases/), used on this page.

## Steps

1. Go to your Docker folder and open `custom.yml`.

   ```bash
   cdd
   nano compose/$HOSTNAME/custom.yml
   ```

2. Remove the `#` from `# services:` if it is still there, then add this service under it:

   ```yaml
   services:
     homeassistant:
       image: ghcr.io/home-assistant/home-assistant:stable
       container_name: homeassistant
       network_mode: host
       restart: unless-stopped
       stop_grace_period: 60s
       environment:
         - TZ=$TZ
       volumes:
         - $DOCKERDIR/appdata/homeassistant:/config
         - /etc/localtime:/etc/localtime:ro
         - /run/dbus:/run/dbus:ro
   ```

   `$DOCKERDIR` and `$TZ` are filled in from the `.env` file in your Docker folder. Don't replace them. `/run/dbus` is only needed for Bluetooth. `stop_grace_period` gives Home Assistant time to shut down cleanly.

   Keep the indentation. If you already have other services in the file, add only the `homeassistant:` block under `services:`.

3. Save the file.

4. Start Home Assistant.

   ```bash
   dcup homeassistant
   ```

5. Follow the logs until the startup messages stop.

   ```bash
   dclogs homeassistant
   ```

   Press `Ctrl+C` to stop following.

6. Open `http://SERVER_IP:8123` in your browser. Replace `SERVER_IP` with your server's local IP address. Create the owner account.

### Why host networking

`network_mode: host` lets Home Assistant find devices on your network and use mDNS and HomeKit. With it, the container shares the server's network, so you must not add `ports:` or Docker `networks:`. Home Assistant listens on port `8123` of the server itself.

The cost is that other containers can't reach it by name. Use the server's IP address instead.

If UFW or firewalld runs on the server, port `8123` must be allowed from your home network and from Traefik. With host networking, the firewall applies to Home Assistant like to any program on the server. See [Firewall rules](#firewall-rules) below.

### Add a Zigbee or Z-Wave USB stick (optional)

1. Plug the stick into the server.
2. List the stable device names.

   ```bash
   ls -l /dev/serial/by-id/
   ```

3. Add a `devices:` list to the service. Replace the path with the one from step 2.

   ```yaml
       devices:
         - /dev/serial/by-id/YOUR_STICK_NAME:/dev/serial/by-id/YOUR_STICK_NAME
   ```

4. Run `dcup homeassistant` again.

Use the `by-id` path, not `/dev/ttyUSB0`. The `ttyUSB0` number can change after a reboot.

:::caution
Home Assistant's own Compose example adds `privileged: true`. It gives the container access to every device on the server. Leave it out unless something does not work without it.
:::

If Deployrr runs in a Proxmox LXC, the stick must reach the LXC first, or the path won't exist. See [Pass a USB stick into the container](/host/proxmox-lxc/#pass-a-usb-stick-into-the-container).

## Put it behind Traefik

Traefikify needs a Plus or Pro license, with Socket Proxy and Traefik Production set up and Traefik running.

Follow [Home Assistant behind Traefik](/apps/home-assistant-behind-traefik/). Two parts are different for the container:

- In **Traefikify**, enter your server's local IP address as the host IP, `http` as the protocol and `8123` as the port. Traefik can't use the container name, because the container has no Docker network. To see the same idea done by hand for an app that is not in Docker's network, watch [Traefik guide: external HTTP apps behind Traefik at 9:03](https://youtu.be/6S9PwhAlZUs?t=543) (manual Docker Compose setup; Deployrr does this for you).
- When you trust the proxy in Home Assistant, use the address Home Assistant sees. Open the logs with `dclogs homeassistant` and find the line `A request from a reverse proxy was received from`. Trust the address after `from`. In a standard Deployrr setup Traefik has the fixed address `192.168.90.254` on its proxy network, so that is the address you will often see. If you see another address, trust that one, and check the log again if the error comes back after Traefik is recreated.

:::caution
You can trust the two whole Traefik networks, `192.168.90.0/24` and `192.168.91.0/24`, if nothing else works. Do this only as a last resort: then any container on those networks can make its requests look like they come from another visitor.
:::

In Home Assistant 2026.8 and later, set this in **Settings** > **System** > **Network**, in the **HTTP server** section: turn on **Trust X-Forwarded-For** and add the address or network under **Trusted proxies**. Saving restarts Home Assistant. Confirm the new settings when asked, or Home Assistant goes back to the old ones after 5 minutes.

Older versions use an `http:` block in `appdata/homeassistant/configuration.yaml` in the Docker folder. Edit it with `sudo`, then run `dcrestart homeassistant`:

```yaml
http:
  use_x_forwarded_for: true
  trusted_proxies:
    - 192.168.90.254
```

Replace `192.168.90.254` with the address from the log if it is different. When you update to 2026.8 or later, Home Assistant moves this block into the UI by itself and then ignores it.

### Firewall rules

If UFW or firewalld is on, allow port `8123` from your home network and from Traefik. Deployrr's own firewall rule only allows the Socket Proxy network, `192.168.91.0/24`. Requests from Traefik's `192.168.90.254` address are not covered. With UFW:

```bash
sudo ufw allow from 192.168.1.0/24 to any port 8123 proto tcp
sudo ufw allow from 192.168.90.254 to any port 8123 proto tcp
```

Replace `192.168.1.0/24` with your home network. Use the address from the Home Assistant log in the second line if it is different. If apps on a VPS lose internet or show certificate errors with UFW on, see [Fix the UFW firewall on a VPS](/networking/ufw-firewall-vps/).

## Update Home Assistant

1. Back up first, so you can go back if an update causes problems (see below).
2. Pull the new image.

   ```bash
   dcpull homeassistant
   ```

3. Recreate the container.

   ```bash
   dcup homeassistant
   ```

**Stack Manager** doesn't list `custom.yml` services. **Up** includes them, but **Update Stack** doesn't pull their images, so use `dcpull`. For background on pulling and recreating a Compose service, read [UDMS part 13: updating services](https://www.simplehomelab.com/udms-13-docker-and-docker-compose-commands/#Updating_Services) (manual setup; it uses other file paths).

## Back up

The config folder is `appdata/homeassistant` inside your Docker folder. **Tools** > **Backups** > **Backup** (Pro license) saves the whole Docker folder, so it includes Home Assistant. It stops all running containers while it works and then asks whether to restart the stack. See [Back up and restore your Docker folder](/using-deployrr/backups/). Home Assistant also has its own backup feature for its data.

## Move from a v5 Home Assistant

If you ran Home Assistant as a v5 app, v5 kept its data in `appdata/home-assistant` (with a hyphen). v5 installed the Core version, so your settings are in that folder.

1. Follow [Move from v5 to v6](/getting-started/move-from-v5/), where you rename your v5 folder to `docker-v5` and set up v6. Then turn on `custom.yml`.
2. Add the service from this page, but do not start it yet.
3. Copy the old folder to the new name. The `-a` option keeps owners and permissions.

   ```bash
   sudo cp -a /home/USERNAME/docker-v5/appdata/home-assistant /home/USERNAME/docker/appdata/homeassistant
   ```

   Replace `USERNAME` with your Linux user name, and change the path if your Docker folder is elsewhere.

4. Run `dcup homeassistant`.
5. If you use Traefik, check the trusted proxies as shown above. v5 added an `http:` block for you, and its address may differ from what v6 needs.

## Check it worked

1. `dps` lists `homeassistant` with a status of `Up`.
2. `http://SERVER_IP:8123` shows the Home Assistant login or onboarding page.
3. If you use Traefik, `https://homeassistant.YOUR_DOMAIN` shows the same page. Replace `YOUR_DOMAIN` with your domain.

## Related

- [Home Assistant behind Traefik](/apps/home-assistant-behind-traefik/): the full Traefikify steps and the 400 error.
- [Add your own containers with custom.yml](/using-deployrr/custom-yml/): turn on custom.yml and apply changes.
- [Back up and restore your Docker folder](/using-deployrr/backups/): what a backup covers.
