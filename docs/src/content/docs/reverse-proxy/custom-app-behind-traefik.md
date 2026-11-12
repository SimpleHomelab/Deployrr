---
title: Protect a custom.yml app with Traefik and a login
sidebar:
  order: 11
  label: Custom app behind Traefik
description: Give a container from your own custom.yml an HTTPS address and a login page, either with Traefikify or with Traefik labels you add yourself.
type: how-to
tags:
  - traefik
  - auth
  - compose
applies_to: v6.0+
apps: [traefik]
related:
  - reverse-proxy/traefikify
  - reverse-proxy/edit-traefik-rules-files
  - reverse-proxy/choose-login-method
  - using-deployrr/custom-yml
  - reverse-proxy/app-404-or-502
further_reading:
  - title: "UDMS part 18: Portainer behind Traefik using Docker labels"
    url: https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Portainer_Behind_Traefik_using_Docker_Labels
  - title: "UDMS part 19: Putting Docker services behind Authelia with labels"
    url: https://www.simplehomelab.com/udms-19-authelia-docker-compose/#Docker_Labels_Method
videos:
  - id: rdqbAr0TFnQ
    start: 5396
    title: "Deployrr 5 walkthrough: Put a custom app behind Traefik with Traefikify"
    note: Shows Deployrr v5. Menus and steps differ in v6.
  - id: 6S9PwhAlZUs
    start: 306
    title: "Traefik 3 guide: Docker labels for an app behind Traefik"
    note: Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens.
  - id: UIq8PLZHBtk
    start: 1739
    title: "Authelia guide: Change an app's chain to chain-authelia"
    note: Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens.
last_reviewed: 2026-11-12
status: current
old_paths: []
sources: []
---

Deployrr does not put a container from your own `custom.yml` behind Traefik for you. You do it yourself, with a rules file or with labels. This page shows both ways and when to pick each.

- **Option 1: Traefikify.** Deployrr asks a few questions and writes a rules file. The container publishes a port on your server. Pick this if you have a Plus or Pro license and want menus to manage the login later.
- **Option 2: Labels.** You add Traefik labels to the service in `custom.yml`. The container does not need to publish a port. It needs no license beyond the one for Traefik setup. You edit the labels by hand when you change something later.

## Before you start

- `custom.yml` is turned on and your service runs. See [Add your own containers with custom.yml](/using-deployrr/custom-yml/).
- Traefik is set up and running. See [Set up Traefik](/reverse-proxy/traefik-setup/).
- The login method you want is installed. See [Choose a login method](/reverse-proxy/choose-login-method/). **No Authentication** and **Basic HTTP Auth** are there after Traefik setup. The other methods are apps you install first.
- A wildcard DNS record (`*.YOUR_DOMAIN`) that you created, and that **Prerequisites** > **Domain Checks** verified, covers every new subdomain. Replace `YOUR_DOMAIN` with your domain. Without a wildcard, add a record for the new name first.
- You know which port the app listens on inside the container. The image's page on Docker Hub usually says.

## Option 1: Traefikify

Traefikify needs a Plus or Pro license and the **Hybrid** setup mode. See [Licenses](/getting-started/licenses/) and [Setup Mode: Local or Hybrid](/getting-started/setup-mode/).

1. Open `custom.yml` and give your service a published port. The number on the left is the port on your server. The number on the right is the port inside the container. Pick a left number no other app uses.

   ```yaml
   services:
     myapp:
       image: YOUR_IMAGE
       container_name: myapp
       restart: unless-stopped
       ports:
         - "8095:80"
   ```

   Replace `YOUR_IMAGE` with your image. Change `80` to the container port from the image's page.

2. Apply the change.

   ```bash
   dcup myapp
   ```

3. Open `http://YOUR_SERVER_IP:8095` in a browser on your network. Replace `YOUR_SERVER_IP` with your server's local IP address. You should see the app.
4. In Deployrr, go to **Proxy** > **Traefik** > **Traefikify**.
5. Enter a name and a subdomain. The name becomes the file name `app-NAME.yml`. Use a name that differs from any router name in your own labels.
6. At **Host IP Address of the App**, enter your server's local IP address. There is no default.
7. At **WebUI protocol**, enter `http`, unless the app answers on HTTPS only.
8. At **WebUI port number of the App**, enter the left number from step 1, such as `8095`.
9. Pick a login method and an exposure method.

See [Put any app behind Traefik with Traefikify](/reverse-proxy/traefikify/) for every prompt. To see an app from a hand-made compose file put behind Traefik this way, watch [Deployrr 5 walkthrough: Put a custom app behind Traefik with Traefikify at 1:29:56](https://youtu.be/rdqbAr0TFnQ?t=5396) (shows Deployrr v5; menus differ in v6).

:::note
Instead of your server's IP address, you can enter the Docker bridge IP. It is usually `172.17.0.1`. To find yours, look for "docker0 network IP" in **Prerequisites** > **System Checks**. It is also the `DOCKER0_IP` line in the `.env` file in your Docker folder.
:::

The published port stays open. Anyone on your network can still open `http://YOUR_SERVER_IP:8095` without the login. If that matters, use Option 2, which needs no published port.

Deployrr writes a rules file named `app-NAME.yml`. After that, **Security** > **Manage Auth** (Pro) and **Proxy** > **Traefik** > **Manage Exposure** (Plus or Pro) list it, and a saved change needs no restart. To edit the file by hand, see [Edit Traefik rules files safely](/reverse-proxy/edit-traefik-rules-files/).

## Option 2: Labels in custom.yml

With labels, Traefik reaches the container over the `traefik_proxy` network. It uses the port inside the container, so you do not publish a port.

1. Open `custom.yml` and add the labels and the network to your service.

   ```yaml
   services:
     myapp:
       image: YOUR_IMAGE
       container_name: myapp
       restart: unless-stopped
       networks:
         - default
         - traefik_proxy
       labels:
         - "traefik.enable=true"
         - "traefik.http.routers.myapp-rtr.entrypoints=websecure-internal,websecure-external"
         - "traefik.http.routers.myapp-rtr.rule=Host(`myapp.$DOMAINNAME_1`)"
         - "traefik.http.routers.myapp-rtr.middlewares=chain-basic-auth@file"
         - "traefik.http.routers.myapp-rtr.service=myapp-svc"
         - "traefik.http.services.myapp-svc.loadbalancer.server.port=80"
   ```

2. Change these values:
   - Replace `YOUR_IMAGE` with your image.
   - Replace each `myapp` in the labels with your own short name. Router and service names must be unique across all your apps. See [Two files use the same names](/reverse-proxy/app-404-or-502/#two-files-use-the-same-names).
   - Replace `myapp` in `Host(...)` with the subdomain you want.
   - Change `80` to the port inside the container.
   - Change `chain-basic-auth` to the chain for your login method. See the table below.

3. Save the file and apply it.

   ```bash
   dcup myapp
   ```

Keep `@file` after the chain name. Leave `$DOMAINNAME_1` as it is. It is your domain from your `.env` file.

To see the same idea built by hand, watch [Traefik 3 guide: Docker labels for an app behind Traefik at 5:06](https://youtu.be/6S9PwhAlZUs?t=306) (manual setup; its network is called `t3_proxy`, in Deployrr v6 it is `traefik_proxy`). For background on how the labels work, read [UDMS part 18: Portainer behind Traefik using Docker labels](https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Portainer_Behind_Traefik_using_Docker_Labels) (manual setup, not the steps to follow in Deployrr v6).

### Chain names

| Chain | Login method |
| --- | --- |
| `chain-no-auth` | No Authentication |
| `chain-basic-auth` | Basic HTTP Auth |
| `chain-authelia` | Authelia |
| `chain-authentik` | Authentik |
| `chain-oauth` | Google OAuth |
| `chain-tinyauth` | TinyAuth |

Deployrr does not check a label you write. Traefik setup creates only `chain-basic-auth` and `chain-no-auth`. For any other chain, install that login method first.

### Change the login or exposure later

Edit the label yourself.

1. In `custom.yml`, change the chain in the `middlewares` label, for example to `chain-authelia@file`.
2. Run `dcup myapp` again. Compose recreates the container because its labels changed.

To watch this change made once, see [Authelia guide: Change an app's chain to chain-authelia at 28:59](https://youtu.be/UIq8PLZHBtk?t=1739) (manual setup). For background, read [UDMS part 19: Putting Docker services behind Authelia with labels](https://www.simplehomelab.com/udms-19-authelia-docker-compose/#Docker_Labels_Method) (manual setup).

Do the same for exposure, in the `entrypoints` label:

| Entry points | Reachable |
| --- | --- |
| `websecure-internal,websecure-external` | On your LAN and from the internet |
| `websecure-internal` | On your LAN only |
| `websecure-external` | From the internet only |

The difference between these three only holds in Advanced mode. In Simple mode your router sends ports 80 and 443 to the internal entry points. See [Simple vs Advanced Traefik mode](/reverse-proxy/simple-vs-advanced-mode/).

:::caution
**Manage Auth** can list `custom.yml` as one entry named `CUSTOM` when it has a chain label. Don't use it there. It cannot apply the change to one service of that file. For apps in `custom.yml`, change the `middlewares` label yourself and run `dcup SERVICE_NAME`. **Manage Exposure** lists only rules files, so it does not see labels in `custom.yml`.
:::

## Check it worked

1. Open `https://SUBDOMAIN.YOUR_DOMAIN` in a private browser window. Replace `SUBDOMAIN` and `YOUR_DOMAIN` with your own values.
2. You see your login page, or the app if you picked **No Authentication**.
3. Log in. The app opens.
4. If you set the app to **External** or **Both** in Advanced mode, turn off Wi-Fi on your phone and open the same address.

## If it does not work

**404 page not found.** Traefik has no route for the address. Check these:

- **Option 2:** `traefik.enable=true` is in the labels. Without it, Traefik ignores the container.
- **Option 2:** the service lists `traefik_proxy` under `networks:`. Run `dcup myapp` again after you add it.
- The subdomain in the browser matches the `Host(...)` label or the `rule:` line in the rules file.
- In Advanced mode, the exposure fits where you are. An app set to **Internal** gives a 404 from outside your home.
- No other app uses the same `-rtr` or `-svc` name.
- The login chain belongs to a method that is installed. If not, the route fails. The Traefik log says `middleware "chain-NAME@file" does not exist`. Install the method or use a chain you have.

**502 Bad Gateway or Gateway Timeout.** Traefik found the route but not the app. Check the port:

- **Option 1:** use the host port, the left number in `ports:`.
- **Option 2:** use the container port, the number inside the container.
- The app is running. Run `dps` and look for a status that starts with `Up`. It also lists stopped containers.

For the full checklist, see [One app behind Traefik shows 404, 502 or Gateway Timeout](/reverse-proxy/app-404-or-502/). To read the logs, see [Read the Traefik logs](/reverse-proxy/check-traefik-logs/).

If the app needs to talk to another container, see [Connect your apps to each other](/using-deployrr/connecting-apps/).

## Related

- [Put any app behind Traefik with Traefikify](/reverse-proxy/traefikify/): every prompt in Option 1.
- [Edit Traefik rules files safely](/reverse-proxy/edit-traefik-rules-files/): change the address, login or exposure of a rules file app.
- [Choose a login method](/reverse-proxy/choose-login-method/): install and compare login methods.
- [Add your own containers with custom.yml](/using-deployrr/custom-yml/): turn on `custom.yml` and apply changes.
- [One app behind Traefik shows 404, 502 or Gateway Timeout](/reverse-proxy/app-404-or-502/): fix an app that does not open.
