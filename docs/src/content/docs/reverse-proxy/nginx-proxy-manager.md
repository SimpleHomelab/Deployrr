---
title: Use Nginx Proxy Manager instead of Traefik
description: Pick Nginx Proxy Manager as your proxy type in Deployrr v6, install it, add a proxy host and certificate, and learn what you give up versus Traefik.
type: how-to
tags:
  - remote-access
  - domain
  - ports
  - app-networking
apps:
  - npm
  - traefik
applies_to: v6.0+
related:
  - reverse-proxy/traefik-setup
  - using-deployrr/connecting-apps
  - reverse-proxy/choose-login-method
  - getting-started/quick-start
  - networking/ufw-firewall-vps
further_reading:
  - title: "UDMS part 18: Traefik vs Nginx Proxy Manager (manual setup)"
    url: https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Traefik_vs_Nginx_Proxy_Manager
videos:
  - id: Nuo83uzTWco
    start: 223
    title: "Deployrr 6 overview: NGINX Proxy Manager as a Traefik alternative"
last_reviewed: 2026-11-13
status: current
old_paths: []
sources: []
sidebar:
  order: 18
---

Nginx Proxy Manager (NPM) is a reverse proxy with a web page where you add each app by hand. Deployrr v6 lets you pick it instead of Traefik. This page shows how to pick it, install it, add an app, and switch back to Traefik.

For a short look at NPM in v6, watch [Deployrr 6 overview: NGINX Proxy Manager at 3:43](https://youtu.be/Nuo83uzTWco?t=223).

## Before you start

- You have a Deployrr Plus or Pro license, the same as for Traefik. On Free or Basic, the install stops at a "License Required" box. See [Licenses](/getting-started/licenses/).
- Finish the steps in the [Quick start](/getting-started/quick-start/), including **Prerequisites** with all steps done.
- Set **Setup Mode** to **Hybrid** (in **Prerequisites**). NPM needs it. **Setup Mode** is a toggle: each time you select it, it switches between Local and Hybrid. Check the box says "Hybrid mode ENABLED".
- Own a domain and point its DNS records at your public IP. For one address per app, you'd usually add an A record for the domain and a wildcard record (`*.YOUR_DOMAIN`). This is general advice; Deployrr doesn't check DNS for NPM.
- Ports 80 and 443 are free on your server. NPM always uses them. Traefik and NPM can't run together.
- If Traefik is running, Deployrr stops it for you in the first section. It does not remove it.

### What you give up compared to Traefik

With NPM, you do this work in NPM's own web page. Deployrr does not do it for you.

- **No automatic addresses.** While Traefik is stopped, Deployrr does not ask for a subdomain when you install an app and does not create a route. You add each app in NPM yourself.
- **No Traefik menu tools.** Entries such as **Traefik Mode**, **Manage Exposure**, **Traefikify**, **Un-Traefikify**, **Domain Passthrough** and **Auth Bypass** need Traefik.
- **No Security menu login apps.** Authelia, Authentik, Google OAuth, TinyAuth and **Manage Auth** need Traefik Production done and Traefik running (and a Pro license). With NPM you see a "Requirements Not Met" box that lists Traefik among other items. See [Choose a login method](/reverse-proxy/choose-login-method/) for what they do.
- **CrowdSec is untested with NPM.** **Traefik Bouncer** needs Traefik, so it is blocked. **CrowdSec** and **Firewall Bouncer** are not blocked, but the NPM intro box says: "Middleware integration (Authelia, Authentik, CrowdSec) is NOT fully tested. Manual configuration may be required." See [Block bad visitors with CrowdSec](/reverse-proxy/crowdsec/).

If you want any of these, use [Traefik](/reverse-proxy/traefik-setup/) instead. To understand how the two proxies differ, read [UDMS part 18: Traefik vs Nginx Proxy Manager](https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Traefik_vs_Nginx_Proxy_Manager) (manual setup, background only).

## Steps

### Pick NPM as your proxy type

1. In Deployrr, open **Proxy** > **Proxy Type** ("Pick a Reverse Proxy").
2. Select **NPM** ("Simple Web UI based Nginx Proxy Manager").
3. Read the intro box. It ends with "Do you want to set NPM as your Proxy Type?". Confirm.
4. If you see a "Traefik Container Running" box, agree to stop it. The box says Traefik will be stopped but not removed.
5. Read the output. If those entries are in your compose file, you see "Enabling npm.yml in compose file..." and "Disabling traefik.yml in compose file...".
6. If Deployrr stopped Traefik or changed the compose file, it ends with "Proxy Type set to: NPM". Otherwise it goes straight back to the **Proxy** menu.

The **Proxy Type** line in the **Proxy** menu now ends with "- NPM".

:::caution
If Setup Mode is **Local**, you see a "Proxy Type - Local Mode Warning" box. Your changes have no effect until you switch to **Hybrid**. Go to **Prerequisites** > **Setup Mode** and select it until it says Hybrid, then come back. If you switch Setup Mode back to **Local** later, the Proxy Type is cleared and shows "NOT SELECTED".
:::

### Install NPM

1. Open **Proxy** > **NPM** > **Install** ("Install Nginx Proxy Manager").
2. If you see a "License Required" box, you need a Plus or Pro license. If you see a "Requirements Not Met" box, fix what it lists, then start again. It lists missing Prerequisites or a Setup Mode that isn't Hybrid.
3. If you see "Proxy Type Required", go back and do [Pick NPM as your proxy type](#pick-npm-as-your-proxy-type).
4. If you see "Port Conflict - Cannot Install", Traefik is still running. Stop or uninstall Traefik first.
5. In the **Port Configuration** box, read "Enter the port for Nginx Proxy Manager (Admin web interface port):". Deployrr suggests the first free port from 81. Press Enter to accept it, or type another port from 1 to 65535. If the port is invalid or in use, Deployrr says so and uses the suggested port. See [Port already in use](/docker/port-already-in-use/).
6. Wait while the image downloads. Deployrr warns it "may take a few minutes".
7. Wait for "Nginx Proxy Manager installed successfully!".
8. Note the line "Access NPM Admin Panel: http://SERVER_IP:81". It shows your server's IP and the port you chose.

NPM also shows up on the Deployrr Dashboard, in the "Apps (Others)" section, if the Deployrr Dashboard is running.

If you run **Install** again later, an "Already Installed" box says reinstalling stops the container, recreates it with the latest image, and keeps your data. **Proxy** > **NPM** has only **Install**. It has no stop, start or uninstall entry.

:::note
Ports 80 and 443 are fixed. Deployrr doesn't let you change them for NPM.
:::

### Create your NPM admin account

Do this right after the install. Until an admin account exists, NPM shows a setup screen to whoever opens the admin page first. Anyone who reaches that page before you can create the account and take over NPM.

1. Open `http://SERVER_IP:81` in your browser. Replace `SERVER_IP` with your server's local IP address. If you chose another port, use that port.
2. Create your admin account when NPM asks. Deployrr's message says "On first access, you will be prompted to create your admin account." Deployrr does not give you a default login. Use a strong password.
3. Log in.

### Keep the admin page off the internet

The admin page controls every address and certificate NPM serves. Only you should be able to open it.

- **At home:** Don't forward the admin port on your router. Only forward ports 80 and 443 to your server.
- **On a VPS:** The admin port is open on the server's public IP. Docker publishes it past UFW, so a UFW rule doesn't block it. Block the admin port in your provider's firewall panel and allow only your SSH port, 80 and 443 from the internet. See [Set the provider firewall](/host/secure-a-vps/#set-the-provider-firewall). To open the admin page, use an SSH tunnel, for example `ssh -L 8181:localhost:81 YOUR_USER@SERVER_IP`, then browse to `http://localhost:8181`. Use your admin port in place of `81` if you chose another one.
- Don't add a proxy host for the admin page itself unless you protect it with an access list in NPM.

### Forward your router ports

This is general router setup, not a Deployrr step.

1. On your router, forward port 80 to port 80 on your Docker host.
2. Forward port 443 to port 443 on your Docker host.

For VPS firewall problems, see [Fix the UFW firewall on a VPS](/networking/ufw-firewall-vps/).

### Add a proxy host for an app

These steps happen on NPM's own screens. They come from NPM, not Deployrr, and NPM may change its labels in a new version.

1. In NPM, open **Hosts** > **Proxy Hosts**.
2. Select **Add Proxy Host**.
3. In **Domain Names**, type the address you want, for example `sonarr.YOUR_DOMAIN`. Replace `YOUR_DOMAIN` with your domain.
4. Set **Scheme** to `http`.
5. In **Forward Hostname / IP**, type the app's container name, for example `sonarr`.
6. In **Forward Port**, type the app's internal port, for example `8989`.
7. Save the host.

Use the container name and internal port, joined as `container-name:internal-port`. This works because NPM is on the same `default` Docker network as most apps. Don't type `localhost` or `127.0.0.1`, because inside the NPM container they point to NPM itself. For the name and port of each app, and for apps on host networking, see [Connect your apps to each other](/using-deployrr/connecting-apps/).

### Get a certificate

These steps also happen in NPM.

1. Open the proxy host you made and select **Edit**.
2. Open the **SSL** tab.
3. Under **SSL Certificate**, pick **Request a new SSL Certificate**.
4. Turn on **Force SSL**.
5. Agree to the Let's Encrypt terms and save.

NPM asks Let's Encrypt for the certificate. This works only if the domain points to your public IP and ports 80 and 443 reach your server. For a wildcard certificate, NPM needs a DNS challenge. Set that up in NPM with your DNS provider's token. Deployrr does not store a Cloudflare token for NPM.

## Check it worked

1. Open the **Proxy** menu in Deployrr. The NPM line should end with "- Running". The NPM line only shows a status while Proxy Type is NPM. If NPM is stopped, it shows "- Not Installed". Run `sudo docker ps -a` to see whether the `npm` container exists.
2. Open `https://sonarr.YOUR_DOMAIN` in your browser, using the address you added.
3. Check that the browser shows a padlock and the app's login page.
4. Run this to check the container:

   ```bash
   dps
   ```

   If you didn't install the bash aliases, run:

   ```bash
   sudo docker ps -a
   ```

   You should see `npm` with a status that starts with "Up".

## Switch back to Traefik

1. Open **Proxy** > **Proxy Type**.
2. Select **Traefik** and confirm the intro box.
3. When the "NPM Container Running" box appears, agree. NPM is stopped, not removed.
4. If Deployrr stopped NPM or changed the compose file, you see "Proxy Type set to: Traefik".
5. If you never set up Traefik before, follow [Set up Traefik](/reverse-proxy/traefik-setup/) from **Preparation**. If you did set it up before, skip this step. Running Preparation again warns "previous setup may be overwritten".

If you set up Traefik before and its line in the **Proxy** menu shows "Not Running", the Traefik menu has no start option. Open **Tools** > **Stack Manager** > **Up** (needs a Basic, Plus or Pro license). It starts every enabled app, including Traefik.

As a fallback, start the container yourself with Docker. This works only if the container still exists. A Stack Manager **Up** or **Update Stack** run while Traefik's line is disabled may have removed it.

```bash
sudo docker start traefik
```

Your proxy hosts in NPM do not move to Traefik. Traefik needs its own routes for your apps. For router forwards and moving your apps, see [Switch between Traefik and Nginx Proxy Manager](/reverse-proxy/switch-traefik-npm/).

## Related

- [Set up Traefik](/reverse-proxy/traefik-setup/): the other proxy type, with automatic addresses for your apps.
- [Connect your apps to each other](/using-deployrr/connecting-apps/): container names and internal ports for the Forward Hostname / IP box.
- [Choose a login method for your apps](/reverse-proxy/choose-login-method/): the login options that need Traefik.
- [Quick start](/getting-started/quick-start/): Prerequisites and Setup Mode.
- [Fix the UFW firewall on a VPS](/networking/ufw-firewall-vps/): fix blocked ports on a VPS.
- [Switch between Traefik and Nginx Proxy Manager](/reverse-proxy/switch-traefik-npm/): what to stop, start and change on your router.
