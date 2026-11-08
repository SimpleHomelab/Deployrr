---
title: Run a second copy of an app
description: Run a second instance of an app, such as Sonarr 4K next to Sonarr, by copying its Compose service into custom.yml and giving it its own name, port and folder.
type: how-to
tags:
  - app-instances
  - compose
  - traefik
applies_to: v6.0+
apps: [sonarr]
related:
  - using-deployrr/custom-yml
  - using-deployrr/bash-aliases
  - using-deployrr/connecting-apps
  - reverse-proxy/check-traefik-logs
  - docker/compose-malformed
further_reading: []
last_reviewed: 2026-11-08
status: current
old_paths: ["/docker/second-instances-of-apps"]
sources: []
sidebar:
  order: 5
---

Deployrr installs one copy of each app. If you want a second copy, for example Sonarr for 4K shows next to your normal Sonarr, you add it yourself in `custom.yml`. This page uses Sonarr as the example. The same steps work for Radarr, Lidarr and most other apps.

There is no menu option in Deployrr that installs a second copy for you.

## Before you start

- The first copy of the app is installed and works. See the [Quick start](/getting-started/quick-start/).
- `custom.yml` is turned on. Follow steps 1 to 5 in [Add your own containers with custom.yml](/using-deployrr/custom-yml/) first.
- Optional: turn on the [Bash aliases](/using-deployrr/bash-aliases/). This page uses `cdd`, `dcup` and `dclogs`.
- Optional: to put the second copy behind Traefik with the **Traefikify** menu, you need a Plus or Pro license.

All paths below are inside your Docker folder. The `cdd` alias takes you there. `HOSTNAME` is your server's hostname.

## What must be different

The second copy shares your media and downloads folders with the first. Everything else must be different:

| Setting | First copy | Second copy |
| --- | --- | --- |
| Service name | `sonarr` | `sonarr-4k` |
| Container name | `sonarr` | `sonarr-4k` |
| Host port (left side of `ports`) | `8989` | `8990` |
| Config folder | `appdata/sonarr` | `appdata/sonarr-4k` |
| Traefik file | `app-sonarr.yml` | `app-sonarr-4k.yml` |
| Subdomain | `sonarr` | `sonarr4k` |

Use any names and port you like. The port must be free on your server. The number on the right of `ports` (`8989`) stays the same, because it is the port inside the container.

## Steps

1. Go to your Docker folder.

   ```bash
   cdd
   ```

2. Open the Compose file of the first copy and read it.

   ```bash
   cat compose/$HOSTNAME/sonarr.yml
   ```

   It looks like this:

   ```yaml
   services:
     # Sonarr - TV Shows Management
     sonarr:
       image: lscr.io/linuxserver/sonarr:develop
       container_name: sonarr
       security_opt:
         - no-new-privileges:true
       restart: "no"
       profiles: ["media", "starr", "all"]
       networks:
         - default
       ports:
         - "$SONARR_PORT:8989"
       volumes:
         - $DOCKERDIR/appdata/sonarr:/config
         - $DOWNLOADSDIR:/data/downloads
         - "/etc/localtime:/etc/localtime:ro"
       environment:
         TZ: $TZ
         PUID: $PUID
         PGID: $PGID
   ```

   Your file also has a line for each media folder you set in Deployrr, for example `- $MEDIADIR1:/data/media1`. Copy those lines too if you want the second copy to see your media. The file ends with a comment line that you can ignore.

3. Check that the new port is free. Replace `8990` with the port you picked.

   ```bash
   sudo ss -tulpn | grep ':8990 '
   ```

   If this prints a line, the port is taken. Pick another number.

4. Create the config folder for the new copy.

   ```bash
   mkdir -p appdata/sonarr-4k
   ```

5. Open your custom file.

   ```bash
   nano compose/$HOSTNAME/custom.yml
   ```

6. Add the copy under `services:`. Paste the service from step 2, then change the lines marked below. If `custom.yml` already has services, add this one below them.

   ```yaml
   services:
     sonarr-4k: # changed
       image: lscr.io/linuxserver/sonarr:develop
       container_name: sonarr-4k # changed
       security_opt:
         - no-new-privileges:true
       restart: "no"
       profiles: ["media", "starr", "all"]
       networks:
         - default
       ports:
         - "8990:8989" # changed: a fixed, free port instead of $SONARR_PORT
       volumes:
         - $DOCKERDIR/appdata/sonarr-4k:/config # changed
         - $DOWNLOADSDIR:/data/downloads
         - "/etc/localtime:/etc/localtime:ro"
       environment:
         TZ: $TZ
         PUID: $PUID
         PGID: $PGID
   ```

   Keep the `profiles` line as it is. Do not change `$SONARR_PORT` in your `.env` file. The first copy still uses it.

7. Save the file.

8. Start the new service.

   ```bash
   dcup sonarr-4k
   ```

   Without the aliases, run this instead. Replace `YOUR_USER` and `HOSTNAME` with your own values.

   ```bash
   sudo docker compose --profile all -f /home/YOUR_USER/docker/docker-compose-HOSTNAME.yml up -d sonarr-4k
   ```

9. Open `http://YOUR_SERVER_IP:8990` in a browser. Replace `YOUR_SERVER_IP` with your server's local IP address. You should see the first-run screen of a new Sonarr.

## Put the second copy behind Traefik

Skip this part if you only use the app on your local network, or if **Setup Mode** is **Local**. Local mode doesn't use Traefik.

Traefik reaches each app through a small file in `appdata/traefik3/rules/HOSTNAME/`. If Traefik was running when you installed the first copy, that copy has `app-sonarr.yml` there. The second copy needs its own file. You can create it with the menu or by copying the first file.

### Option A: use Traefikify

This needs a Plus or Pro license, with Socket Proxy and Traefik Production set up and Traefik running.

1. In Deployrr, go to **Proxy** > **Traefik** > **Traefikify**.
2. Read the **Traefikify** box and confirm that you want to proceed.
3. Answer the prompts:
   - `Enter a name for the App.`: `sonarr-4k`
   - `Enter a subdomain for the App.`: `sonarr4k`. This is the default: the name without hyphens.
   - `Host IP Address of the App.`: the same IP address as in `app-sonarr.yml`, or your server's local IP address.
   - `WebUI protocol (http/https) of the App:`: `http`
   - `WebUI port number of the App:`: `8990`
4. At **Select an Authentication Method for the App**, pick the same method as your first copy. Only methods you have set up are accepted.
5. At **Pick an Exposure Method**, pick how the app is reached. In Simple Traefik mode, the only choice is **Both** (internal and external).

Deployrr creates `app-sonarr-4k.yml` and shows `File provider created for sonarr4k.` Traefik picks up the new file on its own, so you don't need to restart it. If the Deployrr Dashboard is running, Deployrr also offers to add the app to it.

### Option B: copy the file

1. Go to the rules folder.

   ```bash
   cd appdata/traefik3/rules/$HOSTNAME
   ```

2. Copy the first file.

   ```bash
   sudo cp app-sonarr.yml app-sonarr-4k.yml
   ```

3. Open the new file.

   ```bash
   sudo nano app-sonarr-4k.yml
   ```

4. Change every name and the address. Your file has more lines than shown here. The lines to change are:

   ```yaml
   http:
     routers:
       sonarr-4k-rtr: # changed from sonarr-rtr
         rule: "Host(`sonarr4k.{{env "DOMAINNAME_1"}}`)" # changed subdomain
         service: sonarr-4k-svc # changed from sonarr-svc
     services:
       sonarr-4k-svc: # changed from sonarr-svc
         loadBalancer:
           servers:
             - url: "http://YOUR_SERVER_IP:8990" # changed port
   ```

   Keep the IP address that is already in the first file. It may be the Docker bridge address, `172.17.0.1`, rather than your server's local IP. Only the port changes. Leave the middlewares, entry points and `tls` lines as they are.

5. Save the file.

Now open `https://sonarr4k.YOUR_DOMAIN`. Replace `YOUR_DOMAIN` with your own domain. Your DNS must already send `sonarr4k` to your server. A wildcard record does this.

:::caution
Router and service names must be unique across all the files in the rules folder. If two files use the same name, Traefik uses only one of them, and one app stops working.
:::

## Check it worked

1. List your containers.

   ```bash
   dps
   ```

   Both `sonarr` and `sonarr-4k` show a status of `Up`.

2. Read the logs of the new copy. Press `Ctrl+C` to stop following them.

   ```bash
   dclogs sonarr-4k
   ```

3. Open the new web address. Add a library, a download client and an indexer in the new copy. It does not share settings with the first one. To link it to your other apps, use `sonarr-4k:8989`. See [Connect your apps to each other](/using-deployrr/connecting-apps/).

If Compose prints an error when you start the service, check the indentation in `custom.yml`. If the web address does not load, read the Traefik logs.

## Related

- [Add your own containers with custom.yml](/using-deployrr/custom-yml/): turn on custom.yml and what Deployrr leaves alone.
- [Bash aliases](/using-deployrr/bash-aliases/): the `dcup`, `dcrec` and `dclogs` shortcuts.
- [Quick start](/getting-started/quick-start/): set up the Docker folder and install your first app.
