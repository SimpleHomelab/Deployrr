---
title: Put any app behind Traefik with Traefikify
description: Use Traefikify to give an app on any machine an HTTPS address and a login method through Traefik, and remove it again with Un-Traefikify.
type: how-to
tags:
  - traefik
  - auth
  - remote-access
applies_to: v6.0+
related:
  - reverse-proxy/traefik-setup
  - reverse-proxy/choose-login-method
  - reverse-proxy/multi-server-same-domain
  - using-deployrr/dashboard
  - reverse-proxy/setup-auth-bypass-using-file-provider
further_reading:
  - title: "UDMS part 18: Adding non-Docker or external apps behind Traefik"
    url: "https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Adding_non-Docker_or_External_Apps_Behind_Traefik"
videos:
  - id: rdqbAr0TFnQ
    start: 3862
    title: "Deployrr 5 walkthrough: Traefikify an app"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: 6S9PwhAlZUs
    start: 543
    title: "Traefik guide: External apps (HTTP) behind Traefik with a file provider"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
  - id: ldytlKJmPX4
    start: 321
    title: "Traefik guide: Proxmox web UI (HTTPS, self-signed) behind Traefik"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
last_reviewed: 2026-11-10
status: current
old_paths: []
sources: []
---

Traefikify puts an app behind your Traefik. The app can run on the same server, on another machine, or on a device such as a NAS. You get an address like `https://SUBDOMAIN.YOUR_DOMAIN` and a login method of your choice. Un-Traefikify removes the app from Traefik again.

## Before you start

- You have a Plus or Pro license.
- All **Prerequisites** steps are done, and the **Socket Proxy** app is running.
- Traefik Production is done and Traefik is running. See [Set up Traefik](/reverse-proxy/traefik-setup/).
- The app is running, and you can open it from your Deployrr server at `http://IP_ADDRESS:PORT`.
- If you want a login method, set it up first. See [Choose a login method](/reverse-proxy/choose-login-method/).
- Your DNS sends the subdomain you plan to use to your server.

If something is missing, Deployrr shows a **Requirements Not Met** box that lists it, and stops.

## Steps

### Put an app behind Traefik

1. In Deployrr, go to **Proxy** > **Traefik** > **Traefikify**. When your server already has app rules files, the menu line shows how many, for example `2 App(s)`.
2. Read the **Traefikify** box and select **Yes** to proceed.
3. At "Enter a name for the App", type a lowercase name. Use `-` or `_` instead of a space.
4. If a file for that name already exists, Deployrr shows **File Provider Exists** and asks if you want to overwrite it. Select **Yes** to replace it. Select **No** and Deployrr says "No changes made".
5. Answer the next prompts one at a time:
   - **Subdomain:** the default is the name without hyphens. Use lowercase and no spaces.
   - **Host IP Address of the App:** the IPv4 address of the machine that runs the app, for example `192.168.1.100`.
   - **WebUI protocol (http/https) of the App:** type `http` or `https`. Most apps use `http`. Pick `https` only if the app answers on HTTPS alone.
   - **WebUI port number of the App:** the port you use to open the app.
6. At **Pick an Authentication Method**, select a method. See the list below.
7. At **Pick an Exposure Method**, select where the app can be reached. See the list below.
8. Wait for the connection test. See [If you see "could not be verified"](#if-you-see-could-not-be-verified).
9. Read the **Traefikify - Success** box. It shows the address of your app.

Traefik picks up the new file on its own. You don't need to restart it.

To see these prompts filled in, watch [Deployrr 5 walkthrough: Traefikify an app at 1:04:22](https://youtu.be/rdqbAr0TFnQ?t=3862) (shows Deployrr v5; menus differ in v6).

Deployrr creates a file named `app-NAME.yml` in `appdata/traefik3/rules/HOSTNAME/` inside your Docker folder. `NAME` is the name you typed, in lowercase, and `HOSTNAME` is your server's hostname.

To see what such a file does and how it is made by hand, watch [Traefik guide: External apps (HTTP) behind Traefik at 9:03](https://youtu.be/6S9PwhAlZUs?t=543) (manual Docker Compose setup). For background, read [UDMS part 18: Adding non-Docker or external apps behind Traefik](https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Adding_non-Docker_or_External_Apps_Behind_Traefik) (manual setup; paths and names differ from Deployrr).

If a prompt gets an empty answer, or the protocol is not `http` or `https`, Deployrr stops with a message such as "Port number missing" and creates no file. It then says "File provider addition aborted - you may start over if needed". Run **Traefikify** again.

### Login methods

The list shows the methods you can use:

- **Authelia**, **Authentik**, **Google OAuth** and **TinyAuth** show only when that app is running. They are marked **Recommended**.
- **Basic HTTP Auth** is marked **Discouraged**.
- **No Authentication** is marked **Not Recommended**. The app may still have its own login.

Some choices are refused for some app names. For example, Basic HTTP Auth is not offered for `portainer`, `open-webui`, `kavita`, `flame`, `paperless-ngx` or `flowise`. No Authentication is not offered for `wg-easy`. Deployrr shows a message and asks you to pick again.

**Skip** means no authentication. Deployrr says "Authentication selection skipped, using no authentication".

### Exposure choices

- In Simple Traefik mode, the only choice is **Both**. The app is reachable on your LAN and over the internet.
- In Advanced mode, you can also pick **Internal** (your LAN only) or **External** (over the internet only). Switch modes under **Proxy** > **Traefik** > **Traefik Mode**. See [Simple vs Advanced Traefik mode](/reverse-proxy/simple-vs-advanced-mode/) before you switch.

If you cancel this box, Deployrr uses **Both**. To change the choice later, see **Manage Exposure** in the same menu. To limit an app to your LAN, see [Allow only some IP addresses to reach an app](/reverse-proxy/restrict-access-using-ip-allowlist/).

### Add the app to the Dashboard

If the Deployrr Dashboard is running, Deployrr asks **Add to Deployrr Dashboard?** after the success box. The question says the app will appear in the **Remote Apps** section. On the Dashboard, that section is named **Apps (Remote)**.

1. Select **Yes**.
2. At **Dashboard - App Name**, type the name to show. The default is your subdomain with a capital first letter.
3. At **Dashboard - Icon**, type an icon name or leave the default. The default is `si-` and your subdomain. Use `si-NAME` for Simple Icons, `mdi-NAME` for Material Design Icons or `sh-NAME` for Selfh.st icons.
4. At **Dashboard - Description**, type a description. The default is the app's address.

Deployrr then says "Added NAME to Deployrr Dashboard". If it says "Could not add to Dashboard (Dashboard may not be running)", start the Dashboard and add the app with **Dashify**. See [Set up and maintain the Deployrr Dashboard](/using-deployrr/dashboard/).

### Put an app that only uses HTTPS behind Traefik

Some apps only answer on HTTPS with a self-signed certificate. Type `https` at the **WebUI protocol** prompt and use the app's HTTPS port. Deployrr then creates the file so that Traefik does not check the app's certificate. Your visitors still get your normal Traefik certificate. To understand why, watch [Traefik guide: Proxmox web UI behind Traefik at 5:21](https://youtu.be/ldytlKJmPX4?t=321) (manual Docker Compose setup).

### Remove an app with Un-Traefikify

Un-Traefikify has the same requirements as Traefikify.

1. Optional: make a backup from the **Tools** menu first. The delete warning recommends it.
2. In Deployrr, go to **Proxy** > **Traefik** > **Un-Traefikify**.
3. In the **Traefik File Providers** list, select the file to delete, for example `app-jellyfin.yml`. The box shows how many files it found.
4. Select **Delete**.
5. Read the warning and select **Yes** to delete the file. Select **No** to keep it. Deployrr then says the file "was not deleted".
6. Read the success box. It says "Traefik will automatically stop routing to this app."
7. If the Dashboard is running and has an entry for the app, Deployrr asks **Remove from Dashboard?**. Select **Yes** to remove it. A **Dashboard Updated** box confirms it.
8. The list shows again, so you can delete more files. Select **Back** when you are done.

If you see "No file providers found", there is nothing to remove.

:::caution
The list shows every app rules file in the rules folder. That includes files Deployrr made when you installed apps from its menu behind Traefik, and the file for the Deployrr Dashboard that Traefik Production makes. It is not only apps you added with Traefikify. Delete a file only if you want that app to stop being reachable through Traefik.
:::

Un-Traefikify deletes only the rules file and, if you agree, the Dashboard entry. The app itself keeps running, and your DNS records stay as they are.

## If you see "could not be verified"

After the prompts, Deployrr tests whether it can reach the app. If the test fails, you see this. Your address and port will differ:

```txt
Connection to http://192.168.1.100:8123 could not be verified
Some apps may take time to start. Proceeding anyway...
```

It means Deployrr got no answer from that IP address and port. Setup still goes on and the file is still created. If the app is just slow to start, you can ignore the warning.

If the app is up and the address still does not work, check these:

1. The IP address is the one of the machine that runs the app, not your Deployrr server (unless they are the same).
2. The port is the WebUI port of the app.
3. The app is running. Open `http://IP_ADDRESS:PORT` in a browser on your network.
4. No firewall on the app's machine blocks the port from your Deployrr server.

To fix a wrong value, run **Traefikify** again with the same name and overwrite the file. You can also edit `appdata/traefik3/rules/HOSTNAME/app-NAME.yml` and change the address on the `url:` line. Traefik picks up the change on its own.

## Check it worked

1. Open `https://SUBDOMAIN.YOUR_DOMAIN` in a browser. Replace `SUBDOMAIN` and `YOUR_DOMAIN` with your own values.
2. You should see the app, or your login page if you picked a login method.
3. Turn off Wi-Fi on your phone and open the same address. Skip this if you picked **Internal**.
4. After Un-Traefikify, the same address should no longer open the app.

If the address does not load, [read the Traefik logs](/reverse-proxy/check-traefik-logs/).

## Related

- [Use one domain across several servers](/reverse-proxy/multi-server-same-domain/): Traefikify for apps on other Deployrr servers.
- [Home Assistant behind Traefik](/apps/home-assistant-behind-traefik/): a Traefikify example that needs one extra setting on the app side.
- [Run a second copy of an app](/using-deployrr/second-app-instances/): use Traefikify for a second copy of an app.
- [Let mobile apps skip the login page (Auth Bypass)](/reverse-proxy/setup-auth-bypass-using-file-provider/): Traefikify always makes a normal file, so bypass is added by hand.
- [Choose a login method](/reverse-proxy/choose-login-method/): pick the method for the authentication prompt.
