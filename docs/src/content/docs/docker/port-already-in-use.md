---
title: "Port already in use: find what uses it and pick another port"
sidebar:
  order: 5
  label: Port already in use
description: Fix the Port In Use box and Docker's "address already in use" error by finding what holds the port, then picking another port for your app.
type: troubleshooting
tags:
  - ports
  - docker
  - app-networking
applies_to: v6.0+
symptoms:
  - "Port In Use"
  - "WARNING! Port N is already in use. Using suggested port: N"
  - "Invalid Port"
  - "Port must be a number between 1 and 65535. Using suggested port"
  - "Error response from daemon: driver failed programming external connectivity on endpoint: Bind for 0.0.0.0:PORT failed: port is already allocated"
  - "failed to bind host port: address already in use"
  - "Port Conflict - Cannot Install"
  - "Port 80 is occupied. This is needed for Traefik."
  - An app container will not start after install and another app uses the same port
related:
  - apps/pi-hole-port-53-conflict
  - using-deployrr/second-app-instances
  - using-deployrr/stack-manager
  - using-deployrr/connecting-apps
  - reverse-proxy/nginx-proxy-manager
last_reviewed: 2026-11-13
status: current
old_paths: ["/apps/port-already-in-use"]
sources: []
further_reading:
  - title: "UDMS part 14: Connecting the Apps and Docker networking"
    url: "https://www.simplehomelab.com/udms-14-docker-media-server/#Connecting_the_Apps"
videos:
  - id: THuLgGwq0vg
    start: 1218
    title: "Ultimate Docker Server with Docker Compose: check that a port is free"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
  - id: THuLgGwq0vg
    start: 1589
    title: "Ultimate Docker Server with Docker Compose: host port and container port"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
---

Two apps can't use the same port on one server. This page covers the boxes Deployrr shows when you pick a port, the errors Docker shows when a port is taken, and how to move an app to a free port.

## Symptoms

You see one of these.

**During an install, in Deployrr.** A **Port Configuration** box asks for a port:

```txt
Enter the port for Sonarr (Web interface port):
Suggested: 8990 (first available from 8989)
```

Most apps show a short description after the app name, as in this example. The number in the box is already filled in. It is the first free port, counting up from the app's default port.

If you type a port that is taken, you see a **Port In Use** box:

```txt
WARNING!

Port 8989 is already in use.

Using suggested port: 8990
```

If you type something that is not a number, or a number outside the allowed range, you see an **Invalid Port** box:

```txt
ERROR!

Port must be a number between 1 and 65535.

Using suggested port: 8990
```

Nearly every app accepts ports from 1 to 65535. The Deployrr Dashboard and CrowdSec accept 1024 to 65535, and the box shows that range instead.

**After an install, from Docker.** The app container does not start. This is Docker's message, not Deployrr's. The wording changes between Docker versions:

```txt
Bind for 0.0.0.0:8989 failed: port is already allocated
```

```txt
failed to bind host port for 0.0.0.0:8989: address already in use
```

For port 53 and Pi-hole, see [Pi-hole will not start because port 53 is already in use](/apps/pi-hole-port-53-conflict/).

## Cause

A port number can belong to only one program on the server at a time. The port is taken when:

- Another app that Deployrr installed uses it.
- A program outside Docker on the same server listens on it.
- A container you added yourself maps it, for example in [custom.yml](/using-deployrr/custom-yml/).

Deployrr warns you if the port you pick is already used by another app or program it can see. It can't catch every case. For example, it doesn't warn about port 53 for Pi-hole, because Pi-hole never asks you for that port. See [Ports Deployrr never asks about](#ports-deployrr-never-asks-about). If Docker fails to start the container after the install, use the steps below to find what holds the port.

When you reinstall an app, the suggested port may be one higher than the port it uses now. Typing the old port in the box doesn't help: Deployrr shows **Port In Use** and uses the suggested port. To keep the old port, accept the suggestion, then change the port back with [Fix B](#fix-b-change-the-port-of-an-installed-app).

## Find what uses a port

These commands are general Linux and Docker advice. They are not part of Deployrr. Run them on your Docker host. To see the same check done before a container starts, watch [Ultimate Docker Server: check that a port is free at 20:18](https://youtu.be/THuLgGwq0vg?t=1218) (manual Docker Compose setup).

1. List what listens on the port. Replace `PORT` with the number, for example `8989`. This is a value you fill in.

   ```bash
   sudo ss -tulpn | grep ':PORT '
   ```

   If a line prints, the port is taken. The last column names the program. Docker ports show as `docker-proxy`.

2. If the answer is `docker-proxy`, list the containers and their ports to find which one it is:

   ```bash
   sudo docker ps --format 'table {{.Names}}\t{{.Ports}}'
   ```

   Find the line with your port on the left of an arrow, like `0.0.0.0:8989->8989/tcp`.

3. If no line prints in step 1, a stopped app may still have this port saved in your `.env` file. Search for it:

   ```bash
   sudo grep "_PORT=" ~/docker/.env
   ```

   This assumes your Docker folder is `~/docker`. If yours is elsewhere, use its path. Each line looks like `SONARR_PORT='8989'`, or `SONARR_PORT=8989` if you edited it in the .env Editor. The left part is the app, the right part is its port.

4. If you still find nothing, a stopped app may use the port as a fixed port. Those are not in `.env`. Check the list in [Ports Deployrr never asks about](#ports-deployrr-never-asks-about).

### With the Bash aliases

If you set up the [Bash aliases](/using-deployrr/bash-aliases/), two of them list ports:

- `ports` lists every port and connection with the program that holds it. Narrow it down with `ports | grep ':PORT '`. Without `sudo`, the program column shows `-` for programs that run as root, which includes Docker. Run `sudo netstat -tulanp | grep ':PORT '` to see those names.
- `showlistening` lists the programs that wait for connections. It also only shows your own programs unless you run `sudo lsof -i -n | grep LISTEN`. If it says `lsof: command not found`, install `lsof` with your package manager or use `ports` instead.

`sudo ss -tulpn` from step 1 shows the same information and needs no extra tools.

## Ports Deployrr never asks about

Some apps publish ports that are fixed in their compose file. Deployrr doesn't ask about these ports, and doesn't check whether they are free before the install. If another program holds one, the app installs but Docker can't start it. You see Docker's error from [Symptoms](#symptoms).

| App | Fixed ports |
|---|---|
| Pi-hole | 53 (TCP and UDP), 67 (UDP) |
| Nginx Proxy Manager | 80, 443 |
| Plex | 3005, 8324, 32469, and UDP 1900, 32410, 32412, 32413, 32414 |
| Emby | 8920 |
| WG-Easy | 51820 (UDP) |
| Transmission | 51413 (TCP and UDP) |
| Resilio Sync | 55555 |
| Qdrant | 6334 |
| Weaviate | 50051 |
| Supabase | 5432, 6543 and 8443 (see the note below) |

What to know:

- The port check in the **Port Configuration** box doesn't see UDP ports. It also doesn't see the fixed ports of an app that is stopped. So you can pick, for example, port 8920 for another app while Emby is stopped. Emby then fails to start. Check this table before you type your own port.
- Port 53 is the common case. On Ubuntu, the system's own DNS service often holds it. See [Pi-hole will not start because port 53 is already in use](/apps/pi-hole-port-53-conflict/).
- UDP 1900 is used by programs that find devices on your network, such as DLNA servers. If Plex fails on that port, look for such a program on the host.
- For Nginx Proxy Manager, Deployrr only checks whether Traefik runs. A web server on the host, such as Apache or nginx, also blocks ports 80 and 443. See [Ports 80 and 443](#ports-80-and-443-traefik-and-nginx-proxy-manager).
- The PostgreSQL app also suggests port 5432. If you install Supabase after PostgreSQL, Supabase's 5432 clashes with it. Move Supabase's port as below.
- Apps that use the host's network directly, such as Netdata, Homebridge, Tailscale and ZeroTier, publish no ports in Docker. They open their own ports on the host, and Deployrr doesn't check those either.

To fix a clash on a fixed port, stop or move the other program. You can't move these ports through `.env` or the .env Editor, because there is no setting for them.

Supabase is the exception. Add one of these lines to your `.env` file, with a free port in place of `NEW_PORT`:

- `SUPABASE_POOLER_PORT=NEW_PORT` for 5432
- `SUPABASE_POOLER_PROXY_PORT=NEW_PORT` for 6543
- `SUPABASE_KONG_HTTPS_PORT=NEW_PORT` for 8443

Then go to **Tools** > **Stack Manager** > **Recreate** and pick `supabase-pooler` (for 5432 or 6543) or `supabase-kong` (for 8443). Back up `.env` first, as in [Fix B](#fix-b-change-the-port-of-an-installed-app).

Don't change a port in an app's compose file yourself. When you reinstall the app, Deployrr copies a fresh compose file over yours, and your change is gone.

## Fix A: take the suggested port during install

This is the easiest fix. It works when the **Port In Use** box appears or when you have not installed the app yet.

1. Read the number next to `Suggested:` in the **Port Configuration** box.
2. Press Enter to accept it. An empty entry also uses the suggested port.
3. Finish the install.
4. Write down the port. You open the app at `http://YOUR_SERVER_IP:PORT`. Replace `YOUR_SERVER_IP` with your server's local IP address and `PORT` with the port you chose.

If you type your own port and it is taken, Deployrr does not ask again. It shows **Port In Use** and uses the suggested port. To use a port of your own that is free, type it in the box and press Enter.

If you cancel the **Port Configuration** box, Deployrr shows `APP installation failed`. It shows no message that says you cancelled. Settings you already answered may stay in your `.env` file. Start the install again to set the port.

## Fix B: change the port of an installed app

Use this when the app is already installed and Docker reports the port as taken, or when you want a different port.

:::caution
You edit your `.env` file, which holds the settings of all your apps. A typo can break more than one app. Make a backup first, as in step 2.
:::

1. Find the name of the port setting. It is usually the app name in capitals, then `_PORT`, for example `SONARR_PORT`. It is not always so. Nginx Proxy Manager uses `NPM_ADMIN_PORT`, and apps with several ports have several settings. Look for yours with:

   ```bash
   sudo grep "_PORT=" ~/docker/.env
   ```

2. Back up the file:

   ```bash
   sudo cp ~/docker/.env ~/docker/.env.bak
   ```

3. Pick a free port. Check it with the command from [Find what uses a port](#find-what-uses-a-port). No line should print.
4. Edit the value. Use one of these two ways.

   **Option 1: the .env Editor.** This needs a Pro license. See [Edit .env values and secrets](/using-deployrr/edit-env-and-secrets/).

   1. In Deployrr, go to **Tools** > **.env Editor**.
   2. Select the port setting, for example `SONARR_PORT`.
   3. In the **Edit Environment Variable** box, replace the number and press Enter.
   4. Choose **Cancel** to leave the list. You return to **Tools**.

   The editor saves the value without quotes, for example `SONARR_PORT=8990`. This works. If you leave the value empty or unchanged, nothing is saved.

   **Option 2: a text editor.** Replace `~/docker` with the path to your Docker folder if it is different.

   ```bash
   sudo nano ~/docker/.env
   ```

   Change only the number. Keep the format of the line. Single quotes around the number, or none, both work.

5. Apply the change. This needs a Basic, Plus or Pro license.
   1. In Deployrr, go to **Tools** > **Stack Manager** > **Recreate**.
   2. At `Select an app to recreate:`, type the number of the app and press Enter. Type `all` to recreate every container, or `exit` to leave. `exit` shows `No changes made.`
   3. Watch for `Stopping APP...`, then `Recreating APP with force...`, then `APP recreated`.

   See [Stack Manager](/using-deployrr/stack-manager/#recreate).
6. Open the app at `http://YOUR_SERVER_IP:NEW_PORT`. Replace `YOUR_SERVER_IP` with your server's local IP address and `NEW_PORT` with the new port.

If the edit goes wrong, put the backup back and recreate the app again:

```bash
sudo cp ~/docker/.env.bak ~/docker/.env
```

You can also [reinstall the app](/using-deployrr/reinstall-app/) and answer the port question again.

## What to update after a port change

- **Bookmarks and shortcuts.** Change them to the new port.
- **Apps that connect to this app.** The host port changes. The app's internal port does not. As general advice, apps on the shared Docker network connect by container name and internal port, so those connections usually keep working. If an app connects by your server's IP address and the host port, change that port. See [Connect your apps to each other](/using-deployrr/connecting-apps/). For background on container names and the host IP, read [UDMS part 14: Connecting the Apps](https://www.simplehomelab.com/udms-14-docker-media-server/#Connecting_the_Apps) (manual setup).
- **Traefik.** If the app sits behind Traefik, open its file in `appdata/traefik3/rules/HOSTNAME/`, named `app-NAME.yml`. Replace `HOSTNAME` with your server's hostname and `NAME` with the app name. The file has a `url:` line such as `http://172.17.0.1:8989`. Deployrr writes it once, when it creates the file. It does not follow your `.env` file. Change the number in that line to the new port. Traefik picks up the change without a restart.
- **Deployrr Dashboard.** The app's entry keeps the old port. Go to **Tools** > **ReDash** to rebuild the entries from the ports in your `.env` file. See [Deployrr Dashboard](/using-deployrr/dashboard/).
- **Nginx Proxy Manager.** Deployrr does not create proxy hosts in NPM. If you made one for this app, update it to the new port if it uses the host port.

## Ports 80 and 443: Traefik and Nginx Proxy Manager

Traefik and Nginx Proxy Manager (NPM) both need ports 80 and 443, so you can't run both at once.

Traefik also needs ports 81 and 444. Traefik Preparation checks all four before it goes on. If one is taken, you see `Port 80 is occupied. This is needed for Traefik.` with the program that holds it, and the step stops. Stop that program, or move it to another port, then run the step again. This check doesn't cover UDP. Traefik also uses UDP 443 and 444.

- To install NPM, first set **Proxy** > **Proxy Type** to NPM. If you try to install NPM while Traefik runs, you see **Port Conflict - Cannot Install**. Stop or uninstall Traefik first.
- When you switch **Proxy** > **Proxy Type** and the other proxy is running, Deployrr warns that its container must be stopped to avoid a conflict on ports 80 and 443. It offers to stop that container. It does not remove it. If the other proxy is not running, you don't see this box.

NPM's ports 80 and 443 are fixed. Only its admin port can change. See [Nginx Proxy Manager](/reverse-proxy/nginx-proxy-manager/).

## Check it worked

1. Check that the app container is running:

   ```bash
   sudo docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
   ```

   The app shows `Up` and its new port.

2. Open `http://YOUR_SERVER_IP:PORT` in a browser. You should see the app.
