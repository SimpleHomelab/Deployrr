---
title: Change the subdomain of an app you already installed
sidebar:
  order: 9
  label: Change an app's subdomain
description: Change the address of an installed app, for example from plex to media, by editing its Traefik file. Also find where login and exposure are changed.
type: how-to
tags:
  - traefik
  - domain
  - auth
applies_to: v6.0+
apps: [traefik]
related:
  - reverse-proxy/app-404-or-502
  - using-deployrr/dashboard
  - reverse-proxy/choose-login-method
  - reverse-proxy/simple-vs-advanced-mode
  - using-deployrr/reinstall-app
further_reading:
  - title: "UDMS part 18: Docker labels vs the file provider"
    url: https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Docker_Labels_vs_File_Provider
videos:
  - id: 6S9PwhAlZUs
    start: 693
    title: "Traefik 3 guide: editing an app's file provider (subdomain and domain variable)"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
  - id: rdqbAr0TFnQ
    start: 4001
    title: "Deployrr 5 walkthrough: Manually adding apps to the Dashboard"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
last_reviewed: 2026-11-13
status: current
old_paths: []
sources: []
---

Deployrr asks for an app's subdomain once, when you install it. After that, no menu changes it. This page shows how to change it by editing the app's Traefik file, or the compose file for the Traefik dashboard and the login apps. It also tells you which menu changes the app's login method and exposure.

## What the install asks

When Traefik is running and the app supports Traefik, the install asks up to three questions. It asks them even if you have not installed the Deployrr Dashboard. Authelia, Authentik, OAuth and TinyAuth get none of them.

| Question | What it does | Change it later |
| --- | --- | --- |
| **Traefik Subdomain** | Sets the address: `https://SUBDOMAIN.YOUR_DOMAIN`. The default is the app's name without hyphens. Cancel or an empty box uses the default. Deployrr turns capitals into lowercase and removes spaces. | [Edit the app's file](#steps) |
| **Pick an Authentication Method** | Sets who must log in before they see the app. **Skip** gives the app No Authentication. | [Manage Auth](#change-the-login-method) |
| **Pick an Exposure Method** | Sets whether the app opens from home, from the internet or both. Deployrr asks this only in Advanced mode, where the Cancel button reads **Default (Internal)**. In Simple mode the app is set to Both without a question. | [Manage Exposure](#change-the-exposure) |

If your `.env` file in the Docker folder already has a line such as `PAPERLESSNGX_SUBDOMAIN=docs`, Deployrr uses that value and skips the **Traefik Subdomain** box. The line starts with the app's name in capitals, with no hyphens or underscores, followed by `_SUBDOMAIN`.

Deployrr saves your answers in one file for the app, named `app-NAME.yml`. It sits in `appdata/traefik3/rules/HOSTNAME/` inside your Docker folder. `NAME` is the app's name and `HOSTNAME` is your server's hostname.

## Before you start

- The app is installed and opens at its current `https://` address.
- You can open a terminal on the server.
- You know the new subdomain. Use lowercase letters, with no spaces.
- Your DNS has a wildcard record (`*.YOUR_DOMAIN`), as [Set up Traefik](/reverse-proxy/traefik-setup/) asks. If you made a separate DNS record for each app instead, add one for the new name first. Replace `YOUR_DOMAIN` with your domain.

Your Traefik certificate covers your domain and every subdomain of it, so a new name needs no new certificate.

:::note
The Traefik dashboard, Authelia, Authentik, Google OAuth and TinyAuth have no `app-NAME.yml` file. See [Traefik dashboard and login apps](#traefik-dashboard-and-login-apps) for them. The Deployrr Dashboard does have one, `app-deployrr-dashboard.yml`. Its default subdomain is `deployrr`. You edit it the same way.
:::

## Steps

You can't change the subdomain by reinstalling the app. If the app already has its file, a reinstall asks the three questions again but keeps the old file. The Dashboard entry can then show the new name while Traefik still uses the old one. If that happened, change the Dashboard entry to match the file, as in [Update the Deployrr Dashboard](#update-the-deployrr-dashboard). See [Reinstall an app and keep its data](/using-deployrr/reinstall-app/#change-login-or-exposure).

1. Go to your Docker folder.

   ```bash
   cdd
   ```

   Without the aliases, use `cd YOUR_DOCKER_FOLDER`. Replace `YOUR_DOCKER_FOLDER` with the path to your Docker folder.

2. List the app files and find the one for your app.

   ```bash
   sudo ls appdata/traefik3/rules/$HOSTNAME/
   ```

3. Copy the file to your home folder. Keep the copy outside the rules folder. Replace `NAME` with the app's name.

   ```bash
   sudo cp appdata/traefik3/rules/$HOSTNAME/app-NAME.yml ~/app-NAME.yml.bak
   ```

4. Open the file.

   ```bash
   sudo nano appdata/traefik3/rules/$HOSTNAME/app-NAME.yml
   ```

5. Find the `rule:` line.

   ```yaml
   rule: "Host(`OLD_SUBDOMAIN.{{env "DOMAINNAME_1"}}`)"
   ```

6. Replace only the old subdomain with the new one. Leave `{{env "DOMAINNAME_1"}}` and the quotes as they are.

   ```yaml
   rule: "Host(`NEW_SUBDOMAIN.{{env "DOMAINNAME_1"}}`)"
   ```

   If your file has a second `rule:` line (for example one you made by hand or under v5), change it too.

7. Save the file and close nano. Press `Ctrl+O`, `Enter`, then `Ctrl+X`.

Traefik picks up the saved file on its own. You don't need to restart it. To see a file like this edited by hand, watch [Reverse proxy guide: editing an app file at 11:33](https://youtu.be/6S9PwhAlZUs?t=693) (manual Docker Compose setup).

To understand why the address lives in this file and not in Docker labels, read [UDMS part 18: Docker labels vs the file provider](https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Docker_Labels_vs_File_Provider) (manual setup).

Do the same for an app you added with [Traefikify](/reverse-proxy/traefikify/). Its file has the same `rule:` line.

## Update the Deployrr Dashboard

The [Deployrr Dashboard](/using-deployrr/dashboard/) keeps its own copy of the address. Changing the file does not change it. A remote entry usually shows the address on two lines: the link and the description. At install, and after **Manage Exposure**, an Internal app gets a local link only.

If you use Advanced mode and installed the app from the Apps menu, the quick way is this:

1. Open **Proxy** > **Traefik** > **Manage Exposure**.
2. Select the app and select **Change**.
3. Pick the exposure the app already has, then select **Apply**.

Manage Exposure rewrites the app's Dashboard entries from the subdomain in the file. It does not update an app you added only with Traefikify.

Otherwise, edit the entry by hand:

1. Open `services.yaml` and find the old address.

   ```bash
   sudo grep -n "OLD_SUBDOMAIN" appdata/deployrr-dashboard/config/services.yaml
   ```

2. Open the file, change the old subdomain to the new one on those lines, and save. Change both lines of a remote entry.

   ```bash
   sudo nano appdata/deployrr-dashboard/config/services.yaml
   ```

3. Refresh the Dashboard in your browser.

Leave the comment lines in the file alone. See [Edit the dashboard files](/using-deployrr/dashboard/#edit-the-dashboard-files). To see an entry added by hand, watch [Deployrr 5 walkthrough: Manually adding apps to the Dashboard at 1:06:41](https://youtu.be/rdqbAr0TFnQ?t=4001) (shows Deployrr v5; menus differ in v6, but the `services.yaml` file works the same way).

**Tools** > **ReDash** also reads the new subdomain from the file for apps you installed from the Apps menu. But it rebuilds the whole app list and drops hand edits to `services.yaml`. It also adds a local and a remote entry for every app while Traefik runs, whatever the app's exposure. For an entry you added through the Traefikify or Dashify Dashboard dialogs, it puts back the old address. ReDash first saves the old file as `services.DATE_TIME.yaml` in the same folder.

## Traefik dashboard and login apps

These apps get their address from a Docker label in their own file in `compose/HOSTNAME/`, not from a rules file. See [Apps that use Docker labels](/reverse-proxy/app-404-or-502/#apps-that-use-docker-labels). A login app also keeps its own address in a second place. Change every place in the table, or logins send people to the old address.

| App | File in `compose/HOSTNAME/` | Also change |
| --- | --- | --- |
| Traefik dashboard | `traefik.yml` | Nothing else. |
| Authelia | `authelia.yml` | `rd=https://authelia.` in `appdata/traefik3/rules/HOSTNAME/middlewares-authelia.yml`, and `authelia_url:` in `appdata/authelia/configuration.yml`. |
| Authentik | `authentik.yml` | Any address you typed into Authentik's admin pages that starts with `https://authentik.`. |
| Google OAuth | `oauth.yml` | The `AUTH_HOST=` line in the same file, and the redirect URI in your Google Cloud project. |
| TinyAuth | `tinyauth.yml` | The `TINYAUTH_APPURL=` line in the same file, and the callback URL at Google or GitHub if you set up that login. |

:::caution
Deployrr keeps your edited compose file when you install a login app again or rerun Traefik **Preparation**. You get a fresh file with the default address only after you delete the app in Stack Manager and install it again. Installing Authelia again does replace `configuration.yml` (it saves the old one as `configuration_DATE.yml` in `appdata/authelia/`) and `middlewares-authelia.yml` (no backup), so redo step 5 after that. Deployrr's own messages keep showing the default address.
:::

1. Go to your Docker folder and back up the file. Replace `NAME` with the file name from the table, without `.yml`.

   ```bash
   cdd
   sudo cp compose/$HOSTNAME/NAME.yml ~/NAME.yml.bak
   ```

   For Authelia, also back up `middlewares-authelia.yml` and `configuration.yml` the same way.

2. Open the file.

   ```bash
   sudo nano compose/$HOSTNAME/NAME.yml
   ```

3. Find the `rule=Host(...)` label and change only the old subdomain. Leave `.$DOMAINNAME_1` as it is. For example, to change Authelia from `authelia` to `login`:

   ```yaml
   - "traefik.http.routers.authelia-rtr.rule=Host(`authelia.$DOMAINNAME_1`)"
   ```

   becomes:

   ```yaml
   - "traefik.http.routers.authelia-rtr.rule=Host(`login.$DOMAINNAME_1`)"
   ```

   Authentik has a second rule, on the `authentik-output-rtr` line. It matches every subdomain, for Authentik's outpost path only. Leave it alone.

4. For Google OAuth or TinyAuth, change the subdomain in the `AUTH_HOST=` or `TINYAUTH_APPURL=` line in the same file. Save the file and close nano.

5. For Authelia, change the subdomain in the `rd=https://authelia.` part (or the name you set before) of the `address:` line in `middlewares-authelia.yml`. Then change the `authelia_url:` line in `configuration.yml`. Leave the `domain:` lines as they are. They hold only your domain, so the subdomain doesn't matter to them.

   ```bash
   sudo nano appdata/traefik3/rules/$HOSTNAME/middlewares-authelia.yml
   sudo nano appdata/authelia/configuration.yml
   ```

6. Recreate the app. Traefik doesn't see a label change until you do.

   ```bash
   dcrec NAME
   ```

   Without the aliases, see the full command in [Apps that use Docker labels](/reverse-proxy/app-404-or-502/#apps-that-use-docker-labels).

7. Update the address outside your server:
   - Google OAuth: in your Google Cloud project, change the authorized redirect URI to `https://NEW_SUBDOMAIN.YOUR_DOMAIN/_oauth`.
   - TinyAuth: change the callback URL in the Google or GitHub app you made for TinyAuth to use the new address.
   - Authentik: Deployrr stores no other Authentik address. If you typed one into Authentik's admin pages yourself, open them at the new address and update any that still starts with `https://authentik.`.

8. Change the app's Dashboard entry by hand, as in [Update the Deployrr Dashboard](#update-the-deployrr-dashboard). **Tools** > **ReDash** reads these apps' default address, not your label, so it puts the old address back. After a ReDash, edit the entry again.

To check it, open `https://NEW_SUBDOMAIN.YOUR_DOMAIN` in a private browser window. For a login app, also open an app that uses it. You should land on the login page at the new address. If you get a 404, see [Apps that use Docker labels](/reverse-proxy/app-404-or-502/#apps-that-use-docker-labels). To undo, copy the `.bak` files back and recreate the app.

## Change the login method

Use **Security** > **Manage Auth** (Pro license), or edit the chain name in the same file. Manage Auth also lists the apps that use Docker labels. Both ways are in [Choose a login method for your apps](/reverse-proxy/choose-login-method/#with-manage-auth). The file route is under [By editing the rules file](/reverse-proxy/choose-login-method/#by-editing-the-rules-file).

## Change the exposure

Use **Proxy** > **Traefik** > **Manage Exposure**. It works in Advanced mode and needs a Plus or Pro license. See [Change it later with Manage Exposure](/reverse-proxy/simple-vs-advanced-mode/#change-it-later-with-manage-exposure).

## Check it worked

1. Open `https://NEW_SUBDOMAIN.YOUR_DOMAIN` in a private browser window. Replace both values with your own.
2. You see the app or its login page.
3. Open the old address in the same window. It no longer opens the app. It usually shows `404 page not found`.

If the new address shows an error, see [One app behind Traefik shows 404, 502 or Gateway Timeout](/reverse-proxy/app-404-or-502/). A typo in the `rule:` line is the usual cause.

## Update what used the old address

The old address stops working. Update these:

- Bookmarks in your browsers.
- Mobile and TV apps that you pointed at the old address.
- Other apps that call this app by its address.
- Any login app that lists the old address as a redirect URL, if you set one up that way. If you changed the login app's own address, see [Traefik dashboard and login apps](#traefik-dashboard-and-login-apps).
- Nextcloud only answers on addresses it trusts. Add the new one as in [Nextcloud says Access through untrusted domain](/apps/nextcloud-untrusted-domain/). If you turned on `OVERWRITEHOST`, also change `NEXTCLOUD_SUBDOMAIN` in `.env` and recreate Nextcloud.

## Undo the change

1. Copy the backup file over the changed file.

   ```bash
   sudo cp ~/app-NAME.yml.bak appdata/traefik3/rules/$HOSTNAME/app-NAME.yml
   ```

2. Change the Dashboard entry back, if you changed it. If you ran ReDash, copy back the `services.DATE_TIME.yaml` file it saved in `appdata/deployrr-dashboard/config/` over `services.yaml`.

Traefik picks up the old file on its own. Delete the `.bak` copy when you no longer need it.

To remove an app's file instead, use Un-Traefikify. See [Put any app behind Traefik with Traefikify](/reverse-proxy/traefikify/#remove-an-app-with-un-traefikify).
